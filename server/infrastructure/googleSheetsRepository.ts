import { createPrivateKey, sign } from 'node:crypto'
import {
  RSVP_COLUMNS,
  RSVP_TABS,
  type RSVPRepository,
} from '../domain/rsvpRepository.js'

export interface GoogleSheetsConfig {
  spreadsheetId: string
  clientEmail: string
  privateKey: string
}

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SAVE_TIMEOUT_MS = 20_000
const REQUEST_TIMEOUT_MS = 4_000
const MAX_ATTEMPTS = 3
const UNAVAILABLE = 'RSVP storage unavailable'

export function readGoogleSheetsConfig(
  env: NodeJS.ProcessEnv,
): GoogleSheetsConfig | null {
  const spreadsheetId = env.GOOGLE_SPREADSHEET_ID?.trim()
  const clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim()
  const privateKey = env.GOOGLE_PRIVATE_KEY?.replaceAll('\\n', '\n')
  if (!spreadsheetId || !/^[A-Za-z0-9_-]+$/.test(spreadsheetId)) return null
  if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail))
    return null
  if (!privateKey) return null
  try {
    if (createPrivateKey(privateKey).asymmetricKeyType !== 'rsa') return null
  } catch {
    return null
  }
  return { spreadsheetId, clientEmail, privateKey }
}

class GoogleRequestError extends Error {
  constructor(readonly retryable: boolean) {
    super(UNAVAILABLE)
  }
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new GoogleRequestError(true)
  }
  return value as Record<string, unknown>
}

function rows(value: unknown): unknown[][] {
  const values = object(value).values
  if (values === undefined) return []
  if (!Array.isArray(values) || !values.every(Array.isArray)) {
    throw new GoogleRequestError(true)
  }
  return values as unknown[][]
}

function spreadsheetText(value: string): string {
  return /^\s*[=+@\t\r-]/.test(value) ? `'${value}` : value
}

export function createGoogleSheetsRepository(
  config: GoogleSheetsConfig,
  fetchImpl: typeof fetch = fetch,
): RSVPRepository {
  return {
    async save(record) {
      const deadline = Date.now() + SAVE_TIMEOUT_MS
      const root = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.spreadsheetId)}`

      function remaining() {
        const milliseconds = deadline - Date.now()
        if (milliseconds <= 0) throw new GoogleRequestError(false)
        return milliseconds
      }

      async function pause(attempt: number) {
        const delay = Math.min(100 * 2 ** attempt, remaining())
        await new Promise<void>((resolve) => setTimeout(resolve, delay))
        remaining()
      }

      // Include body decoding in the timeout. The race also bounds fetch doubles or
      // transports that fail to honor AbortSignal; abort stops the real HTTP request.
      async function request(
        url: string,
        init: RequestInit,
      ): Promise<Record<string, unknown>> {
        const timeout = Math.min(REQUEST_TIMEOUT_MS, remaining())
        const controller = new AbortController()
        let timer: ReturnType<typeof setTimeout> | undefined
        try {
          return await Promise.race([
            (async () => {
              const response = await fetchImpl(url, {
                ...init,
                signal: controller.signal,
              })
              if (!response.ok) {
                throw new GoogleRequestError(
                  response.status === 408 ||
                    response.status === 429 ||
                    response.status >= 500,
                )
              }
              return object(await response.json())
            })(),
            new Promise<never>((_, reject) => {
              timer = setTimeout(() => {
                controller.abort()
                reject(new GoogleRequestError(true))
              }, timeout)
            }),
          ])
        } catch (error) {
          if (error instanceof GoogleRequestError) throw error
          // Never retain upstream bodies, guest data, credentials or network errors.
          throw new GoogleRequestError(true)
        } finally {
          clearTimeout(timer)
        }
      }

      async function retry(url: string, init: RequestInit) {
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          try {
            return await request(url, init)
          } catch (error) {
            if (
              !(error instanceof GoogleRequestError) ||
              !error.retryable ||
              attempt === MAX_ATTEMPTS - 1
            )
              throw error
            await pause(attempt)
          }
        }
        throw new GoogleRequestError(false)
      }

      try {
        const issuedAt = Math.floor(Date.now() / 1000)
        const header = Buffer.from(
          JSON.stringify({ alg: 'RS256', typ: 'JWT' }),
        ).toString('base64url')
        const payload = Buffer.from(
          JSON.stringify({
            iss: config.clientEmail,
            scope: 'https://www.googleapis.com/auth/spreadsheets',
            aud: TOKEN_URL,
            iat: issuedAt,
            exp: issuedAt + 3600,
          }),
        ).toString('base64url')
        const unsigned = `${header}.${payload}`
        const signature = sign(
          'RSA-SHA256',
          Buffer.from(unsigned),
          config.privateKey,
        ).toString('base64url')
        const token = await retry(TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: `${unsigned}.${signature}`,
          }).toString(),
        })
        if (typeof token.access_token !== 'string' || !token.access_token)
          throw new GoogleRequestError(false)
        const headers = {
          Authorization: `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        }
        const metadataUrl = `${root}?fields=${encodeURIComponent('sheets.properties(sheetId,title)')}`
        const readMetadata = async () => {
          const result = await retry(metadataUrl, { headers })
          if (!Array.isArray(result.sheets)) throw new GoogleRequestError(false)
          return new Set(
            result.sheets.map(
              (sheet: unknown) => object(object(sheet).properties).title,
            ),
          )
        }
        let titles = await readMetadata()
        const missing = Object.values(RSVP_TABS).filter(
          (title) => !titles.has(title),
        )
        if (missing.length) {
          try {
            // A blind retry could duplicate a successful request with a lost reply.
            await request(`${root}:batchUpdate`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                requests: missing.map((title) => ({
                  addSheet: { properties: { title } },
                })),
              }),
            })
          } catch {
            titles = await readMetadata()
            if (Object.values(RSVP_TABS).some((title) => !titles.has(title)))
              throw new GoogleRequestError(false)
          }
        }

        const rangeUrl = (range: string) =>
          `${root}/values/${encodeURIComponent(range)}`
        const readValues = async (range: string) =>
          rows(
            await retry(`${rangeUrl(range)}?valueRenderOption=FORMULA`, {
              headers,
            }),
          )
        // Validate every existing header before changing an empty destination.
        const emptyTabs: string[] = []
        for (const title of Object.values(RSVP_TABS)) {
          const headerRows = await readValues(`'${title}'!1:1`)
          const first = headerRows[0] ?? []
          if (
            first.length === RSVP_COLUMNS.length &&
            first.every((cell, index) => cell === RSVP_COLUMNS[index])
          )
            continue
          if (first.some((cell) => cell !== '' && cell !== null))
            throw new GoogleRequestError(false)
          // Inspect the entire tab, including cells beyond the seven RSVP columns.
          const allRows = await readValues(`'${title}'`)
          if (
            allRows.some((row) =>
              row.some((cell) => cell !== '' && cell !== null),
            )
          )
            throw new GoogleRequestError(false)
          emptyTabs.push(title)
        }
        for (const title of emptyTabs) {
          // Re-running a header write after an ambiguous failure could overwrite
          // another editor's data. A caller retry must verify emptiness again.
          const update = await request(
            `${rangeUrl(`'${title}'!A1:G1`)}?valueInputOption=RAW`,
            {
              method: 'PUT',
              headers,
              body: JSON.stringify({
                majorDimension: 'ROWS',
                values: [RSVP_COLUMNS],
              }),
            },
          )
          if (update.updatedRows !== 1) throw new GoogleRequestError(false)
        }

        const title = RSVP_TABS[record.guestSide]
        const duplicate = async () =>
          (await readValues(`'${title}'!A2:A`)).some(
            (row) => row[0] === record.submissionId,
          )
        if (await duplicate()) return { duplicate: true }
        const body = JSON.stringify({
          majorDimension: 'ROWS',
          values: [
            [
              record.submissionId,
              record.clientId,
              spreadsheetText(record.guestName),
              record.attendance,
              spreadsheetText(record.message ?? ''),
              record.submittedAt,
              'WEB',
            ],
          ],
        })
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          try {
            const append = await request(
              `${rangeUrl(`'${title}'!A:G`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
              {
                method: 'POST',
                headers,
                body,
              },
            )
            if (object(append.updates).updatedRows !== 1)
              throw new GoogleRequestError(true)
            return { duplicate: false }
          } catch (error) {
            if (!(error instanceof GoogleRequestError) || !error.retryable)
              throw error
            await pause(attempt)
            // Sheets has no transactional uniqueness. This mitigates duplicate
            // retries, including an append that committed before its reply was lost.
            if (await duplicate()) return { duplicate: true }
            if (attempt === MAX_ATTEMPTS - 1) throw error
          }
        }
        throw new GoogleRequestError(false)
      } catch {
        throw new Error(UNAVAILABLE)
      }
    },
  }
}

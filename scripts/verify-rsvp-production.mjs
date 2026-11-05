/* global AbortController, fetch, setTimeout, clearTimeout */
import { Buffer } from 'node:buffer'
import console from 'node:console'
import { createPrivateKey, sign } from 'node:crypto'
import process from 'node:process'
import { pathToFileURL, URLSearchParams } from 'node:url'

export const TEST_GUEST_NAME = 'KIỂM TRA KẾT NỐI - TỰ ĐỘNG XÓA'
export const TEST_MESSAGE =
  'Kiểm tra kết nối thật, không phải phản hồi khách mời.'
export const RSVP_COLUMNS = Object.freeze([
  'submission_id',
  'client_id',
  'guest_name',
  'attendance',
  'message',
  'submitted_at',
  'source',
])

const TABS = Object.freeze(['KHACH_CO_DAU', 'KHACH_CHU_RE'])
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const REQUEST_TIMEOUT_MS = 4_000
const OPERATION_TIMEOUT_MS = 30_000
const MAX_BODY_BYTES = 8 * 1024 * 1024
const SAFE_REASONS = new Set([
  'SERVICE_DISABLED',
  'ACCESS_TOKEN_SCOPE_INSUFFICIENT',
  'accessNotConfigured',
  'forbidden',
  'notFound',
  'invalid_grant',
])

class VerificationError extends Error {
  constructor(stage, status, reason) {
    super(
      `RSVP_PROBE_VERIFY stage=${stage}` +
        (Number.isInteger(status) && status >= 100 && status <= 599
          ? ` status=${status}`
          : ' failed') +
        (SAFE_REASONS.has(reason) ? ` reason=${reason}` : ''),
    )
  }
}

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function exactKeys(value, keys) {
  return (
    object(value) &&
    Object.keys(value).length === keys.length &&
    keys.every((key) => Object.hasOwn(value, key))
  )
}

function readProbes(flag) {
  try {
    if (typeof flag !== 'string' || flag.length > 2048) throw new Error()
    const probes = JSON.parse(flag)
    if (!exactKeys(probes, TABS)) throw new Error()
    for (const tab of TABS) {
      const probe = probes[tab]
      if (
        !exactKeys(probe, ['submissionId', 'clientId']) ||
        typeof probe.submissionId !== 'string' ||
        !UUID.test(probe.submissionId) ||
        typeof probe.clientId !== 'string' ||
        !UUID.test(probe.clientId)
      )
        throw new Error()
    }
    if (
      probes.KHACH_CO_DAU.submissionId.toLowerCase() ===
      probes.KHACH_CHU_RE.submissionId.toLowerCase()
    )
      throw new Error()
    return probes
  } catch {
    throw new VerificationError('flag')
  }
}

function readConfig(env) {
  try {
    const spreadsheetId = env.GOOGLE_SPREADSHEET_ID?.trim()
    const clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim()
    const privateKey = env.GOOGLE_PRIVATE_KEY?.replaceAll('\\n', '\n')
    if (
      !spreadsheetId ||
      !/^[A-Za-z0-9_-]+$/.test(spreadsheetId) ||
      !clientEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail) ||
      !privateKey
    )
      throw new Error()
    const key = createPrivateKey(privateKey)
    if (key.asymmetricKeyType !== 'rsa') throw new Error()
    return { spreadsheetId, clientEmail, key }
  } catch {
    throw new VerificationError('config')
  }
}

// Provider text is discarded. Only these known enums may cross the diagnostic
// boundary; descriptions, messages, metadata and arbitrary reason strings cannot.
function safeReason(body) {
  if (!object(body)) return undefined
  const error = body.error
  const candidates = [typeof error === 'string' ? error : undefined]
  if (object(error)) {
    for (const list of [error.errors, error.details]) {
      if (Array.isArray(list)) {
        for (const item of list) if (object(item)) candidates.push(item.reason)
      }
    }
  }
  return candidates.find((candidate) => SAFE_REASONS.has(candidate))
}

function readRows(body, stage) {
  if (
    !object(body) ||
    (body.majorDimension !== undefined && body.majorDimension !== 'ROWS')
  )
    throw new VerificationError(stage)
  const values = body.values ?? []
  if (
    !Array.isArray(values) ||
    !values.every(
      (row) =>
        Array.isArray(row) &&
        row.length <= 7 &&
        row.every(
          (cell) =>
            cell === null ||
            typeof cell === 'string' ||
            typeof cell === 'boolean' ||
            (typeof cell === 'number' && Number.isFinite(cell)),
        ),
    )
  )
    throw new VerificationError(stage)
  // Sheets omits trailing blank cells/rows. Canonicalize them for comparison.
  return values.map((row) =>
    Array.from({ length: 7 }, (_, index) => row[index] ?? ''),
  )
}

function checkHeader(rows, stage) {
  if (
    !rows[0] ||
    !RSVP_COLUMNS.every((header, index) => rows[0][index] === header)
  )
    throw new VerificationError(stage)
}

// Read-only diagnostics: row positions may change while the owner edits Sheets.
// This utility never attempts cleanup by row coordinates or mutates Sheets.
export async function verifyRsvpProbes(env, fetchImpl = fetch) {
  if (env.RSVP_VERIFY_PROBES === undefined) return { status: 'skipped' }
  const probes = readProbes(env.RSVP_VERIFY_PROBES)
  const config = readConfig(env)
  const deadline = Date.now() + OPERATION_TIMEOUT_MS
  const root = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.spreadsheetId)}`

  async function request(stage, url, init = {}) {
    const timeout = Math.min(REQUEST_TIMEOUT_MS, deadline - Date.now())
    if (timeout <= 0) throw new VerificationError(stage)
    const controller = new AbortController()
    let timer
    try {
      return await Promise.race([
        (async () => {
          const response = await fetchImpl(url, {
            ...init,
            signal: controller.signal,
          })
          let body
          try {
            const text = await response.text()
            if (Buffer.byteLength(text) > MAX_BODY_BYTES) throw new Error()
            body = JSON.parse(text)
          } catch {
            throw new VerificationError(
              stage,
              response.ok ? undefined : response.status,
            )
          }
          if (!response.ok)
            throw new VerificationError(
              stage,
              response.status,
              safeReason(body),
            )
          if (!object(body)) throw new VerificationError(stage)
          return body
        })(),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            controller.abort()
            reject(new VerificationError(stage))
          }, timeout)
        }),
      ])
    } catch (error) {
      if (error instanceof VerificationError) throw error
      throw new VerificationError(stage)
    } finally {
      clearTimeout(timer)
    }
  }

  let assertion
  try {
    const issuedAt = Math.floor(Date.now() / 1000)
    const header = Buffer.from(
      JSON.stringify({ alg: 'RS256', typ: 'JWT' }),
    ).toString('base64url')
    const payload = Buffer.from(
      JSON.stringify({
        iss: config.clientEmail,
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        aud: TOKEN_URL,
        iat: issuedAt,
        exp: issuedAt + 3600,
      }),
    ).toString('base64url')
    const unsigned = `${header}.${payload}`
    assertion = `${unsigned}.${sign('RSA-SHA256', Buffer.from(unsigned), config.key).toString('base64url')}`
  } catch {
    throw new VerificationError('oauth_token')
  }
  const token = await request('oauth_token', TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  })
  if (typeof token.access_token !== 'string' || !token.access_token)
    throw new VerificationError('oauth_token')
  const headers = {
    Authorization: `Bearer ${token.access_token}`,
    'Content-Type': 'application/json',
  }

  async function snapshot(validationStage) {
    const metadata = await request(
      'sheets_metadata',
      `${root}?fields=${encodeURIComponent('sheets.properties(sheetId,title)')}`,
      { headers },
    )
    if (!Array.isArray(metadata.sheets))
      throw new VerificationError('sheets_metadata')
    const result = new Map()
    const ids = new Set()
    for (const sheet of metadata.sheets) {
      if (!object(sheet) || !object(sheet.properties))
        throw new VerificationError('sheets_metadata')
      const { title, sheetId } = sheet.properties
      if (!TABS.includes(title)) continue
      if (
        !Number.isInteger(sheetId) ||
        sheetId < 0 ||
        result.has(title) ||
        ids.has(sheetId)
      )
        throw new VerificationError('sheets_metadata')
      ids.add(sheetId)
      result.set(title, { sheetId })
    }
    // Fixed titles and ranges only; no caller-provided range reaches Google.
    for (const tab of TABS) {
      if (!result.has(tab)) continue
      const body = await request(
        'sheets_values',
        `${root}/values/${encodeURIComponent(`'${tab}'!A:G`)}?valueRenderOption=FORMULA`,
        { headers },
      )
      const rows = readRows(body, 'sheets_values')
      checkHeader(rows, validationStage)
      result.get(tab).rows = rows
    }
    return result
  }

  const before = await snapshot('probe_validation')
  const found = []
  for (const tab of TABS) {
    const probe = probes[tab]
    const matches = []
    // Find identifiers across both destination tabs to reject misrouting and
    // duplicate IDs, including a duplicate with bad markers.
    for (const [storedTab, { rows }] of before) {
      rows.slice(1).forEach((row) => {
        if (row[0] === probe.submissionId) matches.push({ tab: storedTab, row })
      })
    }
    if (matches.length > 1) throw new VerificationError('probe_validation')
    if (!matches.length) continue
    const match = matches[0]
    if (
      match.tab !== tab ||
      match.row[1] !== probe.clientId ||
      match.row[2] !== TEST_GUEST_NAME ||
      match.row[4] !== TEST_MESSAGE ||
      match.row[6] !== 'WEB'
    )
      throw new VerificationError('probe_validation')
    found.push(match)
  }

  return {
    status: 'complete',
    found: found.length,
    absent: TABS.length - found.length,
    cleared: 0,
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const result = await verifyRsvpProbes(process.env)
    console.log(
      result.status === 'skipped'
        ? 'RSVP_PROBE_VERIFY skipped'
        : `RSVP_PROBE_VERIFY found=${result.found} absent=${result.absent} cleared=${result.cleared}`,
    )
  } catch (error) {
    console.error(
      error instanceof VerificationError
        ? error.message
        : 'RSVP_PROBE_VERIFY stage=internal failed',
    )
    process.exitCode = 1
  }
}

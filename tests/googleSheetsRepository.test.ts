import { generateKeyPairSync, verify } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createGoogleSheetsRepository,
  readGoogleSheetsConfig,
  type GoogleSheetsConfig,
} from '../server/infrastructure/googleSheetsRepository'
import type { RSVPRecord } from '../server/domain/rsvpRepository'

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { format: 'pem', type: 'pkcs8' },
  publicKeyEncoding: { format: 'pem', type: 'spki' },
})
const config: GoogleSheetsConfig = {
  spreadsheetId: 'test-sheet_123',
  clientEmail: 'rsvp@example.iam.gserviceaccount.com',
  privateKey,
}
const columns = [
  'submission_id',
  'client_id',
  'guest_name',
  'attendance',
  'message',
  'submitted_at',
  'source',
]
const record: RSVPRecord = {
  submissionId: '54dbdc71-c079-4e8f-9331-832570d17b77',
  clientId: '37857f22-e633-4b60-980b-e12d9f93981b',
  guestName: 'Guest Name',
  guestSide: 'BRIDE',
  attendance: 'YES',
  message: 'Congratulations!\nSee you soon.',
  submittedAt: '2026-11-03T12:00:00.000Z',
}

type Call = { url: URL; init: RequestInit; body: Record<string, unknown> }
type Hook = (call: Call) => Response | Promise<Response> | undefined
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Simulates only Google's external HTTP boundary; the repository and crypto stay real.
function google(
  initial: Record<string, string[][]> = {
    BRIDE_RSVP: [columns.slice()],
    GROOM_RSVP: [columns.slice()],
  },
  hook?: Hook,
) {
  const tabs = new Map(Object.entries(initial))
  const calls: Call[] = []
  const fetchImpl: typeof fetch = async (input, init = {}) => {
    const url = new URL(String(input))
    const body =
      typeof init.body === 'string' && init.body.startsWith('{')
        ? (JSON.parse(init.body) as Record<string, unknown>)
        : {}
    const call = { url, init, body }
    calls.push(call)
    const intercepted = hook?.(call)
    if (intercepted !== undefined) return await intercepted
    if (url.href === 'https://oauth2.googleapis.com/token') {
      return json({
        access_token: 'server-token',
        token_type: 'Bearer',
        expires_in: 3600,
      })
    }
    expect(init.headers).toMatchObject({ Authorization: 'Bearer server-token' })
    const path = decodeURIComponent(url.pathname)
    if (path.endsWith(':batchUpdate')) {
      const requests = body.requests as {
        addSheet: { properties: { title: string } }
      }[]
      for (const request of requests)
        tabs.set(request.addSheet.properties.title, [])
      return json({
        spreadsheetId: config.spreadsheetId,
        replies: requests.map(() => ({})),
      })
    }
    if (!path.includes('/values/')) {
      return json({
        spreadsheetId: config.spreadsheetId,
        sheets: [...tabs.keys()].map((title, sheetId) => ({
          properties: { title, sheetId },
        })),
      })
    }
    const range = path.split('/values/')[1]!
    const tab = /^'([^']+)'/.exec(range)?.[1]
    if (!tab || !tabs.has(tab)) return json({ error: 'missing' }, 400)
    const rows = tabs.get(tab)!
    if (range.endsWith(':append')) {
      rows.push(...(body.values as string[][]))
      return json({
        spreadsheetId: config.spreadsheetId,
        updates: { updatedRows: 1, updatedColumns: 7, updatedCells: 7 },
      })
    }
    if (init.method === 'PUT') {
      rows[0] = (body.values as string[][])[0]!
      return json({
        spreadsheetId: config.spreadsheetId,
        updatedRows: 1,
        updatedColumns: 7,
        updatedCells: 7,
      })
    }
    const values = range.endsWith('!1:1')
      ? rows.slice(0, 1)
      : range.endsWith('!A2:A')
        ? rows.slice(1).map((row) => row.slice(0, 1))
        : rows
    return json({ range, majorDimension: 'ROWS', values })
  }
  return { tabs, calls, fetchImpl }
}

function writes(calls: Call[]) {
  return calls
    .filter(({ init }) => init.method === 'PUT' || init.method === 'POST')
    .filter(({ url }) => url.host === 'sheets.googleapis.com')
}

afterEach(() => vi.useRealTimers())

describe('server-only Google Sheets configuration', () => {
  it('keeps the integration unavailable with missing or invalid configuration', () => {
    expect(readGoogleSheetsConfig({})).toBeNull()
    const env = {
      GOOGLE_SPREADSHEET_ID: config.spreadsheetId,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: config.clientEmail,
      GOOGLE_PRIVATE_KEY: privateKey,
    }
    expect(
      readGoogleSheetsConfig({ ...env, GOOGLE_PRIVATE_KEY: undefined }),
    ).toBeNull()
    expect(
      readGoogleSheetsConfig({ ...env, GOOGLE_SPREADSHEET_ID: '../unsafe' }),
    ).toBeNull()
    expect(
      readGoogleSheetsConfig({
        ...env,
        GOOGLE_SERVICE_ACCOUNT_EMAIL: 'invalid',
      }),
    ).toBeNull()
    expect(
      readGoogleSheetsConfig({
        ...env,
        GOOGLE_PRIVATE_KEY: 'not a private key',
      }),
    ).toBeNull()
    const { privateKey: ecKey } = generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
      privateKeyEncoding: { format: 'pem', type: 'pkcs8' },
      publicKeyEncoding: { format: 'pem', type: 'spki' },
    })
    expect(
      readGoogleSheetsConfig({ ...env, GOOGLE_PRIVATE_KEY: ecKey }),
    ).toBeNull()
  })

  it('normalizes escaped newlines without accepting browser-prefixed credentials', () => {
    expect(
      readGoogleSheetsConfig({
        GOOGLE_SPREADSHEET_ID: config.spreadsheetId,
        GOOGLE_SERVICE_ACCOUNT_EMAIL: config.clientEmail,
        GOOGLE_PRIVATE_KEY: privateKey.replaceAll('\n', '\\n'),
      }),
    ).toEqual(config)
    expect(
      readGoogleSheetsConfig({
        VITE_GOOGLE_SPREADSHEET_ID: config.spreadsheetId,
        VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL: config.clientEmail,
        VITE_GOOGLE_PRIVATE_KEY: privateKey,
      }),
    ).toBeNull()
  })
})

describe('Google Sheets RSVP repository', () => {
  it('authenticates with a signed RS256 service-account assertion and Sheets-only scope', async () => {
    const api = google()
    await createGoogleSheetsRepository(config, api.fetchImpl).save(record)
    const auth = api.calls[0]!
    expect(auth.url.href).toBe('https://oauth2.googleapis.com/token')
    expect(auth.init.method).toBe('POST')
    const body = new URLSearchParams(String(auth.init.body))
    expect(body.get('grant_type')).toBe(
      'urn:ietf:params:oauth:grant-type:jwt-bearer',
    )
    const [header, payload, signature] = body.get('assertion')!.split('.')
    expect(JSON.parse(Buffer.from(header!, 'base64url').toString())).toEqual({
      alg: 'RS256',
      typ: 'JWT',
    })
    const claims = JSON.parse(Buffer.from(payload!, 'base64url').toString())
    expect(claims).toMatchObject({
      iss: config.clientEmail,
      aud: 'https://oauth2.googleapis.com/token',
      scope: 'https://www.googleapis.com/auth/spreadsheets',
    })
    expect(claims.exp - claims.iat).toBe(3600)
    expect(Math.abs(claims.iat - Math.floor(Date.now() / 1000))).toBeLessThan(5)
    expect(
      verify(
        'RSA-SHA256',
        Buffer.from(`${header}.${payload}`),
        publicKey,
        Buffer.from(signature!, 'base64url'),
      ),
    ).toBe(true)
  })

  it.each(['BRIDE', 'GROOM'] as const)(
    'routes %s to the correct tab with seven RAW cells',
    async (guestSide) => {
      const api = google()
      expect(
        await createGoogleSheetsRepository(config, api.fetchImpl).save({
          ...record,
          guestSide,
        }),
      ).toEqual({ duplicate: false })
      const append = writes(api.calls).find(({ url }) =>
        url.pathname.endsWith(':append'),
      )!
      expect(decodeURIComponent(append.url.pathname)).toContain(
        `/values/'${guestSide}_RSVP'!A:G:append`,
      )
      expect(append.url.searchParams.get('valueInputOption')).toBe('RAW')
      expect(append.body).toEqual({
        majorDimension: 'ROWS',
        values: [
          [
            record.submissionId,
            record.clientId,
            'Guest Name',
            'YES',
            'Congratulations!\nSee you soon.',
            record.submittedAt,
            'WEB',
          ],
        ],
      })
      expect(api.tabs.get(`${guestSide}_RSVP`)).toHaveLength(2)
      expect(
        api.tabs.get(guestSide === 'BRIDE' ? 'GROOM_RSVP' : 'BRIDE_RSVP'),
      ).toHaveLength(1)
    },
  )

  it.each([
    '=SUM(1)',
    '+SUM(1)',
    '-SUM(1)',
    '@SUM(1)',
    '  =SUM(1)',
    '\t=SUM(1)',
    '\r=SUM(1)',
    '\n@SUM(1)',
    '\tplain text',
    '\rplain text',
  ])(
    'escapes spreadsheet formula prefix %j without stripping text',
    async (text) => {
      const api = google()
      await createGoogleSheetsRepository(config, api.fetchImpl).save({
        ...record,
        guestName: text,
        message: text,
      })
      expect(api.tabs.get('BRIDE_RSVP')![1]![2]).toBe(`'${text}`)
      expect(api.tabs.get('BRIDE_RSVP')![1]![4]).toBe(`'${text}`)
    },
  )

  it('creates only missing named tabs and initializes only verified empty tabs', async () => {
    const api = google({
      BRIDE_RSVP: [columns.slice()],
      SUMMARY: [['Private summary']],
    })
    await createGoogleSheetsRepository(config, api.fetchImpl).save(record)
    const batch = writes(api.calls).find(({ url }) =>
      url.pathname.endsWith(':batchUpdate'),
    )!
    expect(batch.body).toEqual({
      requests: [{ addSheet: { properties: { title: 'GROOM_RSVP' } } }],
    })
    const header = writes(api.calls).filter(({ init }) => init.method === 'PUT')
    expect(header).toHaveLength(1)
    expect(decodeURIComponent(header[0]!.url.pathname)).toContain(
      "'GROOM_RSVP'!A1:G1",
    )
    expect(header[0]!.url.searchParams.get('valueInputOption')).toBe('RAW')
    expect(header[0]!.body).toEqual({
      majorDimension: 'ROWS',
      values: [columns],
    })
    const verification = api.calls.findIndex(
      ({ url, init }) =>
        decodeURIComponent(url.pathname).endsWith("/values/'GROOM_RSVP'") &&
        init.method !== 'PUT',
    )
    expect(verification).toBeGreaterThan(-1)
    expect(api.calls.indexOf(header[0]!)).toBeGreaterThan(verification)
    expect(api.tabs.get('SUMMARY')).toEqual([['Private summary']])
  })

  it.each([
    [['wrong header']],
    [[...columns, 'unexpected']],
    [[], ['existing data below a blank header']],
    [[], [], ['', '', '', '', '', '', '', 'existing data outside the schema']],
  ])(
    'rejects existing incompatible data without overwriting it: %j',
    async (...rows) => {
      const api = google({ BRIDE_RSVP: rows, GROOM_RSVP: [columns.slice()] })
      const before = structuredClone(rows)
      await expect(
        createGoogleSheetsRepository(config, api.fetchImpl).save(record),
      ).rejects.toThrow('RSVP storage unavailable')
      expect(writes(api.calls)).toHaveLength(0)
      expect(api.tabs.get('BRIDE_RSVP')).toEqual(before)
    },
  )

  it('recovers a create-tab conflict by rereading metadata', async () => {
    const api = google({ BRIDE_RSVP: [columns.slice()] }, ({ url }) => {
      if (!url.pathname.endsWith(':batchUpdate')) return
      api.tabs.set('GROOM_RSVP', [columns.slice()])
      return json({ error: 'concurrent tab creation' }, 400)
    })
    await expect(
      createGoogleSheetsRepository(config, api.fetchImpl).save(record),
    ).resolves.toEqual({ duplicate: false })
    expect(
      api.calls.filter(
        ({ url }) =>
          !url.pathname.includes('/values/') &&
          url.host === 'sheets.googleapis.com' &&
          !url.pathname.endsWith(':batchUpdate'),
      ),
    ).toHaveLength(2)
  })

  it('recognizes an existing submission ID only in its destination without appending', async () => {
    const api = google({
      BRIDE_RSVP: [columns.slice(), [record.submissionId]],
      GROOM_RSVP: [columns.slice()],
    })
    expect(
      await createGoogleSheetsRepository(config, api.fetchImpl).save(record),
    ).toEqual({ duplicate: true })
    expect(writes(api.calls)).toHaveLength(0)
    expect(
      await createGoogleSheetsRepository(config, api.fetchImpl).save({
        ...record,
        guestSide: 'GROOM',
      }),
    ).toEqual({ duplicate: false })
  })

  it.each([
    {},
    { updates: {} },
    { updates: { updatedRows: 0 } },
    { updates: { updatedRows: 2 } },
  ])(
    'requires a confirmed one-row append before reporting success: %j',
    async (ack) => {
      const api = google(undefined, ({ url }) =>
        url.pathname.endsWith(':append') ? json(ack) : undefined,
      )
      await expect(
        createGoogleSheetsRepository(config, api.fetchImpl).save(record),
      ).rejects.toThrow('RSVP storage unavailable')
      expect(api.tabs.get('BRIDE_RSVP')).toHaveLength(1)
    },
  )

  it('rechecks submission IDs after a lost append acknowledgment and avoids another append', async () => {
    const api = google(undefined, ({ url, body }) => {
      if (!url.pathname.endsWith(':append')) return
      api.tabs.get('BRIDE_RSVP')!.push(...(body.values as string[][]))
      return Promise.reject(new Error('sensitive guest/network detail'))
    })
    expect(
      await createGoogleSheetsRepository(config, api.fetchImpl).save(record),
    ).toEqual({ duplicate: true })
    expect(api.tabs.get('BRIDE_RSVP')).toHaveLength(2)
    expect(
      api.calls.filter(({ url }) => url.pathname.endsWith(':append')),
    ).toHaveLength(1)
    expect(
      api.calls.filter(({ url }) =>
        decodeURIComponent(url.pathname).endsWith('!A2:A'),
      ),
    ).toHaveLength(2)
  })

  it('rechecks IDs before retrying a transient append failure', async () => {
    let attempts = 0
    const api = google(undefined, ({ url }) => {
      if (url.pathname.endsWith(':append') && ++attempts === 1)
        return json({ error: 'private error detail' }, 503)
    })
    expect(
      await createGoogleSheetsRepository(config, api.fetchImpl).save(record),
    ).toEqual({ duplicate: false })
    expect(attempts).toBe(2)
    expect(api.tabs.get('BRIDE_RSVP')).toHaveLength(2)
    const ranges = api.calls
      .map(({ url }) => decodeURIComponent(url.pathname))
      .filter((path) => path.endsWith(':append') || path.endsWith('!A2:A'))
    expect(
      ranges.map((path) => (path.endsWith(':append') ? 'append' : 'dedupe')),
    ).toEqual(['dedupe', 'append', 'dedupe', 'append'])
  })

  it('does not retry a permanent append rejection or leak its body', async () => {
    const api = google(undefined, ({ url }) =>
      url.pathname.endsWith(':append')
        ? json({ error: `private ${privateKey}` }, 403)
        : undefined,
    )
    await expect(
      createGoogleSheetsRepository(config, api.fetchImpl).save(record),
    ).rejects.toThrow(/^RSVP storage unavailable$/)
    expect(
      api.calls.filter(({ url }) => url.pathname.endsWith(':append')),
    ).toHaveLength(1)
  })

  it('retries a transient token error without writing any guest data to the token endpoint', async () => {
    let tokens = 0
    const api = google(undefined, ({ url, init }) => {
      if (url.host !== 'oauth2.googleapis.com') return
      expect(String(init.body)).not.toContain(record.guestName)
      if (++tokens === 1) return json({ error: 'temporarily unavailable' }, 429)
    })
    expect(
      await createGoogleSheetsRepository(config, api.fetchImpl).save(record),
    ).toEqual({ duplicate: false })
    expect(tokens).toBe(2)
    expect(api.tabs.get('BRIDE_RSVP')).toHaveLength(2)
  })

  it('does not append when its duplicate-check read fails', async () => {
    const api = google(undefined, ({ url }) =>
      decodeURIComponent(url.pathname).endsWith('!A2:A')
        ? json({ error: 'private API detail' }, 503)
        : undefined,
    )
    await expect(
      createGoogleSheetsRepository(config, api.fetchImpl).save(record),
    ).rejects.toThrow(/^RSVP storage unavailable$/)
    expect(
      api.calls.filter(({ url }) => url.pathname.endsWith(':append')),
    ).toHaveLength(0)
  })

  it('does not overwrite a competing header after an ambiguous header update failure', async () => {
    let headerUpdates = 0
    const api = google(
      { BRIDE_RSVP: [], GROOM_RSVP: [columns.slice()] },
      ({ init }) => {
        if (init.method !== 'PUT') return
        headerUpdates++
        api.tabs.set('BRIDE_RSVP', [['Competing data']])
        return Promise.reject(new Error('lost response'))
      },
    )
    await expect(
      createGoogleSheetsRepository(config, api.fetchImpl).save(record),
    ).rejects.toThrow(/^RSVP storage unavailable$/)
    expect(headerUpdates).toBe(1)
    expect(api.tabs.get('BRIDE_RSVP')).toEqual([['Competing data']])
  })

  it.each([' \tplain text', ' \rplain text'])(
    'escapes dangerous control characters behind leading spaces: %j',
    async (message) => {
      const api = google()
      await createGoogleSheetsRepository(config, api.fetchImpl).save({
        ...record,
        message,
      })
      expect(api.tabs.get('BRIDE_RSVP')![1]![4]).toBe(`'${message}`)
    },
  )

  it('bounds unresponsive requests and the complete save to twenty seconds', async () => {
    vi.useFakeTimers()
    const fetchImpl: typeof fetch = () => new Promise(() => undefined)
    const result = createGoogleSheetsRepository(config, fetchImpl).save(record)
    const failure = expect(result).rejects.toThrow(/^RSVP storage unavailable$/)
    await vi.advanceTimersByTimeAsync(20_000)
    await failure
    expect(vi.getTimerCount()).toBe(0)
  })

  it('does not start an append after the overall save deadline expires', async () => {
    vi.useFakeTimers()
    const started = Date.now()
    const api = google(undefined, ({ url }) => {
      if (!decodeURIComponent(url.pathname).endsWith('!A2:A')) return
      const response = json({ values: [] })
      response.json = async () => {
        vi.setSystemTime(started + 20_001)
        return { values: [] }
      }
      return response
    })
    await expect(
      createGoogleSheetsRepository(config, api.fetchImpl).save(record),
    ).rejects.toThrow(/^RSVP storage unavailable$/)
    expect(api.tabs.get('BRIDE_RSVP')).toHaveLength(1)
    expect(
      api.calls.filter(({ url }) => url.pathname.endsWith(':append')),
    ).toHaveLength(0)
  })
})

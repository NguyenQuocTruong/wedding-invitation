/* global AbortSignal, Buffer, Response, URL, URLSearchParams, structuredClone */
import assert from 'node:assert/strict'
import { generateKeyPairSync, verify } from 'node:crypto'
import { test, vi } from 'vitest'
import {
  TEST_GUEST_NAME,
  TEST_MESSAGE,
  verifyRsvpProbes,
} from '../scripts/verify-rsvp-production.mjs'

const columns = [
  'submission_id',
  'client_id',
  'guest_name',
  'attendance',
  'message',
  'submitted_at',
  'source',
]
const probes = {
  BRIDE_RSVP: {
    submissionId: 'de638d50-940e-42dd-bdb4-c20b702de413',
    clientId: 'a537ec26-60df-4bde-875e-71ba634c990b',
  },
  GROOM_RSVP: {
    submissionId: '427ba21b-83ea-41bc-a2c6-5267f466d5bf',
    clientId: '47a9120c-70ae-4a96-9c56-8754975cb9a4',
  },
}
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { format: 'pem', type: 'pkcs8' },
  publicKeyEncoding: { format: 'pem', type: 'spki' },
})
const env = {
  RSVP_VERIFY_PROBES: JSON.stringify(probes),
  GOOGLE_SPREADSHEET_ID: 'test-private-sheet',
  GOOGLE_SERVICE_ACCOUNT_EMAIL: 'server@example.iam.gserviceaccount.com',
  GOOGLE_PRIVATE_KEY: privateKey.replaceAll('\n', '\\n'),
}
const guest = [
  'real-submission',
  'real-client',
  'Private guest',
  'YES',
  'Private message',
  '2026-11-03T01:00:00.000Z',
  'WEB',
]
function probeRow(tab) {
  return [
    probes[tab].submissionId,
    probes[tab].clientId,
    'KIỂM TRA KẾT NỐI - TỰ ĐỘNG XÓA',
    'NO',
    'Kiểm tra kết nối thật, không phải phản hồi khách mời.',
    '2026-11-03T01:01:00.000Z',
    'WEB',
  ]
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Only the external Google HTTP boundary is simulated; JWT signing and the
// complete verification/cleanup operation run as production code.
function google(initial, hook = () => undefined) {
  const tabs = new Map(
    Object.entries(structuredClone(initial)).map(([title, rows], sheetId) => [
      title,
      { rows, sheetId },
    ]),
  )
  const calls = []
  const clearRanges = []
  let readCount = 0
  const fetchImpl = async (input, init = {}) => {
    const url = new URL(input)
    calls.push({ url, init })
    assert.ok(init.signal instanceof AbortSignal)
    const intercepted = await hook({ url, init, tabs, readCount })
    if (intercepted !== undefined) return intercepted
    if (url.href === 'https://oauth2.googleapis.com/token') {
      assert.equal(init.method, 'POST')
      const form = new URLSearchParams(init.body)
      assert.equal(
        form.get('grant_type'),
        'urn:ietf:params:oauth:grant-type:jwt-bearer',
      )
      const assertion = form.get('assertion')
      const [header, payload, signature] = assertion.split('.')
      assert.deepEqual(JSON.parse(Buffer.from(header, 'base64url')), {
        alg: 'RS256',
        typ: 'JWT',
      })
      const claims = JSON.parse(Buffer.from(payload, 'base64url'))
      assert.equal(claims.iss, env.GOOGLE_SERVICE_ACCOUNT_EMAIL)
      assert.equal(
        claims.scope,
        'https://www.googleapis.com/auth/spreadsheets.readonly',
      )
      assert.equal(claims.aud, 'https://oauth2.googleapis.com/token')
      assert.equal(claims.exp - claims.iat, 3600)
      assert.ok(Math.abs(claims.iat - Date.now() / 1000) < 10)
      assert.ok(
        verify(
          'RSA-SHA256',
          Buffer.from(`${header}.${payload}`),
          publicKey,
          Buffer.from(signature, 'base64url'),
        ),
      )
      return json({
        access_token: 'private-server-token',
        token_type: 'Bearer',
        expires_in: 3600,
      })
    }
    assert.equal(url.origin, 'https://sheets.googleapis.com')
    assert.equal(init.headers.Authorization, 'Bearer private-server-token')
    assert.equal(url.pathname.split('/')[3], env.GOOGLE_SPREADSHEET_ID)
    if (url.pathname.endsWith('/values:batchClear')) {
      assert.equal(init.method, 'POST')
      const body = JSON.parse(init.body)
      assert.deepEqual(Object.keys(body), ['ranges'])
      for (const range of body.ranges) {
        assert.match(
          range,
          /^'(BRIDE_RSVP|GROOM_RSVP)'!A[2-9][0-9]*:G[2-9][0-9]*$/,
        )
        const [, tab, first, last] = /^'([^']+)'!A(\d+):G(\d+)$/.exec(range)
        assert.equal(first, last)
        tabs.get(tab).rows[Number(first) - 1] = []
        clearRanges.push(range)
      }
      return json({
        spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
        clearedRanges: body.ranges,
      })
    }
    assert.equal(init.method ?? 'GET', 'GET')
    if (!url.pathname.includes('/values/')) {
      assert.equal(
        url.searchParams.get('fields'),
        'sheets.properties(sheetId,title)',
      )
      return json({
        sheets: [...tabs].map(([title, { sheetId }]) => ({
          properties: { title, sheetId },
        })),
      })
    }
    const range = decodeURIComponent(url.pathname.split('/values/')[1])
    assert.match(range, /^'(BRIDE_RSVP|GROOM_RSVP)'!A:G$/)
    assert.equal(url.searchParams.get('valueRenderOption'), 'FORMULA')
    const [, tab] = /^'([^']+)'/.exec(range)
    readCount++
    assert.ok(tabs.has(tab))
    return json({ range, majorDimension: 'ROWS', values: tabs.get(tab).rows })
  }
  return { tabs, calls, clearRanges, fetchImpl }
}

test('absent verification flag skips without reading credentials or using HTTP', async () => {
  const result = await verifyRsvpProbes({}, () =>
    assert.fail('unexpected networking'),
  )
  assert.deepEqual(result, { status: 'skipped' })
})

test('invalid flags and arbitrary tabs/ranges fail before HTTP', async () => {
  const flags = [
    '',
    'not-json',
    'null',
    '[]',
    '{}',
    JSON.stringify({ ...probes, SUMMARY: probes.BRIDE_RSVP }),
    JSON.stringify({ BRIDE_RSVP: probes.BRIDE_RSVP }),
    JSON.stringify({
      ...probes,
      BRIDE_RSVP: { ...probes.BRIDE_RSVP, range: 'A:G' },
    }),
    JSON.stringify({
      ...probes,
      GROOM_RSVP: { ...probes.GROOM_RSVP, submissionId: 'not-a-uuid' },
    }),
    JSON.stringify({
      ...probes,
      GROOM_RSVP: {
        ...probes.GROOM_RSVP,
        submissionId: probes.BRIDE_RSVP.submissionId,
      },
    }),
  ]
  for (const flag of flags) {
    await assert.rejects(
      verifyRsvpProbes({ ...env, RSVP_VERIFY_PROBES: flag }, () =>
        assert.fail('unexpected networking'),
      ),
      /RSVP_PROBE_VERIFY stage=flag failed/,
    )
  }
})

test('exact marked probes are verified without changing probe, guest, or unrelated rows', async () => {
  const fake = google({
    BRIDE_RSVP: [
      columns,
      guest,
      probeRow('BRIDE_RSVP'),
      [],
      ['other', '', '', '', '', '', 'WEB'],
    ],
    GROOM_RSVP: [columns, probeRow('GROOM_RSVP'), guest],
    SUMMARY: [['untouched']],
  })
  const result = await verifyRsvpProbes(env, fake.fetchImpl)
  assert.deepEqual(result, {
    status: 'complete',
    found: 2,
    absent: 0,
    cleared: 0,
  })
  assert.deepEqual(fake.clearRanges, [])
  assert.deepEqual(fake.tabs.get('BRIDE_RSVP').rows, [
    columns,
    guest,
    probeRow('BRIDE_RSVP'),
    [],
    ['other', '', '', '', '', '', 'WEB'],
  ])
  assert.deepEqual(fake.tabs.get('GROOM_RSVP').rows, [
    columns,
    probeRow('GROOM_RSVP'),
    guest,
  ])
  assert.deepEqual(fake.tabs.get('SUMMARY').rows, [['untouched']])
  assert.equal(TEST_GUEST_NAME, probeRow('BRIDE_RSVP')[2])
  assert.equal(TEST_MESSAGE, probeRow('BRIDE_RSVP')[4])
})

test('bad marker, client ID, source, headers, or duplicate IDs prevent every Sheets mutation', async () => {
  for (const variant of [
    'name',
    'message',
    'client',
    'source',
    'headers',
    'duplicate',
    'wrong-tab',
  ]) {
    const bride = probeRow('BRIDE_RSVP')
    const groom = probeRow('GROOM_RSVP')
    if (variant === 'name') bride[2] = 'Actual guest'
    if (variant === 'message') bride[4] = 'Actual message'
    if (variant === 'client') bride[1] = probes.GROOM_RSVP.clientId
    if (variant === 'source') bride[6] = 'IMPORT'
    const brideRows = [
      variant === 'headers' ? columns.slice(1) : columns,
      bride,
    ]
    const groomRows = [columns, groom]
    if (variant === 'duplicate') groomRows.push(bride.slice())
    if (variant === 'wrong-tab') groomRows.push(brideRows.pop())
    const fake = google({ BRIDE_RSVP: brideRows, GROOM_RSVP: groomRows })
    await assert.rejects(
      verifyRsvpProbes(env, fake.fetchImpl),
      /RSVP_PROBE_VERIFY stage=probe_validation failed/,
      variant,
    )
    assert.deepEqual(fake.clearRanges, [], variant)
    assert.ok(
      fake.calls.every(
        ({ url, init }) =>
          url.hostname !== 'sheets.googleapis.com' ||
          (init.method ?? 'GET') === 'GET',
      ),
      variant,
    )
  }
})

test('already absent probes and missing target tabs are idempotent and never create resources', async () => {
  for (const tabs of [
    { BRIDE_RSVP: [columns, guest], GROOM_RSVP: [columns] },
    { BRIDE_RSVP: [columns, guest] },
    {},
  ]) {
    const fake = google(tabs)
    assert.deepEqual(await verifyRsvpProbes(env, fake.fetchImpl), {
      status: 'complete',
      found: 0,
      absent: 2,
      cleared: 0,
    })
    assert.deepEqual(fake.clearRanges, [])
    assert.ok(
      fake.calls.every(
        ({ url, init }) =>
          url.hostname !== 'sheets.googleapis.com' ||
          (init.method ?? 'GET') === 'GET',
      ),
    )
  }
})

test('one absent probe is reported separately from one present probe on repeated read-only runs', async () => {
  const fake = google({
    BRIDE_RSVP: [columns, probeRow('BRIDE_RSVP')],
    GROOM_RSVP: [columns, guest],
  })
  assert.deepEqual(await verifyRsvpProbes(env, fake.fetchImpl), {
    status: 'complete',
    found: 1,
    absent: 1,
    cleared: 0,
  })
  assert.deepEqual(fake.clearRanges, [])
  assert.deepEqual(await verifyRsvpProbes(env, fake.fetchImpl), {
    status: 'complete',
    found: 1,
    absent: 1,
    cleared: 0,
  })
})

test('a concurrent row swap after reading never causes Sheets mutation or guest-data erasure', async () => {
  let swapped = false
  const fake = google(
    {
      BRIDE_RSVP: [columns, probeRow('BRIDE_RSVP'), guest],
      GROOM_RSVP: [columns, probeRow('GROOM_RSVP')],
    },
    ({ url, tabs }) => {
      if (
        !swapped &&
        decodeURIComponent(url.pathname).includes("'GROOM_RSVP'!A:G")
      ) {
        swapped = true
        const rows = tabs.get('BRIDE_RSVP').rows
        ;[rows[1], rows[2]] = [rows[2], rows[1]]
      }
    },
  )
  let result
  let failure
  try {
    result = await verifyRsvpProbes(env, fake.fetchImpl)
  } catch (error) {
    failure = error
  }
  assert.ok(swapped, 'fixture must reorder rows after the bride snapshot')
  assert.equal(
    fake.calls.filter(
      ({ url, init }) =>
        url.hostname === 'sheets.googleapis.com' &&
        (init.method ?? 'GET') !== 'GET',
    ).length,
    0,
    'verification must never mutate Google Sheets',
  )
  assert.deepEqual(fake.tabs.get('BRIDE_RSVP').rows, [
    columns,
    guest,
    probeRow('BRIDE_RSVP'),
  ])
  assert.deepEqual(fake.tabs.get('GROOM_RSVP').rows, [
    columns,
    probeRow('GROOM_RSVP'),
  ])
  assert.equal(failure, undefined)
  assert.deepEqual(result, {
    status: 'complete',
    found: 2,
    absent: 0,
    cleared: 0,
  })
})

test('upstream failures expose only fixed stage/status and whitelisted reason enums', async () => {
  const secret = `${env.GOOGLE_SPREADSHEET_ID} ${env.GOOGLE_SERVICE_ACCOUNT_EMAIL} private-server-token ${privateKey} ${guest.join(' ')}`
  for (const [stage, match, body, reason] of [
    [
      'oauth_token',
      'oauth2.googleapis.com',
      { error: 'invalid_grant', error_description: secret },
      'invalid_grant',
    ],
    [
      'sheets_metadata',
      '/v4/spreadsheets/test-private-sheet',
      {
        error: {
          message: secret,
          details: [
            { reason: 'SERVICE_DISABLED', metadata: { value: secret } },
          ],
        },
      },
      'SERVICE_DISABLED',
    ],
    [
      'sheets_values',
      '/values/',
      { error: { message: secret, errors: [{ reason: 'forbidden' }] } },
      'forbidden',
    ],
    [
      'sheets_values',
      '/values/',
      { error: { message: secret, errors: [{ reason: secret }] } },
      undefined,
    ],
  ]) {
    const fake = google(
      { BRIDE_RSVP: [columns], GROOM_RSVP: [columns] },
      ({ url }) => {
        if (
          (stage === 'sheets_metadata' && url.pathname === match) ||
          (stage !== 'sheets_metadata' && url.href.includes(match))
        )
          return json(body, 403)
      },
    )
    await assert.rejects(verifyRsvpProbes(env, fake.fetchImpl), (error) => {
      assert.equal(
        error.message,
        `RSVP_PROBE_VERIFY stage=${stage} status=403${reason ? ` reason=${reason}` : ''}`,
      )
      assert.equal(error.cause, undefined)
      for (const sensitive of [
        env.GOOGLE_SPREADSHEET_ID,
        env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        'private-server-token',
        'PRIVATE KEY',
        'Private guest',
        'Private message',
      ])
        assert.ok(!String(error.stack).includes(sensitive))
      return true
    })
    assert.deepEqual(fake.clearRanges, [])
  }
})

test('fetch and response-body stalls are bounded and produce safe stage-only failures', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  try {
    for (const fetchImpl of [
      () => new Promise(() => {}),
      async () => ({ ok: true, text: () => new Promise(() => {}) }),
    ]) {
      const pending = verifyRsvpProbes(env, fetchImpl)
      const rejected = assert.rejects(
        pending,
        /RSVP_PROBE_VERIFY stage=oauth_token failed/,
      )
      await Promise.resolve()
      vi.advanceTimersByTime(60_000)
      await rejected
    }
  } finally {
    vi.useRealTimers()
  }
})

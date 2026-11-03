import { afterEach, describe, expect, it, vi } from 'vitest'
import { getRsvpAvailability, sendRsvp } from '../src/services/rsvpApi'
import type { RSVPInput } from '../src/types/rsvp'

const input: RSVPInput = {
  submissionId: 'e5b70530-4a93-47c8-98d1-63f8951bc438',
  clientId: '8e7f5e0e-ab22-4e99-a999-58a0add81d71',
  guestName: 'Nguyễn An',
  guestSide: 'BRIDE',
  attendance: 'YES',
  message: 'Chúc mừng hai bạn!',
}

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('RSVP availability client', () => {
  it.each([true, false])(
    'reads enabled=%s using the private-data-free OPTIONS endpoint',
    async (enabled) => {
      const fetchMock = vi
        .fn<typeof fetch>()
        .mockResolvedValue(reply({ enabled }))
      vi.stubGlobal('fetch', fetchMock)

      await expect(getRsvpAvailability()).resolves.toBe(enabled)

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/rsvp',
        expect.objectContaining({
          method: 'OPTIONS',
          credentials: 'same-origin',
          cache: 'no-store',
          redirect: 'error',
          signal: expect.any(AbortSignal),
        }),
      )
      expect(fetchMock.mock.calls[0]?.[1]?.body).toBeUndefined()
    },
  )

  it.each(
    [null, [], {}, { enabled: 'true' }, { enabled: true, guests: [] }].map(
      (body) => ({ body }),
    ),
  )('rejects a malformed availability body %j', async ({ body }) => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(reply(body)))
    await expect(getRsvpAvailability()).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    })
  })

  it('does not enable sending from an unsuccessful HTTP response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(reply({ enabled: true }, 503)),
    )
    await expect(getRsvpAvailability()).rejects.toMatchObject({
      code: 'RSVP_UNAVAILABLE',
    })
  })
})

describe('RSVP submission client', () => {
  it('posts the supplied identifiers and fields as same-origin JSON before confirming success', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(reply({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(sendRsvp({ ...input, website: '' })).resolves.toBeUndefined()

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/rsvp',
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        redirect: 'error',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...input, website: '' }),
        signal: expect.any(AbortSignal),
      }),
    )
  })

  it.each(
    [
      null,
      [],
      {},
      { ok: false },
      { ok: 'true' },
      { ok: true, guestName: 'private' },
    ].map((body) => ({ body })),
  )(
    'never claims success for malformed acknowledgement %j',
    async ({ body }) => {
      vi.stubGlobal(
        'fetch',
        vi.fn<typeof fetch>().mockResolvedValue(reply(body)),
      )
      await expect(sendRsvp(input)).rejects.toMatchObject({
        code: 'INVALID_RESPONSE',
      })
    },
  )

  it.each([
    [400, 'INVALID_RSVP'],
    [400, 'INVALID_JSON'],
    [413, 'PAYLOAD_TOO_LARGE'],
    [415, 'UNSUPPORTED_MEDIA_TYPE'],
    [503, 'RSVP_NOT_CONFIGURED'],
    [503, 'RSVP_UNAVAILABLE'],
  ])(
    'reports safe API failure %s %s without treating it as success',
    async (status, code) => {
      vi.stubGlobal(
        'fetch',
        vi.fn<typeof fetch>().mockResolvedValue(reply({ error: code }, status)),
      )
      await expect(sendRsvp(input)).rejects.toMatchObject({ code })
    },
  )

  it('rejects an unsuccessful HTTP status even when the body claims success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(reply({ ok: true }, 500)),
    )
    await expect(sendRsvp(input)).rejects.toMatchObject({
      code: 'RSVP_UNAVAILABLE',
    })
  })

  it.each([
    new Response('<html>Unavailable</html>', {
      headers: { 'Content-Type': 'text/html' },
    }),
    new Response('{broken', {
      headers: { 'Content-Type': 'application/json' },
    }),
    new Response(null, { status: 204 }),
  ])('rejects non-JSON and empty acknowledgements', async (response) => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(response))
    await expect(sendRsvp(input)).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    })
  })

  it('replaces network exception details with a safe error', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockRejectedValue(new Error('private guest details')),
    )
    const error = await sendRsvp(input).catch((reason: unknown) => reason)
    expect(error).toMatchObject({ code: 'RSVP_UNAVAILABLE' })
    expect(String(error)).not.toContain('private guest details')
  })

  it('bounds a stalled request and aborts its network work', async () => {
    vi.useFakeTimers()
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation(() => new Promise(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    const result = sendRsvp(input).catch((reason: unknown) => reason)

    await vi.advanceTimersByTimeAsync(30_000)

    expect(await result).toMatchObject({ code: 'TIMEOUT' })
    expect(fetchMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(true)
  })

  it('bounds a stalled response body as well as the initial fetch', async () => {
    vi.useFakeTimers()
    const response = new Response(new ReadableStream(), {
      headers: { 'Content-Type': 'application/json' },
    })
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(response))
    const result = sendRsvp(input).catch((reason: unknown) => reason)

    await vi.advanceTimersByTimeAsync(30_000)

    expect(await result).toMatchObject({ code: 'TIMEOUT' })
  })
})

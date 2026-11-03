import { describe, expect, it, vi } from 'vitest'
import handler, { createRsvpHandler } from '../api/rsvp'
import type { RSVPRepository } from '../server/domain/rsvpRepository'

const body = {
  submissionId: 'd9428888-122b-4e1c-9ac0-b3f135d91277',
  clientId: '0e12e03a-aa94-4b3c-8426-2e9eb2802ea3',
  guestName: 'Khách kiểm tra',
  guestSide: 'BRIDE',
  attendance: 'YES',
}
const headers = { 'content-type': 'application/json', host: 'invitation.test' }
function response() {
  return { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() }
}
function repository(): RSVPRepository {
  return { save: vi.fn().mockResolvedValue({ duplicate: false }) }
}

describe('private RSVP API boundary', () => {
  it.each(['GET', 'PUT', 'DELETE', undefined])(
    'rejects %s without exposing records',
    async (method) => {
      const res = response()
      await handler({ method }, res)
      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST, OPTIONS')
      expect(res.json).toHaveBeenCalledWith({ error: 'METHOD_NOT_ALLOWED' })
    },
  )
  it('reports only availability and disables unconfigured storage', async () => {
    const res = response()
    await createRsvpHandler(null)({ method: 'OPTIONS' }, res)
    expect(res.json).toHaveBeenCalledWith({ enabled: false })
    const post = response()
    await createRsvpHandler(null)({ method: 'POST', headers, body }, post)
    expect(post.status).toHaveBeenCalledWith(503)
    expect(post.json).toHaveBeenCalledWith({ error: 'RSVP_NOT_CONFIGURED' })
    expect(post.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store')
  })
  it('reports configured capability without reading or writing guest data', async () => {
    const repo = repository(),
      res = response()
    await createRsvpHandler(repo)({ method: 'OPTIONS' }, res)
    expect(res.json).toHaveBeenCalledWith({ enabled: true })
    expect(repo.save).not.toHaveBeenCalled()
  })
  it('acknowledges a valid committed response', async () => {
    const repo = repository(),
      res = response()
    await createRsvpHandler(repo)(
      { method: 'POST', headers, body: JSON.stringify(body) },
      res,
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        guestName: body.guestName,
        guestSide: 'BRIDE',
      }),
    )
  })
  it.each([
    [
      { ...headers, 'content-type': 'text/plain' },
      body,
      415,
      'UNSUPPORTED_MEDIA_TYPE',
    ],
    [headers, '{broken', 400, 'INVALID_JSON'],
    [headers, { ...body, attendance: 'MAYBE' }, 400, 'INVALID_RSVP'],
    [{ ...headers, 'content-length': '9000' }, body, 413, 'PAYLOAD_TOO_LARGE'],
    [headers, { ...body, message: 'a'.repeat(9000) }, 413, 'PAYLOAD_TOO_LARGE'],
    [{ ...headers, origin: 'https://unrelated.test' }, body, 403, 'FORBIDDEN'],
  ])(
    'rejects bad requests safely',
    async (requestHeaders, requestBody, status, code) => {
      const repo = repository(),
        res = response()
      await createRsvpHandler(repo)(
        { method: 'POST', headers: requestHeaders, body: requestBody },
        res,
      )
      expect(res.status).toHaveBeenCalledWith(status)
      expect(res.json).toHaveBeenCalledWith({ error: code })
      expect(repo.save).not.toHaveBeenCalled()
    },
  )
  it('allows a same-origin browser request', async () => {
    const res = response()
    await createRsvpHandler(repository())(
      {
        method: 'POST',
        headers: { ...headers, origin: 'https://invitation.test' },
        body,
      },
      res,
    )
    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })
  it('hides storage failures and never claims success', async () => {
    const repo = {
        save: vi.fn().mockRejectedValue(new Error('private provider details')),
      },
      res = response()
    await createRsvpHandler(repo)({ method: 'POST', headers, body }, res)
    expect(res.status).toHaveBeenCalledWith(503)
    expect(res.json).toHaveBeenCalledWith({ error: 'RSVP_UNAVAILABLE' })
  })
})

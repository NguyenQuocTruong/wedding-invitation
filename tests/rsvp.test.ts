import { describe, expect, it, vi } from 'vitest'
import handler from '../api/rsvp'

describe('Phase 1 RSVP boundary', () => {
  it.each(['GET', 'PUT', 'DELETE', undefined])(
    'rejects %s without exposing responses',
    (method) => {
      const response = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      }
      handler({ method }, response)
      expect(response.status).toHaveBeenCalledWith(405)
      expect(response.setHeader).toHaveBeenCalledWith('Allow', 'POST')
      expect(response.json).toHaveBeenCalledWith({
        error: 'METHOD_NOT_ALLOWED',
      })
    },
  )

  it('does not claim that an RSVP was stored', () => {
    const response = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    handler({ method: 'POST' }, response)
    expect(response.status).toHaveBeenCalledWith(503)
    expect(response.json).toHaveBeenCalledWith({ error: 'RSVP_NOT_CONFIGURED' })
    expect(response.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store')
  })
})

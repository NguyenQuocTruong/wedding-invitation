import { describe, expect, it, vi } from 'vitest'
import { submitRSVP } from '../server/application/submitRSVP'
import type { RSVPRepository } from '../server/domain/rsvpRepository'

const input = {
  submissionId: 'd9428888-122b-4e1c-9ac0-b3f135d91277',
  clientId: '0e12e03a-aa94-4b3c-8426-2e9eb2802ea3',
  guestName: '  Khách kiểm tra  ',
  guestSide: 'BRIDE',
  attendance: 'YES',
  message: ' Lời chúc ',
}
const now = () => new Date('2026-11-03T03:00:00.000Z')
function repository(): RSVPRepository {
  return { save: vi.fn().mockResolvedValue({ duplicate: false }) }
}

describe('RSVP application', () => {
  it('normalizes validated input and timestamps on the server before saving', async () => {
    const repo = repository()
    await expect(
      submitRSVP({ ...input, website: '' }, repo, now),
    ).resolves.toEqual({ ok: true })
    expect(repo.save).toHaveBeenCalledWith({
      ...input,
      guestName: 'Khách kiểm tra',
      message: 'Lời chúc',
      submittedAt: now().toISOString(),
    })
  })
  it.each([
    { submissionId: 'invalid' },
    { clientId: 'invalid' },
    { guestName: '   ' },
    { guestName: 'a'.repeat(101) },
    { guestSide: 'OTHER' },
    { attendance: 'MAYBE' },
    { message: 'a'.repeat(501) },
    { extra: 1 },
    { website: 'bot' },
  ])('rejects invalid data without writing: %o', async (invalid) => {
    const repo = repository()
    await expect(
      submitRSVP({ ...input, ...invalid }, repo, now),
    ).rejects.toThrow('INVALID_RSVP')
    expect(repo.save).not.toHaveBeenCalled()
  })
  it('supports NO attendance and no optional message', async () => {
    const repo = repository()
    await submitRSVP(
      { ...input, guestSide: 'GROOM', attendance: 'NO', message: undefined },
      repo,
      now,
    )
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ guestSide: 'GROOM', attendance: 'NO' }),
    )
  })
  it('never acknowledges an unresolved or failed Sheets write', async () => {
    let resolveSave!: (result: { duplicate: boolean }) => void
    const repo = {
      save: vi.fn(
        () =>
          new Promise<{ duplicate: boolean }>((resolve) => {
            resolveSave = resolve
          }),
      ),
    }
    let acknowledged = false
    const pending = submitRSVP(input, repo, now).then(() => {
      acknowledged = true
    })
    await Promise.resolve()
    expect(acknowledged).toBe(false)
    resolveSave({ duplicate: false })
    await pending
    expect(acknowledged).toBe(true)
    const error = new Error('Storage failed')
    const failing = { save: vi.fn().mockRejectedValue(error) }
    await expect(submitRSVP(input, failing, now)).rejects.toBe(error)
  })
})

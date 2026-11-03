import { z } from 'zod'
import type { RSVPRepository } from '../domain/rsvpRepository'

export const RSVP_UNAVAILABLE = { error: 'RSVP_NOT_CONFIGURED' } as const
export class InvalidRsvpError extends Error {
  constructor() {
    super('INVALID_RSVP')
  }
}
const inputSchema = z
  .object({
    submissionId: z.uuid(),
    clientId: z.uuid(),
    guestName: z.string().trim().min(2).max(100),
    guestSide: z.enum(['BRIDE', 'GROOM']),
    attendance: z.enum(['YES', 'NO']),
    message: z
      .string()
      .max(500)
      .transform((value) => value.trim())
      .optional(),
    website: z.literal('').optional(),
  })
  .strict()

export async function submitRSVP(
  input: unknown,
  repository: RSVPRepository,
  now: () => Date = () => new Date(),
): Promise<{ ok: true }> {
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) throw new InvalidRsvpError()
  const { submissionId, clientId, guestName, guestSide, attendance, message } =
    parsed.data
  await repository.save({
    submissionId,
    clientId,
    guestName,
    guestSide,
    attendance,
    ...(message ? { message } : {}),
    submittedAt: now().toISOString(),
  })
  return { ok: true }
}

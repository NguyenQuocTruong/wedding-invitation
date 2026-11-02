import type { RSVPInput } from '../../src/types/rsvp'

export type RSVPRecord = RSVPInput & { submittedAt: string }
export interface RSVPRepository {
  save(record: RSVPRecord): Promise<void>
}
export const RSVP_TABS = { BRIDE: 'BRIDE_RSVP', GROOM: 'GROOM_RSVP' } as const

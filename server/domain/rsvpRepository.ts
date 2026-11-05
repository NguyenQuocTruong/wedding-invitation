import type { RSVPInput } from '../../src/types/rsvp'

export type RSVPRecord = RSVPInput & { submittedAt: string }
export interface RSVPSaveResult {
  duplicate: boolean
}
export interface RSVPRepository {
  save(record: RSVPRecord): Promise<RSVPSaveResult>
}
export const RSVP_TABS = {
  BRIDE: 'KHACH_CO_DAU',
  GROOM: 'KHACH_CHU_RE',
} as const
export const RSVP_COLUMNS = [
  'submission_id',
  'client_id',
  'guest_name',
  'attendance',
  'message',
  'submitted_at',
  'source',
] as const

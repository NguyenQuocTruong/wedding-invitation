export type GuestSide = 'BRIDE' | 'GROOM'
export type Attendance = 'YES' | 'NO'

export interface RSVPInput {
  submissionId: string
  clientId: string
  guestName: string
  guestSide: GuestSide
  attendance: Attendance
  message?: string
}

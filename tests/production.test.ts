import { expect, it } from 'vitest'
import { event } from '../src/config/event'
import { countdownParts } from '../src/utils/preview'

it('explicitly identifies fictional wedding content and supplies both families', () => {
  expect(event.sampleContent).toBe(true)
  expect(event.brideName).toBe('Minh Anh')
  expect(event.groomName).toBe('Quốc Bảo')
  expect(event.families?.BRIDE.parents).toHaveLength(2)
  expect(event.families?.GROOM.parents).toHaveLength(2)
  for (const side of ['BRIDE', 'GROOM'] as const) {
    expect(event.families?.[side].address).toBeTruthy()
    expect(event.families?.[side].fullName).toBeTruthy()
  }
  expect(
    countdownParts(event.dateTime, Date.parse('2027-11-19T17:00:00+07:00')),
  ).toEqual([1, 0, 0, 0])
  expect(event.dateLabel).toBe('20 tháng 11, 2027')
})
it('never offers sample payment QR or an unconfigured RSVP submission', () => {
  expect(event.rsvpEnabled).toBe(false)
  for (const side of ['BRIDE', 'GROOM'] as const) {
    expect(event.gifts[side].image).toBe('')
    expect(event.gifts[side].bank).toBe('')
    expect(event.gifts[side].recipient).toBe('')
  }
  expect(event.musicSrc).toBeNull()
  expect(event.photos.length).toBe(4)
})

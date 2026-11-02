import { expect, it } from 'vitest'
import { event } from '../src/config/event'
import { countdownParts } from '../src/utils/preview'

it('keeps unconfirmed event information out of production', () => {
  expect(event.dateTime).toBe('')
  expect(countdownParts(event.dateTime, Date.now())).toBeNull()
  expect(event.mapUrl).toBe('')
  expect(event.year).toBe('')
  expect(event.dateLabel).toBe('Ngày cưới sẽ được cập nhật')
})
it('never offers sample payment QR or an unconfigured RSVP submission', () => {
  expect(event.rsvpEnabled).toBe(false)
  for (const side of ['BRIDE', 'GROOM'] as const) {
    expect(event.gifts[side].image).toBe('')
    expect(event.gifts[side].bank).toBe('')
    expect(event.gifts[side].recipient).toBe('')
  }
  expect(event.musicSrc).toBeNull()
  expect(event.photos).toEqual([])
})

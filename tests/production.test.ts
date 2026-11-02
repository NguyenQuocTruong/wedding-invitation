import { expect, it } from 'vitest'
import { event } from '../src/config/event'
import { countdownParts } from '../src/utils/preview'

it('uses the confirmed couple, parents, and ceremony countdown', () => {
  expect(event.sampleContent).toBe(false)
  expect(event.brideName).toBe('Lâm Oanh')
  expect(event.groomName).toBe('Quốc Trưởng')
  expect(event.families?.BRIDE.parents).toEqual([
    'Ông Nghiêm Thế Anh',
    'Bà Nguyễn Thị Mơ',
  ])
  expect(event.families?.GROOM.parents).toEqual([
    'Ông Nguyễn Văn Cường',
    'Bà Nguyễn Thị Miền',
  ])
  for (const side of ['BRIDE', 'GROOM'] as const) {
    expect(event.families?.[side].address).toBe('Hà Nội')
  }
  expect(
    countdownParts(event.dateTime, Date.parse('2026-11-13T13:30:00+07:00')),
  ).toEqual([1, 0, 0, 0])
  expect(event.dateLabel).toBe('14 tháng 11, 2026')
})
it('provides both confirmed activities at the bride family home', () => {
  expect(event.events).toMatchObject([
    { id: 'meal', time: '10:00', dateTime: '2026-11-14T10:00:00+07:00' },
    { id: 'ceremony', time: '13:30', dateTime: '2026-11-14T13:30:00+07:00' },
  ])
  for (const activity of event.events ?? []) {
    expect(activity.dateLabel).toBe('Thứ Bảy, 14 tháng 11, 2026')
    expect(activity.lunarDate).toBe('06 tháng 10 năm Bính Ngọ')
    expect(activity.venue).toBe('Tư gia nhà gái')
    expect(activity.address).toBe('Xóm 4, Trung Lập, Phượng Dực, Hà Nội')
    expect(activity.mapUrl).toContain('https://www.google.com/maps/search/')
  }
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

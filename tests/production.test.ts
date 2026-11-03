import { expect, it } from 'vitest'
import { event } from '../src/config/event'
import { countdownParts } from '../src/utils/preview'
import sourceLayout from '../src/data/template-02-layout.json'
import sourceAssets from '../src/data/template-02-assets.json'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

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
  expect(event.photos.length).toBe(9)
})

it('reuses real photo assets from the second invitation for the hero and complete album', () => {
  const keys = sourceLayout
    .filter(
      (node) =>
        node.type === 'PhotoBox' &&
        node.props.semanticField === 'weddingPhoto' &&
        node.props.imgKey?.startsWith('uploads/'),
    )
    .map((node) => node.props.imgKey!)
  const assets = sourceAssets as Record<string, string>
  const sources = new Set(keys.map((key) => assets[key]))
  expect(sources.has(event.hero)).toBe(true)
  expect(new Set(event.photos.map((photo) => photo.src)).size).toBe(9)
  for (const photo of event.photos) {
    expect(sources.has(photo.src)).toBe(true)
    expect(existsSync(resolve('public', photo.src.slice(1)))).toBe(true)
    expect(photo.alt).toContain('Quốc Trưởng')
    expect(photo.alt).toContain('Lâm Oanh')
  }
})

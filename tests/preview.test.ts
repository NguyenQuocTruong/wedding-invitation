import { expect, it } from 'vitest'
import { isDesignPreview, countdownParts } from '../src/utils/preview'

it('isolates the preview from root and API paths', () => {
  expect(isDesignPreview('/design-preview')).toBe(true)
  expect(isDesignPreview('/design-preview/')).toBe(true)
  for (const path of ['/', '/api/rsvp', '/design-preview/other'])
    expect(isDesignPreview(path)).toBe(false)
})
it('counts in absolute time and clamps an expired event', () => {
  expect(
    countdownParts(
      '2027-01-02T01:02:03+07:00',
      Date.parse('2027-01-01T00:00:00+07:00'),
    ),
  ).toEqual([1, 1, 2, 3])
  expect(countdownParts('2020-01-01T00:00:00Z', Date.now())).toEqual([
    0, 0, 0, 0,
  ])
  expect(countdownParts('invalid', Date.now())).toBeNull()
})

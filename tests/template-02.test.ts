import { describe, expect, it } from 'vitest'
import layout from '../src/data/template-02-layout.json'
import { elementStyle, getCanvasScale } from '../src/utils/template-02'

describe('source invitation geometry', () => {
  it('caps the canvas at its source width on desktop and scales down on mobile', () => {
    expect(getCanvasScale(1440)).toBe(1)
    expect(getCanvasScale(390)).toBeCloseTo(390 / 430)
  })
  it('renders the full event background instead of a letterboxed square mask', () => {
    const node = layout.find((n) => n.id === 'WgfDuhmlui')!
    const style = elementStyle(node.props)
    expect(style.backgroundColor).toBe('#424f33')
    expect(style.maskImage).toBeUndefined()
  })
  it('preserves source partial borders and photo shadow', () => {
    const rule = layout.find((n) => n.id === '0ip-kFTx4n')!
    expect(elementStyle(rule.props).borderBottom).toContain('solid')
    expect(elementStyle(rule.props).borderTop).toBeUndefined()
    const photo = layout.find((n) => n.id === 'NUvo3-ss6F')!
    expect(elementStyle(photo.props).boxShadow).toBe(
      '0px 0px 10px 0px rgba(0, 0, 0, 0.5)',
    )
  })
  it('uses source font metrics without substituting a different typeface', () => {
    const node = layout.find((n) => n.id === 'yVBwEU9zaz')!
    expect(elementStyle(node.props).fontFamily).toBe('"HoaTay1", serif')
  })
  it('lets the source RSVP arch show through the plugin instead of painting a white card', () => {
    const node = layout.find((n) => n.id === 'KZX422DR9H')!
    expect(elementStyle(node.props, 'PluginRsvp').backgroundColor).toBe(
      'transparent',
    )
    expect(elementStyle(node.props, 'PluginRsvp').boxShadow).toBe('none')
  })
})

describe('template-02 color themes', () => {
  it('retains only the Sage theme palette and removes Original and Peach', async () => {
    const { TEMPLATE_02_THEMES } =
      await import('../src/config/template-02-themes')
    expect(Object.keys(TEMPLATE_02_THEMES)).toEqual(['sage'])
    expect(TEMPLATE_02_THEMES.sage).toBeDefined()
    expect(TEMPLATE_02_THEMES.sage.primary).toBe('#4a7c59')
    expect(TEMPLATE_02_THEMES.sage.archBg).toBe('#eaf2e8')
  })

  it('configures Sage opening page colors and flower filter', async () => {
    const { TEMPLATE_02_THEMES } =
      await import('../src/config/template-02-themes')
    const { sage } = TEMPLATE_02_THEMES

    expect(sage.opening.buttonBg).toBe('#4a7c59')
    expect(sage.opening.flowerFilter).toContain('hue-rotate')
    expect(sage.opening.backdropGradient).toContain('#5b8a68')
  })

  it('configures asset filter for top card illustrations in Sage theme', async () => {
    const { TEMPLATE_02_THEMES } =
      await import('../src/config/template-02-themes')
    expect(TEMPLATE_02_THEMES.sage.assetFilter).toContain('hue-rotate')
  })
})

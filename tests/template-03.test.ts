import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('template-03 (Hoa Mộc Hồng / boho-floral-pink)', () => {
  it('bundles valid binary floral assets, giftbox icons, and fonts in public/', () => {
    const requiredFiles = [
      'public/images/themes/boho-floral-pink/asset_1.webp',
      'public/images/themes/boho-floral-pink/asset_2.webp',
      'public/images/themes/boho-floral-pink/asset_3.webp',
      'public/images/giftbox/boho_floral_pink.webp',
      'public/images/giftbox/mini/baroque_blue.webp',
      'public/images/giftbox/mini/mahal_gold.webp',
      'public/images/giftbox/mini/crystal_floral_green.webp',
      'public/images/giftbox/mini/lien_hoa_pink.webp',
      'public/images/giftbox/mini/song_hac_red.webp',
      'public/images/giftbox/mini/royal.webp',
      'public/images/giftbox/mini/baroque_gold.webp',
      'public/fonts/boho-floral-pink/PlayfairDisplay-Variable.ttf',
      'public/fonts/boho-floral-pink/EBGaramond-Variable.ttf',
      'public/fonts/boho-floral-pink/MsMadiAmpersand-Regular.woff2',
    ]

    for (const relPath of requiredFiles) {
      const fullPath = resolve(relPath)
      expect(existsSync(fullPath), `Missing ${relPath}`).toBe(true)
      const head = readFileSync(fullPath).subarray(0, 16).toString('utf8')
      expect(head).not.toContain('<!DOCTYPE')
      expect(head).not.toContain('<html')
    }
  })

  it('clones the Hoa Mộc Hồng sections while omitting Guestbook and Map sections', () => {
    const source = readFileSync(
      resolve('src/pages/ThirdInvitation.vue'),
      'utf8',
    )

    // Required Hoa Mộc Hồng sections and canonical data bindings
    expect(source).toContain('boho-floral-pink-template')
    expect(source).toContain('THÔNG TIN LỄ')
    expect(source).toContain('Album Ảnh')
    expect(source).toContain('THÔNG TIN TIỆC')
    expect(source).toContain('DRESS CODE')
    expect(source).toContain('LỊCH TRÌNH NGÀY')
    expect(source).toContain('Hộp Quà')
    expect(source).toContain('RsvpDialog')
    expect(source).toContain('<RsvpDialog ref="rsvpDialog" side="GROOM" />')
    expect(source).toContain('GiftDialog')
    expect(source).toContain(
      '<GiftDialog ref="giftsDialog" :gifts="event.gifts" side="GROOM" />',
    )
    expect(source).toContain(':map-url="ceremony.mapUrl"')
    expect(source).toContain('ref="floatingActions"')
    expect(source).toContain('floatingActions.value?.play()')

    // Venue address confirmed in ceremony and reception sections
    expect(source).toContain('Xóm 04 - Trung Lập - Phượng Dực - Hà Nội')
    const addressOccurrences = (
      source.match(/Xóm 04 - Trung Lập - Phượng Dực - Hà Nội/g) || []
    ).length
    expect(addressOccurrences).toBe(2)
    expect(source).toContain('Xem chỉ đường')

    // Explicitly omitted per user request: Sổ lưu bút (guestbook) & Bản đồ (map)
    expect(source).not.toContain('Sổ lưu bút')
    expect(source).not.toContain('GỬI LỜI CHÚC')
    expect(source).not.toContain('invite-guestbook')
    expect(source).not.toContain('Tiệc cưới sẽ tổ chức')
    expect(source).not.toContain('google.com/maps/embed')
    expect(source).not.toContain('data-landing-screenshot-id="invite-map"')
  })

  it('routes /thiep-hong, /thiep-3 and /thiep-3/ in main.ts and vercel.json', () => {
    const mainTs = readFileSync(resolve('src/main.ts'), 'utf8')
    expect(mainTs).toContain('thiep-hong')
    expect(mainTs).toContain('thiep-3')
    expect(mainTs).toContain('./pages/ThirdInvitation.vue')

    const vercelConfig = JSON.parse(
      readFileSync(resolve('vercel.json'), 'utf8'),
    ) as { rewrites: Array<{ source: string; destination: string }> }
    const sources = vercelConfig.rewrites.map((r) => r.source)
    expect(sources).toContain('/thiep-hong')
    expect(sources).toContain('/thiep-3')
    expect(sources).toContain('/thiep-3/')
  })

  it('renders copy account button for bank numbers with or without spaces in GiftDialog', () => {
    const dialogSource = readFileSync(
      resolve('src/components/shared/GiftDialog.vue'),
      'utf8',
    )
    expect(dialogSource).toContain('Sao chép STK')
    expect(dialogSource).toContain('✓ Đã sao chép STK')
    expect(dialogSource).toContain('hasAccountDigits')
    expect(dialogSource).toContain("replace(/\\D/g, '').length >= 6")
  })
})

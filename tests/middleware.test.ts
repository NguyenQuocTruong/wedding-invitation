import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import middleware from '../middleware'

describe('Vercel Edge Geoblocking Middleware', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  function createRequest(
    path: string,
    headers: Record<string, string> = {},
  ): Request {
    return new Request(`https://example.com${path}`, {
      headers: new Headers(headers),
    })
  }

  it('allows access for whitelisted country VN (Vietnam)', () => {
    const request = createRequest('/', {
      'x-vercel-ip-country': 'VN',
      'x-vercel-ip-city': 'Hanoi',
      'x-forwarded-for': '113.190.234.12',
    })

    const response = middleware(request)
    expect(response).toBeUndefined()
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('allows access for whitelisted country DE (Germany)', () => {
    const request = createRequest('/thiep-2', {
      'x-vercel-ip-country': 'DE',
      'x-vercel-ip-city': 'Berlin',
      'x-forwarded-for': '194.12.34.56',
    })

    const response = middleware(request)
    expect(response).toBeUndefined()
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('allows access for whitelisted country CZ (Czech Republic)', () => {
    const request = createRequest('/thiep-3', {
      'x-vercel-ip-country': 'CZ',
      'x-vercel-ip-city': 'Prague',
      'x-forwarded-for': '89.176.0.1',
    })

    const response = middleware(request)
    expect(response).toBeUndefined()
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('allows access for whitelisted country JP (Japan)', () => {
    const request = createRequest('/thiep-3', {
      'x-vercel-ip-country': 'JP',
      'x-vercel-ip-city': 'Tokyo',
      'x-forwarded-for': '133.242.0.1',
    })

    const response = middleware(request)
    expect(response).toBeUndefined()
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('allows access for whitelisted country KR (South Korea)', () => {
    const request = createRequest('/thiep-2', {
      'x-vercel-ip-country': 'KR',
      'x-vercel-ip-city': 'Seoul',
      'x-forwarded-for': '211.234.0.1',
    })

    const response = middleware(request)
    expect(response).toBeUndefined()
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('blocks non-whitelisted countries (e.g. US) with HTTP 403 and warning log', async () => {
    const request = createRequest('/thiep-3', {
      'x-vercel-ip-country': 'US',
      'x-vercel-ip-city': 'New York',
      'x-forwarded-for': '203.0.113.195, 10.0.0.1',
    })

    const response = middleware(request)
    expect(response).toBeInstanceOf(Response)
    expect(response?.status).toBe(403)
    expect(response?.headers.get('Content-Type')).toContain('text/html')

    const html = await response!.text()
    expect(html).toContain('403 - Giới hạn khu vực truy cập')
    expect(html).toContain(
      'Trang web này hiện chỉ mở phục vụ người dùng tại <b>Việt Nam, Đức, Cộng hòa Séc, Nhật Bản và Hàn Quốc</b>.',
    )
    expect(html).toContain('US (New York)')

    expect(warnSpy).toHaveBeenCalledWith(
      '[BLOCKED] Quốc gia: US (New York) | IP: 203.0.113.195 | Path: /thiep-3',
    )
  })

  it('blocks requests without country header with HTTP 403 and marks as Không xác định', async () => {
    const request = createRequest('/thiep-2')

    const response = middleware(request)
    expect(response).toBeInstanceOf(Response)
    expect(response?.status).toBe(403)

    const html = await response!.text()
    expect(html).toContain('Không xác định (Unknown City)')

    expect(warnSpy).toHaveBeenCalledWith(
      '[BLOCKED] Quốc gia: Không xác định (Unknown City) | IP: Unknown IP | Path: /thiep-2',
    )
  })

  it('bypasses static files regardless of country', () => {
    const staticPaths = [
      '/_next/static/chunks/main.js',
      '/assets/index-l7oXiRg5.js',
      '/assets/index-BV5heMrY.css',
      '/favicon.ico',
      '/images/wedding-photos/wedding-hero.jpeg',
      '/images/themes/boho-floral-pink/asset_1.webp',
      '/images/giftbox/boho_floral_pink.png',
      '/fonts/boho-floral-pink/PlayfairDisplay-Variable.ttf',
      '/fonts/boho-floral-pink/MsMadiAmpersand-Regular.woff2',
      '/music.mp3',
      '/icon.svg',
      '/loading.gif',
    ]

    for (const path of staticPaths) {
      const request = createRequest(path, {
        'x-vercel-ip-country': 'US',
      })
      const response = middleware(request)
      expect(response).toBeUndefined()
      expect(warnSpy).not.toHaveBeenCalled()
    }
  })
})

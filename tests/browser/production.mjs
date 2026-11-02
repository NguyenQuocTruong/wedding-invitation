import process from 'node:process'
import console from 'node:console'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const baseUrl = process.env.PREVIEW_BASE_URL || 'http://127.0.0.1:5174'
const screenshots =
  process.env.SCREENSHOT_DIR || '/tmp/wedding-production-screenshots'
fs.mkdirSync(screenshots, { recursive: true })
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox'],
})
const errors = []
try {
  for (const width of [375, 390, 768, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    })
    const requests = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`)
    })
    page.on('request', (r) => {
      if (r.url().includes('/api/')) requests.push(r.url())
    })
    await page.goto(baseUrl)
    assert.equal(await page.locator('.preview-banner').count(), 0)
    await page.getByRole('button', { name: 'Mở thiệp', exact: true }).click()
    await page.locator('.preview-hero').waitFor()
    assert.equal(
      await page.evaluate(() => globalThis.document.activeElement?.tagName),
      'H1',
    )
    await page
      .getByRole('heading', { name: 'Ngày cưới sẽ được cập nhật' })
      .waitFor()
    assert.equal(await page.locator('.event-card a').count(), 0)
    assert.equal(await page.locator('.countdown').count(), 0)
    assert.equal(await page.locator('.gift-card').count(), 2)
    assert.equal(await page.locator('.gift-card img, .gift-card a').count(), 0)
    assert.equal(await page.locator('.gallery-item, dialog').count(), 0)
    assert.equal(await page.getByLabel('Họ và tên').isDisabled(), true)
    assert.equal(
      await page.getByRole('button', { name: 'Chưa mở xác nhận' }).isDisabled(),
      true,
    )
    // Even programmatic form submission must not simulate success in production.
    await page
      .locator('form')
      .evaluate((form) =>
        form.dispatchEvent(
          new globalThis.Event('submit', { bubbles: true, cancelable: true }),
        ),
      )
    await page.waitForTimeout(700)
    assert.equal(await page.locator('.mock-success').count(), 0)
    await page.getByRole('button', { name: 'Nhạc · Sắp có' }).click()
    await page
      .getByRole('status')
      .filter({ hasText: 'Nhạc nền sẽ được cập nhật' })
      .waitFor()
    assert.equal(await page.locator('audio').count(), 0)
    for (const selector of ['#event', '#gallery', '#rsvp', '#gifts'])
      await page.locator(selector).scrollIntoViewIfNeeded()
    assert.equal(
      await page.evaluate(
        () =>
          globalThis.document.documentElement.scrollWidth <=
          globalThis.innerWidth,
      ),
      true,
      `overflow at ${width}`,
    )
    assert.equal(
      (await page.locator('body').innerText()).includes('2027'),
      false,
    )
    assert.deepEqual(requests, [])
    await page.screenshot({
      path: `${screenshots}/production-${width}.png`,
      fullPage: true,
    })
    await page.getByRole('button', { name: 'Xem lại phong bì' }).click()
    assert.equal(
      await page.evaluate(() => globalThis.document.activeElement?.id),
      'intro-title',
    )
    await page.getByRole('button', { name: 'Bỏ qua hiệu ứng' }).click()
    await page.locator('.preview-hero').waitFor()
    await page.close()
    console.log(
      `PASS production ${width}: envelope, focus, pending content, disabled RSVP, QR/map isolation, replay, reduced motion, no API traffic`,
    )
  }
  assert.deepEqual(errors, [])
} finally {
  await browser.close()
}

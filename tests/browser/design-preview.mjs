import process from 'node:process'
import console from 'node:console'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
import assert from 'node:assert/strict'
import fs from 'node:fs'
const baseUrl = process.env.PREVIEW_BASE_URL || 'http://127.0.0.1:5174'
const screenshots =
  process.env.SCREENSHOT_DIR || '/tmp/wedding-preview-screenshots'
fs.mkdirSync(screenshots, { recursive: true })
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox'],
})
const problems = []
for (const width of [375, 390, 768, 1440]) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  const api = []
  page.on('response', (r) => {
    if (r.status() >= 400) console.log('HTTP ERROR', r.status(), r.url())
  })
  page.on('pageerror', (e) => problems.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(m.text())
  })
  page.on('request', (r) => {
    if (r.url().includes('/api/')) api.push(r.url())
  })
  await page.goto(baseUrl + '/design-preview')
  await page.getByRole('button', { name: 'Mở thiệp', exact: true }).waitFor()
  await page.screenshot({
    path: screenshots + '/envelope-' + width + '.png',
    fullPage: true,
  })
  await page.getByRole('button', { name: 'Mở thiệp', exact: true }).click()
  await page.locator('.preview-hero').waitFor()
  await page.waitForTimeout(300)
  assert.equal(
    await page.evaluate(() => globalThis.document.activeElement?.tagName),
    'H1',
  )
  for (const section of [
    '.event-section',
    '.gallery-section',
    '.countdown-section',
    '.rsvp-section',
    '.gift-section',
  ]) {
    await page.locator(section).scrollIntoViewIfNeeded()
    await page.waitForTimeout(700)
  }
  await page.evaluate(() => globalThis.scrollTo(0, 0))
  await page.waitForTimeout(250)
  assert.equal(
    await page.evaluate(
      () =>
        globalThis.document.documentElement.scrollWidth <=
        globalThis.innerWidth,
    ),
    true,
    'overflow ' + width,
  )
  await page.screenshot({
    path: screenshots + '/open-' + width + '.png',
    fullPage: true,
  })
  await page
    .getByRole('button', { name: 'Xem ảnh: Chúng mình', exact: true })
    .click()
  assert.equal(await page.locator('dialog').evaluate((d) => d.open), true)
  await page.getByRole('button', { name: 'Ảnh sau', exact: true }).click()
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('dialog').evaluate((d) => d.open), false)
  await page.getByLabel('Họ và tên').fill('Khách Demo')
  await page.locator('input[value="BRIDE"]').check()
  await page.locator('input[value="YES"]').check()
  await page.getByLabel('Gửi một lời thương').fill('Chúc hai bạn hạnh phúc')
  await page.getByRole('button', { name: 'Gửi phản hồi demo' }).click()
  await page
    .getByRole('status')
    .filter({ hasText: 'Đã hoàn tất mô phỏng' })
    .waitFor()
  await page.getByRole('button', { name: 'Thử lại bản demo' }).click()
  await page.locator('input[value="GROOM"]').check()
  await page.locator('input[value="NO"]').check()
  await page.getByRole('button', { name: 'Gửi phản hồi demo' }).click()
  await page
    .getByRole('status')
    .filter({ hasText: 'Đã hoàn tất mô phỏng' })
    .waitFor()
  assert.equal(await page.locator('.gift-card').count(), 2)
  const download = page.waitForEvent('download')
  await page
    .locator('.gift-card')
    .first()
    .getByRole('link', { name: 'Lưu ảnh mẫu' })
    .click()
  assert.equal((await download).suggestedFilename(), 'bride-demo.svg')
  await page.getByRole('button', { name: 'Nhạc · Demo' }).click()
  await page
    .getByRole('status')
    .filter({ hasText: 'Không phát hoặc tải nhạc' })
    .waitFor()
  assert.equal(await page.locator('audio').count(), 0)
  assert.equal(api.length, 0)
  await page.goto(baseUrl + '/')
  await page.getByRole('button', { name: 'Mở thiệp', exact: true }).waitFor()
  assert.equal(await page.locator('.preview-banner').count(), 0)
  console.log(
    'PASS ' +
      width +
      ': envelope, focus, layout, gallery, both RSVP sides/answers, download, music demo, no API, production root isolated',
  )
  await context.close()
}
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: 'reduce',
})
const page = await context.newPage()
await page.goto(baseUrl + '/design-preview/')
await page.getByRole('button', { name: 'Mở thiệp', exact: true }).click()
await page.locator('.preview-hero').waitFor()
assert.equal(
  await page
    .locator('.opened-invitation')
    .evaluate((e) => globalThis.getComputedStyle(e).animationName),
  'none',
)
await page.getByRole('button', { name: 'Xem lại phong bì' }).click()
assert.equal(
  await page.evaluate(() => globalThis.document.activeElement?.id),
  'intro-title',
)
await page.getByRole('button', { name: 'Bỏ qua hiệu ứng' }).click()
await page.locator('.preview-hero').waitFor()
assert.equal(
  await page.evaluate(
    () =>
      globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth,
  ),
  true,
)
await context.close()
await browser.close()
assert.deepEqual(problems, [])
console.log(
  'PASS reduced motion, trailing slash, skip animation; zero console/page errors',
)

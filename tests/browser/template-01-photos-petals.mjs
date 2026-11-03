import process from 'node:process'
import console from 'node:console'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { preview } from 'vite'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const baseUrl = process.env.PREVIEW_BASE_URL || 'http://127.0.0.1:5192'
const server = process.env.PREVIEW_BASE_URL
  ? null
  : await preview({
      preview: { host: '127.0.0.1', port: 5192, strictPort: true },
    })
const output = process.env.SCREENSHOT_DIR || '/tmp/wedding-petals-screenshots'
fs.mkdirSync(output, { recursive: true })
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
})
const problems = []
try {
  for (const width of [375, 390, 768, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    })
    page.setDefaultTimeout(10000)
    page.on('pageerror', (e) => problems.push(e.message))
    page.on('response', (r) => {
      if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`)
    })
    await page.goto(baseUrl)
    assert.equal(await page.locator('.ambient-leaves').count(), 0)
    assert.equal(await page.locator('.ambient-petals').isVisible(), false)
    await page.getByRole('button', { name: 'Mở thiệp', exact: true }).click()
    await page.locator('.preview-hero').waitFor()
    assert.equal(
      await page.evaluate(() => globalThis.document.activeElement?.tagName),
      'H1',
    )
    assert.ok(
      (await page.locator('.hero-art > img').getAttribute('src')).startsWith(
        '/template-02/',
      ),
    )
    assert.equal(await page.locator('.gallery-item').count(), 9)
    assert.equal(await page.locator('.album-group-heading').count(), 1)
    assert.equal(await page.locator('img[src^="/design-preview/"]').count(), 0)
    for (const selector of [
      '#families',
      '#event',
      '.gallery-item-8',
      '#rsvp',
      '#gifts',
    ])
      await page.locator(selector).scrollIntoViewIfNeeded()
    await page.waitForFunction(() =>
      [...globalThis.document.images].every(
        (img) => img.complete && img.naturalWidth > 0,
      ),
    )
    assert.equal(
      await page.evaluate(
        () =>
          globalThis.document.documentElement.scrollWidth <=
          globalThis.innerWidth,
      ),
      true,
      `overflow ${width}`,
    )
    await page
      .getByRole('button', {
        name: 'Xem ảnh: Ngày mình chung đôi',
        exact: true,
      })
      .click()
    assert.equal(
      await page.locator('.photo-dialog').evaluate((dialog) => dialog.open),
      true,
    )
    await page.getByRole('button', { name: 'Ảnh sau', exact: true }).click()
    await page.getByRole('button', { name: 'Ảnh trước', exact: true }).click()
    await page.keyboard.press('Escape')
    assert.equal(
      await page.locator('.photo-dialog').evaluate((dialog) => dialog.open),
      false,
    )
    await page
      .locator('img')
      .evaluateAll((images) =>
        Promise.all(images.map((image) => image.decode().catch(() => {}))),
      )
    for (const image of await page.locator('.gallery-item img').all()) {
      await image.scrollIntoViewIfNeeded()
      await page.waitForTimeout(80)
    }
    await page.waitForTimeout(200)
    await page.screenshot({
      path: `${output}/template-01-${width}.png`,
      fullPage: true,
    })
    await page.close()
    console.log(
      `PASS ${width}: nine real photos, hero, gallery, no overflow, reduced motion`,
    )
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto(baseUrl)
  assert.equal(await page.locator('.falling-petal--peach').count(), 4)
  assert.equal(await page.locator('.falling-petal--rose').count(), 8)
  assert.equal(
    await page
      .locator('.falling-petal')
      .evaluateAll(
        (petals) =>
          petals.filter(
            (p) => globalThis.getComputedStyle(p).display !== 'none',
          ).length,
      ),
    8,
  )
  assert.equal(
    await page
      .locator('.falling-petal')
      .first()
      .evaluate((p) => globalThis.getComputedStyle(p).animationName),
    'wedding-petal-fall',
  )
  assert.equal(await page.getByRole('button', { name: /hiệu ứng/ }).count(), 0)
  assert.equal(await page.locator('.ambient-petals').isVisible(), true)
  await page.goto(baseUrl + '/design-preview')
  await page.getByRole('button', { name: 'Mở thiệp', exact: true }).waitFor()
  assert.equal(await page.locator('.ambient-petals').count(), 0)
  assert.equal(await page.locator('.ambient-leaves').count(), 1)
  await page.goto(baseUrl + '/thiep-2')
  await page.getByRole('button', { name: 'Mở thiệp', exact: true }).waitFor()
  assert.equal(await page.locator('.ambient-petals').count(), 0)
  await page.close()
  assert.deepEqual(problems, [])
  console.log(
    'PASS peach/rose petals, mobile particle cap, no effects button, route isolation; no errors',
  )
} finally {
  await browser.close()
  await new Promise((resolve) =>
    server ? server.httpServer.close(resolve) : resolve(),
  )
}

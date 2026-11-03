import process from 'node:process'
import console from 'node:console'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { URL } from 'node:url'
import { preview } from 'vite'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const baseUrl = process.env.PREVIEW_BASE_URL || 'http://127.0.0.1:5193'
const server = process.env.PREVIEW_BASE_URL
  ? null
  : await preview({
      preview: { host: '127.0.0.1', port: 5193, strictPort: true },
    })
const output = process.env.SCREENSHOT_DIR || '/tmp/wedding-glass-screenshots'
fs.mkdirSync(output, { recursive: true })
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
})
const problems = []
const commonStyles = new Map()

async function verifyDock(page, width) {
  const dock = page.getByRole('complementary', { name: 'Nhạc và chỉ đường' })
  assert.equal(await dock.count(), 1)
  assert.equal(await dock.locator('.floating-action').count(), 2)
  const box = await dock.boundingBox()
  assert.ok(box.x >= 0 && box.x + box.width <= width)
  assert.ok(box.y >= 0 && box.y + box.height <= 900)
  assert.ok(width - box.x - box.width <= 17)
  assert.ok(900 - box.y - box.height <= 19)
  const [musicBox, mapBox] = await dock
    .locator('.floating-action')
    .evaluateAll((buttons) =>
      buttons.map((button) => {
        const { x, y, width, height } = button.getBoundingClientRect()
        return { x, y, width, height }
      }),
    )
  assert.equal(musicBox.x, mapBox.x)
  assert.equal(musicBox.width, mapBox.width)
  assert.ok(musicBox.y + musicBox.height < mapBox.y)
  assert.ok(musicBox.height >= 44)
  const styles = await dock.locator('button').evaluate((button) => {
    const style = globalThis.getComputedStyle(button)
    return [
      style.backgroundImage,
      style.border,
      style.borderRadius,
      style.backdropFilter,
      style.font,
      style.padding,
      style.minHeight,
    ]
  })
  if (commonStyles.has(width)) assert.deepEqual(styles, commonStyles.get(width))
  else commonStyles.set(width, styles)
  assert.equal(await page.getByRole('button', { name: /hiệu ứng/ }).count(), 0)
  assert.equal(
    await page
      .locator(
        '.clone-tools, .motion-toggle, .clone-motion-toggle, .music-control',
      )
      .count(),
    0,
  )
  const map = dock.getByRole('link', { name: 'Chỉ đường', exact: true })
  const href = new URL(await map.getAttribute('href'))
  assert.equal(href.origin, 'https://www.google.com')
  assert.equal(
    href.searchParams.get('query'),
    'Xóm 4, Trung Lập, Phượng Dực, Hà Nội',
  )
  assert.equal(await map.getAttribute('target'), '_blank')
  assert.match(await map.getAttribute('rel'), /noopener/)
  return box
}

try {
  for (const route of ['/', '/thiep-2']) {
    for (const width of [375, 390, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } })
      page.setDefaultTimeout(12000)
      page.on('pageerror', (error) => problems.push(error.message))
      page.on('response', (response) => {
        if (response.status() >= 400)
          problems.push(`${response.status()} ${response.url()}`)
      })
      const musicRequests = []
      page.on('request', (request) => {
        if (request.url().endsWith('.mp3')) musicRequests.push(request.url())
      })
      await page.goto(baseUrl + route)
      const music = page.getByRole('button', { name: 'Bật nhạc', exact: true })
      await music.waitFor()
      const originalBox = await verifyDock(page, width)
      assert.equal(await page.locator('audio').count(), 1)
      assert.equal(
        await page
          .locator('audio')
          .evaluate(
            (audio) =>
              audio.paused && !audio.autoplay && audio.preload === 'none',
          ),
        true,
      )
      assert.equal(await music.getAttribute('aria-pressed'), 'false')
      assert.deepEqual(musicRequests, [])
      assert.equal(
        await page
          .locator('.sound-signal i')
          .first()
          .evaluate((bar) => globalThis.getComputedStyle(bar).animationName),
        'none',
      )
      if (width === 390) {
        await page.screenshot({
          path: `${output}/${route === '/' ? 'template-01' : 'template-02'}-closed.png`,
        })
        // Real playback must work even above the opening overlay.
        await music.click()
        const pause = page.getByRole('button', {
          name: 'Tắt nhạc',
          exact: true,
        })
        await pause.waitFor()
        assert.equal(await pause.getAttribute('aria-pressed'), 'true')
        assert.equal(
          await page.locator('audio').evaluate((audio) => audio.paused),
          false,
        )
        assert.equal(
          await page
            .locator('.sound-signal i')
            .first()
            .evaluate((bar) => globalThis.getComputedStyle(bar).animationName),
          'glass-signal-wave',
        )
        await pause.click()
        await music.waitFor()
        assert.equal(
          await page.locator('audio').evaluate((audio) => audio.paused),
          true,
        )
        assert.equal(
          await page
            .locator('.sound-signal i')
            .first()
            .evaluate((bar) => globalThis.getComputedStyle(bar).animationName),
          'none',
        )
      }
      await page.getByRole('button', { name: 'Mở thiệp', exact: true }).click()
      await page
        .locator(route === '/' ? '.preview-hero' : '.clone-stage')
        .waitFor()
      await page.evaluate(() => globalThis.scrollTo(0, 1400))
      await page.waitForTimeout(150)
      assert.deepEqual(await verifyDock(page, width), originalBox)
      assert.equal(
        await page.evaluate(
          () =>
            globalThis.document.documentElement.scrollWidth <=
            globalThis.innerWidth,
        ),
        true,
      )
      if (width === 390 || width === 1440) {
        await page.waitForTimeout(1000)
        await page.screenshot({
          path: `${output}/${route === '/' ? 'template-01' : 'template-02'}-${width}.png`,
        })
      }
      await page.close()
      console.log(
        `PASS ${route} ${width}: vertical safe dock, shared glass styles, paused audio, directions, no effects button, no overflow`,
      )
    }
    const page = await browser.newPage({
      viewport: { width: 390, height: 900 },
      reducedMotion: 'reduce',
    })
    await page.goto(baseUrl + route)
    await page.getByRole('button', { name: 'Bật nhạc', exact: true }).click()
    await page.getByRole('button', { name: 'Tắt nhạc', exact: true }).waitFor()
    assert.equal(
      await page
        .locator('.sound-signal i')
        .first()
        .evaluate((bar) => globalThis.getComputedStyle(bar).animationName),
      'none',
    )
    await page.close()
    console.log(`PASS ${route}: real play/pause and reduced-motion signal bars`)
  }
  assert.deepEqual(problems, [])
} finally {
  await browser.close()
  await new Promise((resolve) =>
    server ? server.httpServer.close(resolve) : resolve(),
  )
}

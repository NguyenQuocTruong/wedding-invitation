import process from 'node:process'
import console from 'node:console'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { preview } from 'vite'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const baseUrl = process.env.PREVIEW_BASE_URL || 'http://127.0.0.1:5194'
const server = process.env.PREVIEW_BASE_URL
  ? null
  : await preview({
      preview: { host: '127.0.0.1', port: 5194, strictPort: true },
    })
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
})
const output = '/tmp/wedding-schedule-screenshots'
fs.mkdirSync(output, { recursive: true })
const errors = []
function observe(page) {
  page.setDefaultTimeout(8000)
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`)
  })
}
async function open(page) {
  await page.getByRole('button', { name: 'Mở thiệp', exact: true }).click()
  await page.locator('.preview-hero, .clone-stage').waitFor()
}
async function verifyNoOverlap(page, height) {
  const viewport = await page.locator('.invitation-viewport').boundingBox()
  const dock = await page.locator('.floating-actions').boundingBox()
  assert.ok(
    viewport.y + viewport.height <= dock.y + 1,
    'dock must be outside readable content',
  )
  assert.ok(dock.y + dock.height <= height + 1, 'dock inside viewport')
  assert.ok(dock.height <= 90, 'compact controls')
  assert.equal(await page.locator('.floating-action').count(), 3)
  for (const control of await page.locator('.floating-action').all()) {
    const box = await control.boundingBox()
    assert.ok(box.width >= 44 && box.height >= 44, 'touch target')
  }
  assert.equal(
    await page.evaluate(
      () =>
        globalThis.document.documentElement.scrollWidth <=
        globalThis.innerWidth,
    ),
    true,
  )
}
try {
  if (process.env.DOCK_ONLY !== '1')
    for (const route of ['/', '/thiep-2']) {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
        reducedMotion: 'reduce',
      })
      observe(page)
      const frozen = new Date('2026-11-13T06:30:00Z')
      await page.clock.install({ time: frozen })
      await page.clock.pauseAt(frozen)
      await page.goto(baseUrl + route)
      await open(page)
      assert.equal(
        await page
          .getByRole('heading', { name: 'Lịch trình ngày cưới', exact: true })
          .count(),
        1,
      )
      const events = page.locator('.timeline-event')
      assert.equal(await events.count(), 2)
      assert.match(await events.nth(0).innerText(), /10:00.*Bữa cơm thân mật/s)
      assert.match(await events.nth(1).innerText(), /13:30.*Lễ thành hôn/s)
      assert.equal(
        await events.nth(0).locator('time').getAttribute('datetime'),
        '2026-11-14T10:00:00+07:00',
      )
      const countdown = page.locator('.wedding-countdown')
      assert.equal(await countdown.count(), 1, 'one countdown per invitation')
      assert.deepEqual(
        await countdown.locator('.countdown-value').allTextContents(),
        ['01', '00', '00', '00'],
      )
      await page.clock.runFor(1000)
      assert.deepEqual(
        await countdown.locator('.countdown-value').allTextContents(),
        ['00', '23', '59', '59'],
      )
      await page.locator('.wedding-timeline').scrollIntoViewIfNeeded()
      await page.screenshot({
        path: `${output}/${route === '/' ? 'template-01' : 'template-02'}-timeline.png`,
      })
      await page.clock.fastForward(86400000)
      assert.match(await countdown.innerText(), /Ngày vui đã đến/)
      assert.equal(await countdown.locator('.countdown-value').count(), 0)
      await page.close()
      console.log(
        `PASS ${route}: confirmed timeline, shared countdown ticks and expires without negative values`,
      )
    }
  if (process.env.TIMELINE_ONLY !== '1')
    for (const route of ['/', '/thiep-2']) {
      for (const [width, height] of [
        [320, 640],
        [375, 812],
        [390, 844],
        [768, 1024],
        [1440, 900],
        [844, 390],
      ]) {
        const page = await browser.newPage({
          viewport: { width, height },
          reducedMotion: 'reduce',
        })
        observe(page)
        await page.goto(baseUrl + route)
        await page
          .getByRole('button', { name: 'Bật nhạc', exact: true })
          .waitFor()
        await verifyNoOverlap(page, height)
        if (route === '/thiep-2' && height === 390) {
          await page.screenshot({
            path: `${output}/template-02-landscape-opening.png`,
          })
          const opening = await page.locator('.slr-root').evaluate((el) => {
            const content = el
              .querySelector('.slr-content-layer')
              .getBoundingClientRect()
            const region = el.getBoundingClientRect()
            return {
              top: content.top,
              height: content.height,
              regionTop: region.top,
              regionHeight: region.height,
              overflow: globalThis.getComputedStyle(el).overflowY,
            }
          })
          if (opening.height > opening.regionHeight) {
            assert.ok(
              ['auto', 'scroll'].includes(opening.overflow),
              'short opening must allow scrolling',
            )
            assert.ok(
              opening.top >= opening.regionTop,
              'opening names must be reachable from the top',
            )
          }
        }
        await open(page)
        await page.locator('.wedding-timeline').scrollIntoViewIfNeeded()
        await verifyNoOverlap(page, height)
        if (width === 390) {
          await page
            .getByRole('button', { name: 'Gửi quà', exact: true })
            .click()
          const dialog = page.getByRole('dialog', {
            name: 'Hộp quà yêu thương',
            exact: true,
          })
          await dialog.waitFor()
          assert.equal(
            await dialog.locator('img').count(),
            0,
            'no fake payment QR',
          )
          assert.equal(
            await dialog
              .getByText('Thông tin mừng cưới sẽ được cập nhật.', {
                exact: true,
              })
              .count(),
            2,
          )
          await page.keyboard.press('Escape')
          assert.equal(await dialog.isVisible(), false)
          assert.equal(
            await page
              .getByRole('button', { name: 'Gửi quà', exact: true })
              .evaluate((b) => b === globalThis.document.activeElement),
            true,
          )
          await page.screenshot({
            path: `${output}/${route === '/' ? 'template-01' : 'template-02'}-dock.png`,
          })
        }
        await page
          .locator(
            route === '/' ? '.preview-footer button' : '.clone-end button',
          )
          .click()
        await page
          .getByRole('button', { name: 'Mở thiệp', exact: true })
          .waitFor()
        assert.equal(
          await page
            .locator('.invitation-viewport')
            .evaluate((el) => el.scrollTop),
          0,
        )
        await verifyNoOverlap(page, height)
        await page.close()
        console.log(
          `PASS ${route} ${width}x${height}: controls never overlap content, gifts, scrolling/replay, touch targets`,
        )
      }
    }
  assert.deepEqual(errors, [])
} finally {
  await browser.close()
  await new Promise((resolve) =>
    server ? server.httpServer.close(resolve) : resolve(),
  )
}

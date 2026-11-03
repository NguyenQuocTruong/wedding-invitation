import process from 'node:process'
import console from 'node:console'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { preview } from 'vite'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = process.env.PREVIEW_BASE_URL || 'http://127.0.0.1:5195'
const server = process.env.PREVIEW_BASE_URL
  ? null
  : await preview({
      preview: { host: '127.0.0.1', port: 5195, strictPort: true },
    })
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
})
fs.mkdirSync('/tmp/wedding-rsvp-screenshots', { recursive: true })
const errors = []
try {
  for (const [width, height] of [
    [320, 640],
    [390, 844],
    [844, 390],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: 'reduce',
    })
    page.setDefaultTimeout(8000)
    page.on('pageerror', (error) => errors.push(error.message))
    let submissions = 0
    page.on('request', (request) => {
      if (request.url().includes('/api/rsvp') && request.method() === 'POST')
        submissions++
    })
    await page.route('**/api/rsvp', (route) =>
      route.fulfill({
        status: route.request().method() === 'OPTIONS' ? 200 : 503,
        contentType: 'application/json',
        body: JSON.stringify(
          route.request().method() === 'OPTIONS'
            ? { enabled: false }
            : { error: 'RSVP_NOT_CONFIGURED' },
        ),
      }),
    )
    await page.goto(base + '/thiep-2')
    const chair = page.getByRole('button', {
      name: 'Xác nhận tham dự',
      exact: true,
    })
    assert.equal(await chair.count(), 1, 'chair quick action on template 2')
    assert.equal(await chair.locator('svg').count(), 1)
    await chair.click()
    const modal = page.getByRole('dialog', {
      name: 'Xác nhận tham dự',
      exact: true,
    })
    await modal.waitFor()
    const name = modal.getByRole('textbox', { name: /Họ và tên/ })
    assert.equal(await name.isEditable(), true)
    const noticeContrast = await modal
      .locator('.rsvp-availability')
      .evaluate((el) => {
        const style = globalThis.getComputedStyle(el)
        const luminance = (color) => {
          const channels = color
            .match(/[\d.]+/g)
            .slice(0, 3)
            .map(Number)
            .map((v) => {
              v /= 255
              return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
            })
          return (
            channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
          )
        }
        const a = luminance(style.color),
          b = luminance(style.backgroundColor)
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      })
    assert.ok(
      noticeContrast >= 4.5,
      'unavailable notice must be readable at normal text contrast',
    )
    assert.equal(
      await name.evaluate((el) => el === globalThis.document.activeElement),
      true,
    )
    await name.fill('Khách kiểm tra')
    await modal.getByRole('radio', { name: 'Nhà gái', exact: true }).check()
    await modal.getByRole('radio', { name: 'Mình sẽ đến', exact: true }).check()
    await modal
      .getByRole('textbox', { name: /Lời nhắn/ })
      .fill('Chúc hai bạn hạnh phúc!')
    assert.equal(
      await modal.locator('[name="guestCount"], input[type="number"]').count(),
      0,
    )
    assert.equal(
      await modal
        .getByRole('button', { name: 'Gửi xác nhận', exact: true })
        .isDisabled(),
      true,
    )
    assert.match(await modal.innerText(), /Xác nhận trực tuyến chưa mở/)
    const box = await modal.boundingBox()
    assert.ok(
      box.x >= 0 &&
        box.y >= 0 &&
        box.x + box.width <= width &&
        box.y + box.height <= height,
    )
    if (width === 390)
      await page.screenshot({
        path: '/tmp/wedding-rsvp-screenshots/modal-mobile.png',
      })
    await page.keyboard.press('Escape')
    assert.equal(await modal.isVisible(), false)
    assert.equal(
      await chair.evaluate((el) => el === globalThis.document.activeElement),
      true,
    )
    await chair.click()
    assert.equal(
      await name.inputValue(),
      'Khách kiểm tra',
      'draft preserved on close/reopen',
    )
    await modal.getByRole('radio', { name: 'Nhà trai', exact: true }).check()
    await modal
      .getByRole('radio', { name: 'Tiếc là không thể', exact: true })
      .check()
    await modal
      .getByRole('button', { name: 'Đóng xác nhận', exact: true })
      .click()
    await page.getByRole('button', { name: 'Mở thiệp', exact: true }).click()
    await page.locator('.clone-rsvp button').click()
    await modal.waitFor()
    assert.equal(
      await name.inputValue(),
      'Khách kiểm tra',
      'both entry points open the same form',
    )
    await page.keyboard.press('Escape')
    assert.equal(
      await page
        .locator('.clone-rsvp button')
        .evaluate((el) => el === globalThis.document.activeElement),
      true,
    )
    const texts = await page.locator('.clone-node').allTextContents()
    assert.ok(texts.some((text) => text.includes('10:30–12:00')))
    assert.ok(texts.some((text) => text.includes('13:00')))
    assert.equal(
      texts.some(
        (text) => text.includes('13 : 30') || text.includes('10 : 00'),
      ),
      false,
      'old source event times removed',
    )
    assert.equal(
      submissions,
      0,
      'unconfigured RSVP never claims or sends a submission',
    )
    await page.close()
    console.log(
      `PASS ${width}x${height}: chair + in-page popup, editable fields/choices, modal fit, draft/focus, honest unavailable submission, corrected source times`,
    )
  }
  // Exercise the actual Vue form and fetch client; only the unavailable Google boundary is mocked.
  const ready = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  })
  ready.setDefaultTimeout(8000)
  ready.on('pageerror', (error) => errors.push(error.message))
  let enabled = true
  const posts = []
  let releaseFirst
  let firstSeenResolve
  const firstSeen = new Promise((resolve) => {
    firstSeenResolve = resolve
  })
  const firstGate = new Promise((resolve) => {
    releaseFirst = resolve
  })
  await ready.route('**/api/rsvp', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ enabled }),
      })
      return
    }
    posts.push(route.request().postDataJSON())
    if (posts.length === 1) {
      firstSeenResolve()
      await firstGate
    }
    await route.fulfill({
      status: posts.length < 3 ? 503 : 200,
      contentType: 'application/json',
      body: JSON.stringify(
        posts.length < 3 ? { error: 'RSVP_UNAVAILABLE' } : { ok: true },
      ),
    })
  })
  await ready.goto(base + '/thiep-2')
  const chair = ready.getByRole('button', {
    name: 'Xác nhận tham dự',
    exact: true,
  })
  await chair.click()
  const modal = ready.getByRole('dialog', {
    name: 'Xác nhận tham dự',
    exact: true,
  })
  const name = modal.getByRole('textbox', { name: /Họ và tên/ })
  const message = modal.getByRole('textbox', { name: /Lời nhắn/ })
  await ready.waitForFunction(
    () => !globalThis.document.querySelector('.rsvp-submit').disabled,
  )
  await name.fill('   ')
  await modal.getByRole('radio', { name: 'Nhà trai', exact: true }).check()
  await modal.getByRole('radio', { name: 'Mình sẽ đến', exact: true }).check()
  await modal.locator('.rsvp-submit').click()
  assert.equal(posts.length, 0, 'invalid trimmed name must not be submitted')
  await name.fill('Khách kiểm tra')
  await message.fill('Chúc hai bạn hạnh phúc!')
  await modal.locator('.rsvp-submit').click()
  await firstSeen
  assert.equal(await modal.locator('.rsvp-submit').isDisabled(), true)
  assert.equal(await name.isDisabled(), true)
  assert.equal(
    await modal.getByText(/Đã gửi xác nhận thành công/).count(),
    0,
    'no success before server acknowledgment',
  )
  await modal
    .getByRole('button', { name: 'Đóng xác nhận', exact: true })
    .click()
  releaseFirst()
  await chair.click()
  await modal.getByRole('alert').waitFor()
  assert.equal(await name.inputValue(), 'Khách kiểm tra')
  await modal.locator('.rsvp-submit').click()
  await ready.waitForFunction(
    () => globalThis.document.querySelector('.rsvp-error') !== null,
  )
  assert.equal(posts.length, 2)
  assert.equal(
    posts[0].submissionId,
    posts[1].submissionId,
    'unchanged retry keeps the request ID',
  )
  assert.equal(posts[0].clientId, posts[1].clientId)
  enabled = false
  await modal
    .getByRole('button', { name: 'Đóng xác nhận', exact: true })
    .click()
  await chair.click()
  await modal
    .getByRole('button', { name: 'Kiểm tra lại', exact: true })
    .waitFor()
  assert.equal(
    (await modal.innerText()).includes(
      'Thông tin bạn điền chưa được gửi hoặc lưu.',
    ),
    false,
    'an ambiguous write must not be described as unsaved',
  )
  enabled = true
  await modal.getByRole('button', { name: 'Kiểm tra lại', exact: true }).click()
  await ready.waitForFunction(
    () => !globalThis.document.querySelector('.rsvp-submit').disabled,
  )
  await message.fill('Lời chúc đã chỉnh sửa')
  await modal.locator('.rsvp-submit').click()
  await modal.getByText(/Đã gửi xác nhận thành công/).waitFor()
  assert.equal(posts.length, 3)
  assert.notEqual(
    posts[2].submissionId,
    posts[1].submissionId,
    'edited failed response starts a new request',
  )
  assert.equal(posts[2].clientId, posts[1].clientId)
  assert.equal(await modal.locator('.rsvp-submit').isDisabled(), true)
  assert.equal(
    await modal
      .getByRole('status')
      .evaluate((el) => el === globalThis.document.activeElement),
    true,
  )
  assert.deepEqual(
    await ready.evaluate(() => Object.keys(globalThis.localStorage)),
    ['wedding-rsvp-client-id'],
    'only device UUID is persisted',
  )
  await modal
    .getByRole('button', { name: 'Gửi xác nhận mới', exact: true })
    .click()
  assert.equal(await name.inputValue(), '')
  assert.equal(await message.inputValue(), '')
  await ready.close()
  console.log(
    'PASS live form flow: validation, pending acknowledgment, safe retry IDs, edited retry IDs, private unavailable state and success/reset',
  )
  const page = await browser.newPage()
  await page.goto(base + '/')
  assert.equal(
    await page.locator('.floating-action--rsvp').count(),
    0,
    'new popup action scoped to template 2',
  )
  await page.close()
  assert.deepEqual(errors, [])
} finally {
  await browser.close()
  await new Promise((resolve) =>
    server ? server.httpServer.close(resolve) : resolve(),
  )
}

<script setup lang="ts">
import { Analytics } from '@vercel/analytics/vue'
import { nextTick, onMounted, onUnmounted, ref, type CSSProperties } from 'vue'
import sourceLayout from '../data/template-02-layout.json'
import FloatingActions from '../components/shared/FloatingActions.vue'
import InvitationFrame from '../components/shared/InvitationFrame.vue'
import GiftDialog from '../components/shared/GiftDialog.vue'
import RsvpDialog from '../components/shared/RsvpDialog.vue'
import { event } from '../config/event'
import WeddingTimeline from '../components/shared/WeddingTimeline.vue'
import WeddingCountdown from '../components/shared/WeddingCountdown.vue'
import { weddingMusic } from '../config/weddingMedia'
import wedding from '../data/wedding.json'
import { useReveal } from '../composables/useReveal'
import '../styles/template-02.css'
import {
  asset,
  nodeStyle,
  elementStyle,
  getCanvasScale,
  type LayoutNode,
  type NodeProps,
} from '../utils/template-02'
import { TEMPLATE_02_THEMES, type ThemeId } from '../config/template-02-themes'
import '../styles/template-02-fonts.css'
import '../styles/template-02-opening.css'
const nodes = (sourceLayout as LayoutNode[]).filter(
  (n) => n.id !== 'QckHkpXeK6' && n.id !== 'HTOuYYjmCZ',
)
const TOP_STAGE_HEIGHT = 3406
const BOTTOM_OFFSET = 3410
const BOTTOM_STAGE_HEIGHT = 4348 - BOTTOM_OFFSET

const currentTheme = ref<ThemeId>('sage')

// Readability overrides (canvas px, before mobile scale-down). The source layout
// used 12.9–13.8px for several lines, which renders below 10px on 320px phones.
const READABLE_FONT_SIZES: Record<string, number> = {
  // Calendar weekday labels
  tCMzAdDXCw: 14.5,
  ZivaOByuCH: 14.5,
  pwYWzzxcwB: 14.5,
  rCUQNnGdaW: 14.5,
  'ucS-7K2sSF': 14.5,
  'sNW5-RzUm4': 14.5,
  ZADmDXCmdX: 14.5,
  // Couplet
  wHG0JRLvlM: 12.9,
  '6VDnXLZvKc': 12.9,
  // Parents
  Ed3xk9f3C6: 16,
  '78T5hdX33j': 16,
  // "Vào hồi" labels
  YWfFy7Hwzq: 16,
  'paUgPUc-Ix': 16,
  // Map links
  'oxea_sD-us': 17,
  bAEsnUsTek: 17,
}

// Calibrated vertical rhythm overrides (canvas px) so sections have balanced
// breathing room (no 7px collisions and no 110px+ dead zones).
const SPACING_OVERRIDES: Record<string, Partial<NodeProps>> = {
  // Zone 2: Family headers & parents (symmetric left/right columns, 32px below Calendar card)
  oYl3EmtdXv: { top: 938, left: 6, width: 204, height: 28 },
  DTbp1fpdwl: { top: 938, left: 220, width: 204, height: 28 },
  '78T5hdX33j': { top: 978, left: 6, width: 204, height: 52 },
  Ed3xk9f3C6: { top: 978, left: 220, width: 204, height: 52 },
  '9lgMutRMS8': { top: 1062, height: 34 },
  IxamiwXUJF: { top: 1106, height: 175 },
  aTCEF52ZsB: { top: 1118, height: 45.6 },
  h5kiW7I5RO: { top: 1166, height: 43.5 },
  XJnZfJxoBp: { top: 1216, height: 46 },

  // Zone 3: Red engagement photos & couplet card (close the top-mask dead zone below couple names)
  jIOYhoanmR: { top: 1245.6, height: 329.2 },
  'NUvo3-ss6F': { top: 1246.9, height: 327.9 },
  PbWk0wRGqb: {
    top: 1352,
    left: 158,
    width: 106,
    height: 222.8,
    borderRadius: [14, 14, 14, 14],
  },
  wHG0JRLvlM: { left: 88, top: 1451, width: 178.88, height: 24 },
  '6VDnXLZvKc': { left: 118, top: 1451, width: 229.62, height: 24 },
  AfAx01WBob: { left: 193.5, top: 1450 },

  // Zone 4: Invitation heading & guest greeting (was 14.9px above green event card)
  tY18iTAVbf: { top: 1606, height: 22 },
  '87RNR5GKM4': { top: 1638, height: 56 },
  PQfSCjcV6p: { top: 1706, height: 59 },

  // Zone 5: Green Event Card & internal blocks (unified 10px/9px rhythm & symmetric dividers)
  WgfDuhmlui: { top: 1798, height: 840 },
  TcEqC8UiF3: { top: 1828, height: 31 },
  YWfFy7Hwzq: { top: 1869, height: 22 },
  rOjINyBAK1: { top: 1900, height: 30 },
  mUOyxsOBvB: { top: 1934, height: 52 },
  zWYFkJ4mQw: { top: 1988, height: 26 },
  DQxlx7_0o5: { top: 2024, height: 51 },
  IwcKKmD_Dy: { top: 2077, height: 26 },
  SyRwr0Bizr: { top: 2117, height: 36.7 },
  'oxea_sD-us': { top: 2125, height: 20 },
  '0ip-kFTx4n': { top: 2182, height: 22.5 },
  VYXl18XbmR: { top: 2210, height: 31 },
  'paUgPUc-Ix': { top: 2251, height: 22 },
  m_XVKgwfEn: { top: 2282, height: 30 },
  '9lTrOJEJY3': { top: 2316, height: 52 },
  e3NpxGM2hl: { top: 2370, height: 26 },
  '-sdqcZXJOt': { top: 2406, height: 51 },
  ZYCcF9gjAt: { top: 2459, height: 26 },
  hksbFKxd8p: { top: 2499, height: 36.7 },
  bAEsnUsTek: { top: 2507, height: 20 },
  RfnyYk7CoP: { top: 2560, height: 27.7 },
  ew3QuUAQZc: { top: 2578, height: 51 },
  SfYn6TpLmf: { top: 2567.4, height: 70.6 },

  // Zone 6: Photo grid (12px row gaps so shadows don't bleed) & centered Countdown
  RT108AH5CE: { top: 2670, height: 190 },
  pvmeq6OFX5: { top: 2670, height: 190 },
  odFP3i7HRs: { top: 2670, height: 190 },
  _Ty1C_5Ghb: { top: 2872, height: 197.4 },
  '5pck3yqslq': { top: 3081.4, height: 214.2 },
  mKzuYNCjeI: { top: 3081.4, height: 214.2 },
  RQ3mzMLUIJ: { top: 3081.4, height: 214.2 },
  CKnqYl_n8r: { top: 3328, left: 33.5, width: 363, height: 66.6 },

  // Zone 7: Bottom stage — RSVP, Hoa Moc Xanh Gift Box, Forest Photo & Thank-You note
  Am7NeCnjKk: { top: 3410, height: 310 },
  H3xwC69tfn: { opacity: 0 },
  TglqGUmVPi: { top: 3432, left: 27, width: 376, height: 74 },
  KZX422DR9H: { top: 3558, left: 0, width: 430, height: 72 },
  'dQOJShtA-K': {
    top: 3682,
    left: 0,
    width: 430,
    height: 274,
    rotation: 0,
    continuousAnimation: { type: 'none', duration: 2, delay: 0 },
  },
  T4OVXAoo80: { opacity: 0 },
  gurF8jcjvk: { top: 3968, left: 0.9, width: 429, height: 229.2 },
  QH4uLzyPJ_: { top: 4192, left: 8.4, width: 412.8, height: 44 },
  '8BXH9srgD3': { top: 4246, left: 23, width: 391.1, height: 82 },
}

function adjustedNodeProps(node: LayoutNode): NodeProps {
  const override = SPACING_OVERRIDES[node.id]
  if (override) {
    return {
      ...node.props,
      ...override,
    }
  }
  return node.props
}

function themedNodeStyle(node: LayoutNode): CSSProperties {
  const props = adjustedNodeProps(node)
  const readable = READABLE_FONT_SIZES[node.id]
  const base: CSSProperties = readable
    ? { ...elementStyle(props, node.type), fontSize: readable + 'px' }
    : elementStyle(props, node.type)

  const themeVars = TEMPLATE_02_THEMES[currentTheme.value]
  const styled: CSSProperties = { ...base }

  // Map text colors
  if (props.color === '#1c491f') {
    styled.color = themeVars.accent
  } else if (props.color?.includes('66, 79, 51') || props.color === '#424f33') {
    styled.color = themeVars.primary
  }

  // Map background colors
  if (
    props.backgroundColor === '#424f33' ||
    props.backgroundColor?.includes('66, 79, 51')
  ) {
    styled.backgroundColor = themeVars.cardBg
  } else if (props.backgroundColor === '#1c491f') {
    styled.backgroundColor = themeVars.primary
  }

  // Map SVGs & shape cards (including Calendar card yA5bCPORcy, Couplet card PbWk0wRGqb)
  if (
    props.materialType === 'svg' ||
    node.id === 'yA5bCPORcy' ||
    node.id === 'PbWk0wRGqb'
  ) {
    if (
      props.color === '#1c491f' ||
      props.color === '#424f33' ||
      props.color === '#4f3333' ||
      props.color?.includes('66, 79, 51') ||
      node.id === 'yA5bCPORcy' ||
      node.id === 'PbWk0wRGqb'
    ) {
      styled.backgroundColor = themeVars.cardBg
      styled.color = themeVars.cardBg
    }
  }

  // Map green envelope/arch decorative PNGs only (never couple .jpg photos or multi-color floral bouquets)
  if (props.imgKey && themeVars.assetFilter !== 'none') {
    const isGreenEnvelopeGraphic =
      node.id === 'l2mZjv5O_e' || // Arch frame at top
      node.id === 'lx4IwuzDxw' || // Top decorative bracket
      node.id === 'y83Rpc5YYy' // M & L ribbon bow

    if (isGreenEnvelopeGraphic) {
      styled.filter = themeVars.assetFilter
      styled.transition = 'filter 0.3s ease'
    } else if (node.id === 'AfAx01WBob') {
      // Soften pink hearts on green couplet card into warm cream/white in Sage theme
      styled.filter = 'brightness(1.85) saturate(0.25)'
      styled.transition = 'filter 0.3s ease'
    }
  }

  if (node.id === 'wHG0JRLvlM' || node.id === '6VDnXLZvKc') {
    styled.whiteSpace = 'nowrap'
  }

  if (node.id === 'Am7NeCnjKk') {
    const fadeMask =
      'linear-gradient(to bottom, transparent 0%, #000 16%, #000 74%, transparent 100%)'
    styled.maskImage = fadeMask
    styled.WebkitMaskImage = fadeMask
  }

  return styled
}

const countdownIndex = nodes.findIndex((n) => n.type === 'PluginCountDown')
const countdownNode = nodes[countdownIndex]!

const topNodes = nodes.filter(
  (n) => n.id === countdownNode.id || n.props.top < countdownNode.props.top,
)
const bottomNodes = nodes.filter(
  (n) => n.id !== countdownNode.id && n.props.top >= countdownNode.props.top,
)

function topNodeStyle(node: LayoutNode) {
  return nodeStyle(adjustedNodeProps(node))
}

function bottomNodeStyle(node: LayoutNode) {
  const p = adjustedNodeProps(node)
  return nodeStyle({ ...p, top: p.top - BOTTOM_OFFSET })
}
const shell = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)
const opened = ref(false)
const opening = ref(false)
let openingTimer: ReturnType<typeof setTimeout> | undefined
const scale = ref(1)
const photoDialog = ref<HTMLDialogElement | null>(null)
const selectedPhoto = ref('')
const rsvpDialog = ref<InstanceType<typeof RsvpDialog> | null>(null)
const giftsDialog = ref<InstanceType<typeof GiftDialog> | null>(null)
const frame = ref<InstanceType<typeof InvitationFrame> | null>(null)
const ceremony = wedding.events.find((item) => item.id === 'ceremony')!
const meal = wedding.events.find((item) => item.id === 'meal')!
const calendarDays = Array.from({ length: 42 }, (_, i) =>
  i < 6 || i > 35 ? '' : String(i - 5),
)
let observer: ResizeObserver | undefined
useReveal(content)
function displayedText(node: LayoutNode): string {
  const confirmed: Record<string, string> = {
    TcEqC8UiF3: meal.title,
    rOjINyBAK1: `${meal.time} · Thứ Bảy`,
    m_XVKgwfEn: `${ceremony.time} · Thứ Bảy`,
    yVBwEU9zaz: `${wedding.couple.groomName} & ${wedding.couple.brideName}`,
    aTCEF52ZsB: wedding.couple.groomName,
    XJnZfJxoBp: wedding.couple.brideName,
    Ed3xk9f3C6: wedding.families.BRIDE.parents.join('\n'),
    '78T5hdX33j': wedding.families.GROOM.parents.join('\n'),
    tCMzAdDXCw: 'Mon',
  }
  return confirmed[node.id] || node.props.text || ''
}
async function open() {
  if (opening.value) return
  opening.value = true
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduced)
    await new Promise<void>((resolve) => {
      openingTimer = setTimeout(resolve, 900)
    })
  opened.value = true
  opening.value = false
  await nextTick()
  content.value?.focus({ preventScroll: true })
  frame.value?.scrollToTop()
}
async function replay() {
  opened.value = false
  await nextTick()
  shell.value?.querySelector<HTMLElement>('#second-intro')?.focus()
  frame.value?.scrollToTop()
}
function showPhoto(key: string) {
  selectedPhoto.value = asset(key)
  photoDialog.value?.showModal()
}
onMounted(() => {
  observer = new ResizeObserver((entries) => {
    scale.value = getCanvasScale(entries[0]!.contentRect.width)
  })
  if (shell.value) observer.observe(shell.value)
})
onUnmounted(() => {
  observer?.disconnect()
  clearTimeout(openingTimer)
})
</script>
<template>
  <InvitationFrame ref="frame">
    <div class="clone-page" :class="'theme-' + currentTheme">
      <div ref="shell" class="clone-shell">
        <div
          v-if="!opened"
          class="slr-root"
          :class="{ 'is-opening': opening }"
          :style="{
            position: 'fixed',
            inset: '0 0 var(--actions-height)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'var(--opening-alignment, center)',
            justifyContent: 'center',
            overflowX: 'hidden',
            overflowY: 'auto',
            padding: 'var(--opening-padding, 0)',
            background:
              TEMPLATE_02_THEMES[currentTheme].opening.backdropGradient,
            transition: 'background 0.4s ease',
          }"
        >
          <div class="slr-floating-layer" aria-hidden="true">
            <div
              class="slr-floating-symbol"
              style="
                left: 29.0318%;
                color: rgb(255, 193, 7);
                font-size: 10.4945px;
                --sway: 14.6151px;
                animation: 12.3933s ease-in-out -2.5s infinite ambient-rise;
              "
            >
              囍
            </div>
            <div
              class="slr-floating-symbol"
              style="
                left: 40.4105%;
                color: rgb(255, 193, 7);
                font-size: 15.2178px;
                --sway: 0.7711px;
                animation: 17.258s ease-in-out -2.2s infinite ambient-rise;
              "
            >
              囍
            </div>
            <div
              class="slr-floating-symbol"
              style="
                left: 62.3539%;
                color: rgb(255, 215, 0);
                font-size: 12.9533px;
                --sway: -4.5127px;
                animation: 12.2138s ease-in-out -1.9s infinite ambient-rise;
              "
            >
              囍
            </div>
            <div
              class="slr-floating-symbol"
              style="
                left: 58.5176%;
                color: rgb(255, 215, 0);
                font-size: 12.0958px;
                --sway: -7.5454px;
                animation: 14.2745s ease-in-out -1.6s infinite ambient-rise;
              "
            >
              囍
            </div>
            <div
              class="slr-floating-symbol"
              style="
                left: 21.2178%;
                color: rgb(255, 193, 7);
                font-size: 15.7111px;
                --sway: 18.7097px;
                animation: 18.2817s ease-in-out -1.3s infinite ambient-rise;
              "
            >
              囍
            </div>
            <div
              class="slr-floating-symbol"
              style="
                left: 49.4994%;
                color: rgb(255, 215, 0);
                font-size: 17.687px;
                --sway: -4.778px;
                animation: 16.9206s ease-in-out -1s infinite ambient-rise;
              "
            >
              囍
            </div>
            <div
              class="slr-floating-symbol"
              style="
                left: 10.1181%;
                color: rgb(255, 107, 107);
                font-size: 19.6038px;
                --sway: 2.9281px;
                animation: 20.0456s ease-in-out -0.7s infinite ambient-rise;
              "
            >
              囍
            </div>
            <div
              class="slr-floating-symbol"
              style="
                left: 19.879%;
                color: rgb(255, 107, 107);
                font-size: 20.5409px;
                --sway: -25.5909px;
                animation: 20.0737s ease-in-out -0.4s infinite ambient-rise;
              "
            >
              囍
            </div>
            <div
              class="slr-floating-symbol"
              style="
                left: 64.8679%;
                color: rgb(255, 107, 107);
                font-size: 13.509px;
                --sway: 20.9986px;
                animation: 21.7806s ease-in-out -0.1s infinite ambient-rise;
              "
            >
              囍
            </div>
            <div
              class="slr-floating-symbol"
              style="
                left: 13.423%;
                color: rgb(255, 107, 107);
                font-size: 22.3905px;
                --sway: 14.1615px;
                animation: 19.6522s ease-in-out 0.2s infinite ambient-rise;
              "
            >
              囍
            </div>
            <div
              class="slr-floating-symbol"
              style="
                left: 55.6376%;
                color: rgb(255, 193, 7);
                font-size: 18.5154px;
                --sway: 18.2974px;
                animation: 16.8704s ease-in-out 0.5s infinite ambient-rise;
              "
            >
              囍
            </div>
            <div
              class="slr-floating-symbol"
              style="
                left: 14.3642%;
                color: rgb(255, 193, 7);
                font-size: 23.6123px;
                --sway: 0.3592px;
                animation: 18.2179s ease-in-out 0.8s infinite ambient-rise;
              "
            >
              囍
            </div>
          </div>
          <div
            class="slr-content-layer"
            style="position: relative; z-index: 10"
          >
            <div
              class="slr-ui-frame slr-ui-frame--responsive"
              data-slr-theme="vuonxuan-green"
              :style="{
                '--slr-font-display':
                  '\'UNI Chu truyen thong\', \'Baskerville\', \'Times New Roman\', serif',
                '--slr-card-glow-rgb':
                  TEMPLATE_02_THEMES[currentTheme].opening.cardGlowRgb,
                '--slr-open-button-shadow-rgb':
                  TEMPLATE_02_THEMES[currentTheme].opening.buttonShadowRgb,
                '--slr-guest-badge-bg':
                  TEMPLATE_02_THEMES[currentTheme].opening.guestBadgeBg,
                '--slr-text-color':
                  TEMPLATE_02_THEMES[currentTheme].opening.textColor,
                '--slr-open-button-bg':
                  TEMPLATE_02_THEMES[currentTheme].opening.buttonBg,
                '--slr-open-button-text-color': '#ffffff',
                '--slr-seal-base':
                  TEMPLATE_02_THEMES[currentTheme].opening.buttonBg,
              }"
            >
              <div class="slr-ui-seal">
                <svg
                  class="slr-ui-seal-heart"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  ></path>
                </svg>
              </div>
              <div class="slr-ui-card-shadow">
                <div class="slr-ui-card">
                  <img
                    src="/template-02/2be37cb2e976db19.webp"
                    alt=""
                    aria-hidden="true"
                    class="slr-ui-art slr-ui-vxg-flower-top"
                    :style="{
                      filter:
                        TEMPLATE_02_THEMES[currentTheme].opening.flowerFilter,
                      transition: 'filter 0.3s ease',
                    }"
                  /><img
                    src="/template-02/9ae458b6b007e3ae.webp"
                    alt=""
                    aria-hidden="true"
                    class="slr-ui-art slr-ui-vxg-flower-bottom"
                    :style="{
                      filter:
                        TEMPLATE_02_THEMES[currentTheme].opening.flowerFilter,
                      transition: 'filter 0.3s ease',
                    }"
                  />
                  <div class="slr-ui-text-wrap">
                    <h1
                      id="second-intro"
                      tabindex="-1"
                      class="slr-ui-couple-name"
                    >
                      <span>{{ wedding.couple.groomName }}</span
                      ><span class="slr-ui-couple-and">&amp;</span
                      ><span>{{ wedding.couple.brideName }}</span>
                    </h1>
                    <div class="slr-ui-divider">
                      <div
                        class="slr-ui-divider-line slr-ui-divider-line--left"
                      ></div>
                      <span>❦</span>
                      <div
                        class="slr-ui-divider-line slr-ui-divider-line--right"
                      ></div>
                    </div>
                    <div class="slr-ui-date">
                      <span>14 tháng 11, 2026</span>
                    </div>
                    <div class="slr-ui-invitation">
                      <p class="slr-ui-invitation-label">
                        <span>Kính mời</span>
                      </p>
                      <div class="slr-ui-guest-badge">
                        <h2>Bạn &amp; người thương</h2>
                      </div>
                      <p class="slr-ui-invitation-text">
                        <span class="slr-ui-invitation-text-content"
                          >đến dự buổi tiệc chung vui cùng gia đình</span
                        >
                      </p>
                    </div>
                    <button
                      type="button"
                      class="slr-ui-open-button"
                      :disabled="opening"
                      @click="open"
                    >
                      <span>Mở thiệp</span>
                      <div
                        class="slr-ui-open-button-shine"
                        aria-hidden="true"
                      ></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <main
          v-else
          ref="content"
          tabindex="-1"
          class="clone-main"
          aria-label="Thiệp cưới Quốc Trưởng và Lâm Oanh"
        >
          <h1 class="sr-only">
            Lễ thành hôn Quốc Trưởng và Lâm Oanh · 14 tháng 11 năm 2026
          </h1>
          <div
            class="clone-stage"
            :style="{ height: TOP_STAGE_HEIGHT * scale + 'px' }"
          >
            <div
              class="clone-canvas"
              :style="{
                height: TOP_STAGE_HEIGHT + 'px',
                transform: `scale(${scale})`,
                '--canvas-scale': scale,
              }"
            >
              <div
                v-for="node in topNodes"
                :key="node.id"
                class="clone-node"
                :style="topNodeStyle(node)"
              >
                <div
                  class="clone-element"
                  :class="{
                    'clone-reveal':
                      adjustedNodeProps(node).transition?.effectEnabled,
                  }"
                  :data-reveal="
                    adjustedNodeProps(node).transition?.effectEnabled
                      ? ''
                      : undefined
                  "
                  :data-effect="adjustedNodeProps(node).transition?.effectType"
                  :data-continuous="
                    adjustedNodeProps(node).continuousAnimation?.type
                  "
                  :style="themedNodeStyle(node)"
                >
                  <template v-if="node.type === 'TextBox'">
                    <a
                      v-if="node.props.semanticField === 'venueMapLink'"
                      :href="ceremony.mapUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      >{{ displayedText(node) }}</a
                    >
                    <p v-else>{{ displayedText(node) }}</p>
                  </template>
                  <p v-else-if="node.type === 'PluginDynamicText'">
                    {{ node.props.fallbackText }}
                  </p>
                  <template
                    v-else-if="
                      node.type === 'PhotoBox' ||
                      (node.type === 'MaterialBox' &&
                        node.props.materialType !== 'svg')
                    "
                  >
                    <button
                      v-if="
                        node.props.semanticField === 'weddingPhoto' &&
                        node.props.imgKey?.startsWith('uploads/')
                      "
                      type="button"
                      class="clone-photo-button"
                      aria-label="Xem ảnh cưới lớn"
                      @click="showPhoto(node.props.imgKey!)"
                    >
                      <img
                        :src="asset(node.props.imgKey)"
                        alt="Ảnh cưới Quốc Trưởng và Lâm Oanh"
                        :loading="node.props.top > 900 ? 'lazy' : 'eager'"
                        :style="{
                          transform: `scale(${node.props.flipX ? -1 : 1},${node.props.flipY ? -1 : 1})`,
                        }"
                      />
                    </button>
                    <img
                      v-else
                      :src="asset(node.props.imgKey)"
                      alt=""
                      aria-hidden="true"
                      :loading="node.props.top > 900 ? 'lazy' : 'eager'"
                    />
                  </template>
                  <div
                    v-else-if="node.type === 'PluginCalendar'"
                    class="clone-calendar"
                    aria-label="Lịch tháng 11 năm 2026, ngày cưới 14 tháng 11"
                  >
                    <span
                      v-for="(day, index) in calendarDays"
                      :key="index"
                      :class="{ 'wedding-day': day === '14' }"
                      >{{ day }}</span
                    >
                  </div>
                  <WeddingCountdown
                    v-else-if="node.type === 'PluginCountDown'"
                    :date-time="ceremony.dateTime"
                    compact
                  />
                </div>
              </div>
            </div>
          </div>

          <WeddingTimeline :events="wedding.events" />

          <div
            class="clone-stage"
            :style="{ height: BOTTOM_STAGE_HEIGHT * scale + 'px' }"
          >
            <div
              class="clone-canvas"
              :style="{
                height: BOTTOM_STAGE_HEIGHT + 'px',
                transform: `scale(${scale})`,
                '--canvas-scale': scale,
              }"
            >
              <div
                v-for="node in bottomNodes"
                :key="node.id"
                class="clone-node"
                :style="bottomNodeStyle(node)"
              >
                <div
                  class="clone-element"
                  :class="{
                    'clone-reveal':
                      adjustedNodeProps(node).transition?.effectEnabled,
                  }"
                  :data-reveal="
                    adjustedNodeProps(node).transition?.effectEnabled
                      ? ''
                      : undefined
                  "
                  :data-effect="adjustedNodeProps(node).transition?.effectType"
                  :data-continuous="
                    adjustedNodeProps(node).continuousAnimation?.type
                  "
                  :style="themedNodeStyle(node)"
                >
                  <template v-if="node.type === 'TextBox'">
                    <p>{{ displayedText(node) }}</p>
                  </template>
                  <template
                    v-else-if="
                      node.type === 'PhotoBox' ||
                      (node.type === 'MaterialBox' &&
                        node.props.materialType !== 'svg')
                    "
                  >
                    <button
                      v-if="
                        node.props.semanticField === 'weddingPhoto' &&
                        node.props.imgKey?.startsWith('uploads/')
                      "
                      type="button"
                      class="clone-photo-button"
                      aria-label="Xem ảnh cưới lớn"
                      @click="showPhoto(node.props.imgKey!)"
                    >
                      <img
                        :src="asset(node.props.imgKey)"
                        alt="Ảnh cưới Quốc Trưởng và Lâm Oanh"
                        loading="lazy"
                        :style="{
                          transform: `scale(${node.props.flipX ? -1 : 1},${node.props.flipY ? -1 : 1})`,
                        }"
                      />
                    </button>
                    <img
                      v-else
                      :src="asset(node.props.imgKey)"
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                    />
                  </template>
                  <div
                    v-else-if="node.type === 'PluginRsvp'"
                    class="clone-rsvp"
                  >
                    <button
                      type="button"
                      class="clone-rsvp-cta"
                      @click="rsvpDialog?.open()"
                    >
                      <span class="clone-rsvp-cta-pulse" aria-hidden="true" />
                      <span class="clone-rsvp-cta-icon" aria-hidden="true"
                        >💌</span
                      >
                      <span class="clone-rsvp-cta-label">Xác nhận tham dự</span>
                      <span class="clone-rsvp-cta-shine" aria-hidden="true" />
                    </button>
                  </div>
                  <div v-else-if="node.type === 'PluginQrBox'" class="igb-root">
                    <h2 class="igb-heading">Hộp Quà Mừng</h2>
                    <button
                      class="clone-gifts-button igb-trigger"
                      type="button"
                      aria-label="Mở hộp mừng cưới"
                      @click="giftsDialog?.open()"
                    >
                      <div class="igb-stage">
                        <span
                          class="igb-sparkle igb-sparkle-1"
                          aria-hidden="true"
                          >✦</span
                        >
                        <span
                          class="igb-sparkle igb-sparkle-2"
                          aria-hidden="true"
                          >✦</span
                        >
                        <span
                          class="igb-sparkle igb-sparkle-3"
                          aria-hidden="true"
                          >✦</span
                        >
                        <span
                          class="igb-sparkle igb-sparkle-4"
                          aria-hidden="true"
                          >✦</span
                        >
                        <div class="igb-confetti-wrap" aria-hidden="true">
                          <div class="igb-confetti igb-c1" />
                          <div class="igb-confetti igb-c2" />
                          <div class="igb-confetti igb-c3" />
                          <div class="igb-confetti igb-c4" />
                          <div class="igb-confetti igb-c5" />
                          <div class="igb-confetti igb-c6" />
                          <div class="igb-confetti igb-c7" />
                          <div class="igb-confetti igb-c8" />
                        </div>
                        <div class="igb-bob">
                          <div class="igb-shadow" aria-hidden="true" />
                          <img
                            src="/images/giftbox/mini/qasr_gold.webp"
                            alt=""
                            loading="lazy"
                            decoding="async"
                            class="igb-decor igb-decor-1"
                          />
                          <img
                            src="/images/giftbox/mini/double_phoenix_green.webp"
                            alt=""
                            loading="lazy"
                            decoding="async"
                            class="igb-decor igb-decor-2"
                          />
                          <img
                            src="/images/giftbox/mini/boho_floral_brown.webp"
                            alt=""
                            loading="lazy"
                            decoding="async"
                            class="igb-decor igb-decor-3"
                          />
                          <img
                            src="/images/giftbox/mini/song_hy_red.webp"
                            alt=""
                            loading="lazy"
                            decoding="async"
                            class="igb-decor igb-decor-4"
                          />
                          <img
                            src="/images/giftbox/boho_floral_green.webp"
                            alt="Hộp quà mừng cưới"
                            loading="lazy"
                            decoding="async"
                            class="igb-box"
                          />
                          <img
                            src="/images/giftbox/mini/riviera_blue.webp"
                            alt=""
                            loading="lazy"
                            decoding="async"
                            class="igb-decor igb-decor-5"
                          />
                          <img
                            src="/images/giftbox/mini/porcelain_v2_green.webp"
                            alt=""
                            loading="lazy"
                            decoding="async"
                            class="igb-decor igb-decor-6"
                          />
                          <img
                            src="/images/giftbox/mini/porcelain_brown.webp"
                            alt=""
                            loading="lazy"
                            decoding="async"
                            class="igb-decor igb-decor-7"
                          />
                        </div>
                      </div>
                      <p class="igb-hint">Nhấn để mở</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="clone-end">
            <a href="/">Xem thiệp 1</a
            ><button type="button" @click="replay">Xem lại mở thiệp</button>
          </footer>
        </main>
      </div>
      <RsvpDialog ref="rsvpDialog" />
      <GiftDialog ref="giftsDialog" :gifts="event.gifts" />
      <dialog
        ref="photoDialog"
        class="clone-photo-dialog"
        aria-label="Ảnh cưới lớn"
        @click="$event.target === photoDialog && photoDialog?.close()"
      >
        <button
          type="button"
          autofocus
          aria-label="Đóng ảnh"
          @click="photoDialog?.close()"
        >
          ×</button
        ><img
          v-if="selectedPhoto"
          :src="selectedPhoto"
          alt="Ảnh cưới Quốc Trưởng và Lâm Oanh"
        />
      </dialog>
    </div>
    <template #actions>
      <FloatingActions
        style="--floating-actions-width: 430px"
        :music-src="weddingMusic"
        :map-url="ceremony.mapUrl"
        rsvp
        @rsvp="rsvpDialog?.open()"
        @gifts="giftsDialog?.open()"
      />
    </template>
  </InvitationFrame>
  <Analytics />
</template>

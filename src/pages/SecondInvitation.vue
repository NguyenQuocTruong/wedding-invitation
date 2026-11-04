<script setup lang="ts">
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
const TOP_STAGE_HEIGHT = 3470
const BOTTOM_OFFSET = 3410
const BOTTOM_STAGE_HEIGHT = 4567 - BOTTOM_OFFSET

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

function adjustedNodeProps(node: LayoutNode): NodeProps {
  if (node.id === 'PbWk0wRGqb') {
    // Fit couplet background card neatly between the two red photos with rounded bottom corners
    return {
      ...node.props,
      top: 1416.67,
      left: 158,
      width: 106,
      height: 204.1,
      borderRadius: [14, 14, 14, 14],
    }
  }
  if (node.id === 'wHG0JRLvlM') {
    // Left vertical couplet line centered in the left half of the green card
    return {
      ...node.props,
      left: 88,
      top: 1504,
      width: 178.88,
      height: 24,
    }
  }
  if (node.id === '6VDnXLZvKc') {
    // Right vertical couplet line single-line centered in the right half of the green card
    return {
      ...node.props,
      left: 118,
      top: 1504,
      width: 229.62,
      height: 24,
    }
  }
  if (node.id === 'AfAx01WBob') {
    // Center the heart icon between the two vertical couplet lines
    return {
      ...node.props,
      left: 193.5,
      top: 1503,
    }
  }
  if (node.id === 'H3xwC69tfn') {
    // Hide the solid arch shape behind RSVP since the RSVP section now uses a clean floating button
    return {
      ...node.props,
      opacity: 0,
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
                    'clone-reveal': node.props.transition?.effectEnabled,
                  }"
                  :data-reveal="
                    node.props.transition?.effectEnabled ? '' : undefined
                  "
                  :data-effect="node.props.transition?.effectType"
                  :data-continuous="node.props.continuousAnimation?.type"
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
                    'clone-reveal': node.props.transition?.effectEnabled,
                  }"
                  :data-reveal="
                    node.props.transition?.effectEnabled ? '' : undefined
                  "
                  :data-effect="node.props.transition?.effectType"
                  :data-continuous="node.props.continuousAnimation?.type"
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
                  <button
                    v-else-if="node.type === 'PluginQrBox'"
                    class="clone-gifts-button"
                    type="button"
                    aria-label="Gửi quà mừng"
                    @click="giftsDialog?.open()"
                  >
                    <img
                      :src="asset(node.props.imgKey)"
                      alt="Hộp quà mừng cưới"
                      loading="lazy"
                    />
                  </button>
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
</template>

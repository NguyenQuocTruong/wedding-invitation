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
import { weddingMusic, weddingPhotos } from '../config/weddingMedia'
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
const REMOVED_NODE_IDS = new Set([
  'QckHkpXeK6', // "Thành Phố Hà Nội" (Bride family)
  'HTOuYYjmCZ', // "Thành Phố Hà Nội" (Groom family)
  '9lgMutRMS8', // "TRÂN TRỌNG BÁO TIN LỄ THÀNH HÔN CỦA"
  'tY18iTAVbf', // "TRÂN TRỌNG KÍNH MỜI"
  '87RNR5GKM4', // "Quý Khách"
  'PQfSCjcV6p', // "ĐẾN DỰ BỮA TIỆC MỪNG CHUNG VUI CÙNG GIA ĐÌNH CHÚNG TÔI"
  // Replaced with 3D Coverflow Album from template-03
  'RT108AH5CE',
  'pvmeq6OFX5',
  'odFP3i7HRs',
  '_Ty1C_5Ghb',
  '5pck3yqslq',
  'mKzuYNCjeI',
  'RQ3mzMLUIJ',
])
const nodes = (sourceLayout as LayoutNode[]).filter(
  (n) => !REMOVED_NODE_IDS.has(n.id),
)
const TOP_STAGE_HEIGHT = 2950
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
  // Calendar card narrowed slightly from 430px (full-bleed) to 394px centered (left: 18)
  yA5bCPORcy: { left: 18, width: 394 },

  // Zone 2: Family headers, parents & couple names (closed gap after removing 9lgMutRMS8)
  oYl3EmtdXv: { top: 938, left: 6, width: 204, height: 28 },
  DTbp1fpdwl: { top: 938, left: 220, width: 204, height: 28 },
  '78T5hdX33j': { top: 978, left: 6, width: 204, height: 52 },
  Ed3xk9f3C6: { top: 978, left: 220, width: 204, height: 52 },
  IxamiwXUJF: { top: 1054, height: 175 },
  aTCEF52ZsB: { top: 1066, height: 45.6 },
  h5kiW7I5RO: { top: 1114, height: 43.5 },
  XJnZfJxoBp: { top: 1164, height: 46 },

  // Zone 3: Red engagement photos & couplet card
  jIOYhoanmR: { top: 1193.6, height: 329.2 },
  'NUvo3-ss6F': { top: 1194.9, height: 327.9 },
  PbWk0wRGqb: {
    top: 1300,
    left: 158,
    width: 106,
    height: 222.8,
    borderRadius: [14, 14, 14, 14],
  },
  wHG0JRLvlM: { left: 88, top: 1399, width: 178.88, height: 24 },
  '6VDnXLZvKc': { left: 118, top: 1399, width: 229.62, height: 24 },
  AfAx01WBob: { left: 193.5, top: 1398 },

  // Zone 4: Green Event Card & internal blocks (closed gap after removing tY18iTAVbf, 87RNR5GKM4, PQfSCjcV6p)
  WgfDuhmlui: { top: 1555, height: 840 },
  TcEqC8UiF3: { top: 1585, height: 31 },
  YWfFy7Hwzq: { top: 1626, height: 22 },
  rOjINyBAK1: { top: 1657, height: 30 },
  mUOyxsOBvB: { top: 1691, height: 52 },
  zWYFkJ4mQw: { top: 1745, height: 26 },
  DQxlx7_0o5: { top: 1781, height: 51 },
  IwcKKmD_Dy: { top: 1834, height: 26 },
  SyRwr0Bizr: { top: 1874, height: 36.7 },
  'oxea_sD-us': { top: 1882, height: 20 },
  '0ip-kFTx4n': { top: 1939, height: 22.5 },
  VYXl18XbmR: { top: 1967, height: 31 },
  'paUgPUc-Ix': { top: 2008, height: 22 },
  m_XVKgwfEn: { top: 2039, height: 30 },
  '9lTrOJEJY3': { top: 2073, height: 52 },
  e3NpxGM2hl: { top: 2127, height: 26 },
  '-sdqcZXJOt': { top: 2163, height: 51 },
  ZYCcF9gjAt: { top: 2216, height: 26 },
  hksbFKxd8p: { top: 2256, height: 36.7 },
  bAEsnUsTek: { top: 2264, height: 20 },
  RfnyYk7CoP: { top: 2317, height: 27.7 },
  ew3QuUAQZc: { top: 2335, height: 51 },
  SfYn6TpLmf: { top: 2324.4, height: 70.6 },

  // Zone 5: Centered Countdown below 3D Album
  CKnqYl_n8r: { top: 2840, left: 33.5, width: 363, height: 66.6 },

  // Zone 6: Bottom stage — RSVP, Hoa Moc Xanh Gift Box, Forest Photo & Thank-You note
  Am7NeCnjKk: { top: 3410, height: 310, opacity: 0 },
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

  // Calendar section: remove green card background (yA5bCPORcy) and render calendar text directly on page background
  const CALENDAR_SECTION_NODE_IDS = new Set([
    'yA5bCPORcy', // Calendar card background SVG
    'U5U7gu1zsm', // PluginCalendar
    'zm4MN49OJ4', // "Tháng 11.2026"
    'tCMzAdDXCw', // "Mon"
    'ZivaOByuCH', // "Tue"
    'pwYWzzxcwB', // "Wed"
    'rCUQNnGdaW', // "Thu"
    'ucS-7K2sSF', // "Fri"
    'sNW5-RzUm4', // "Sat"
    'ZADmDXCmdX', // "Sun"
  ])

  if (node.id === 'yA5bCPORcy') {
    styled.display = 'none'
  } else if (CALENDAR_SECTION_NODE_IDS.has(node.id)) {
    if (props.color === '#ffffff') {
      styled.color = themeVars.accent
    }
  }

  // Remove green card background behind event details ("Dự tiệc"), render text directly on page background
  const EVENT_DETAIL_NODE_IDS = new Set([
    'WgfDuhmlui', // The green event card background SVG
    'TcEqC8UiF3', // "Dự bữa cơm thân mật"
    'YWfFy7Hwzq', // "Vào hồi"
    'rOjINyBAK1', // "10 : 00 , thứ bảy"
    'mUOyxsOBvB', // "14 . 11 . 2026"
    'zWYFkJ4mQw', // "Tức Ngày 06 Tháng 10 Năm Bính Ngọ"
    'DQxlx7_0o5', // "tại tư gia nhà gái"
    'IwcKKmD_Dy', // "Xóm 4, Trung Lập, Phượng Dực, Hà Nội"
    'SyRwr0Bizr', // Map button pill shape border
    'oxea_sD-us', // "Xem chỉ đường"
    '0ip-kFTx4n', // Divider line
    'VYXl18XbmR', // "Tham Dự hôn lễ"
    'paUgPUc-Ix', // "Vào hồi"
    'm_XVKgwfEn', // "13 : 30 , thứ bảy"
    '9lTrOJEJY3', // "14.11.2026"
    'e3NpxGM2hl', // "Tức Ngày 06 Tháng 10 Năm Bính Ngọ"
    '-sdqcZXJOt', // "tại tư gia nhà Gái"
    'ZYCcF9gjAt', // "Xóm 4, Trung Lập, Phượng Dực, Hà Nội"
    'hksbFKxd8p', // Map button pill shape border
    'bAEsnUsTek', // "Xem chỉ đường"
    'ew3QuUAQZc', // "Sự hiện diện của Quý Khách..."
    'RfnyYk7CoP', // Divider line
  ])

  if (node.id === 'WgfDuhmlui') {
    styled.display = 'none'
  } else if (EVENT_DETAIL_NODE_IDS.has(node.id)) {
    if (props.color === '#ffffff') {
      styled.color = themeVars.accent
    }
    if (props.borderColor === '#ffffff') {
      styled.borderColor = themeVars.primary
    }
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
const lightboxIndex = ref(0)
const floatingActions = ref<InstanceType<typeof FloatingActions> | null>(null)
const activeSlide = ref(0)
const totalSlides = weddingPhotos.length
let touchStartX = 0
let touchEndX = 0

function prevSlide() {
  activeSlide.value = (activeSlide.value - 1 + totalSlides) % totalSlides
}

function nextSlide() {
  activeSlide.value = (activeSlide.value + 1) % totalSlides
}

function goToSlide(index: number) {
  activeSlide.value = index
}

function getSlideOffset(index: number): number {
  let diff = index - activeSlide.value
  const half = Math.floor(totalSlides / 2)
  if (diff > half) diff -= totalSlides
  if (diff < -half) diff += totalSlides
  return diff
}

function slideStyle(index: number): CSSProperties {
  const offset = getSlideOffset(index)
  const photo = weddingPhotos[index]
  const isLandscape =
    photo?.src.includes('wedding-hero') ||
    photo?.src.includes('traditional-red-01') ||
    photo?.src.includes('traditional-red-05')
  const aspectRatio = isLandscape ? '1.5 / 1' : '0.67 / 1'
  if (offset === 0) {
    return {
      aspectRatio,
      transitionDuration: '1100ms',
      transform: 'translateX(0%) translateZ(0px) rotateY(0deg) scale(1)',
      opacity: 1,
      zIndex: 100,
    }
  }
  if (offset === 1) {
    return {
      aspectRatio,
      transitionDuration: '1100ms',
      transform:
        'translateX(60%) translateZ(-150px) rotateY(45deg) scale(0.85)',
      opacity: 0.75,
      zIndex: 99,
    }
  }
  if (offset === -1) {
    return {
      aspectRatio,
      transitionDuration: '1100ms',
      transform:
        'translateX(-60%) translateZ(-150px) rotateY(-45deg) scale(0.85)',
      opacity: 0.75,
      zIndex: 99,
    }
  }
  return {
    aspectRatio,
    transitionDuration: '1100ms',
    transform: 'translateX(0%) translateZ(-300px) rotateY(0deg) scale(0.7)',
    opacity: 0,
    zIndex: 90,
    pointerEvents: 'none',
  }
}

function handleSlideClick(index: number) {
  const offset = getSlideOffset(index)
  if (offset === 0) {
    openLightbox(index)
  } else {
    goToSlide(index)
  }
}

function onTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0]?.screenX ?? 0
}

function onTouchEnd(e: TouchEvent) {
  touchEndX = e.changedTouches[0]?.screenX ?? 0
  const delta = touchEndX - touchStartX
  if (Math.abs(delta) > 40) {
    if (delta < 0) nextSlide()
    else prevSlide()
  }
}

function openLightbox(index: number) {
  lightboxIndex.value = index
  photoDialog.value?.showModal()
}

function closeLightbox() {
  photoDialog.value?.close()
}

function prevLightbox() {
  lightboxIndex.value = (lightboxIndex.value - 1 + totalSlides) % totalSlides
}

function nextLightbox() {
  lightboxIndex.value = (lightboxIndex.value + 1) % totalSlides
}

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
interface HyBurstParticle {
  mode: 'fall' | 'rise'
  bx: string
  by: string
  dx: string
  fy: string
  rot: string
  scale: string
  size: string
  dur: string
  delay: string
  color: string
}

// 36 particles dynamically dispersed like authentic confetti / fireworks
const HY_BURST_PARTICLES: HyBurstParticle[] = [
  // Upper hemisphere / Rising firework sparks (mode: 'rise')
  {
    mode: 'rise',
    bx: '-22px',
    by: '-110px',
    dx: '-18px',
    fy: '-115px',
    rot: '-35deg',
    scale: '0.85',
    size: '15px',
    dur: '1250ms',
    delay: '0ms',
    color: '#ffd166',
  },
  {
    mode: 'rise',
    bx: '26px',
    by: '-118px',
    dx: '22px',
    fy: '-120px',
    rot: '40deg',
    scale: '0.8',
    size: '16px',
    dur: '1300ms',
    delay: '20ms',
    color: '#ff4d6d',
  },
  {
    mode: 'rise',
    bx: '-65px',
    by: '-98px',
    dx: '-32px',
    fy: '-102px',
    rot: '-55deg',
    scale: '0.75',
    size: '14px',
    dur: '1220ms',
    delay: '15ms',
    color: '#ffb703',
  },
  {
    mode: 'rise',
    bx: '70px',
    by: '-95px',
    dx: '34px',
    fy: '-100px',
    rot: '48deg',
    scale: '0.9',
    size: '17px',
    dur: '1340ms',
    delay: '25ms',
    color: '#e63946',
  },
  {
    mode: 'rise',
    bx: '-105px',
    by: '-75px',
    dx: '-42px',
    fy: '-85px',
    rot: '-70deg',
    scale: '0.7',
    size: '13px',
    dur: '1240ms',
    delay: '35ms',
    color: '#ffe8a3',
  },
  {
    mode: 'rise',
    bx: '110px',
    by: '-72px',
    dx: '45px',
    fy: '-88px',
    rot: '65deg',
    scale: '0.75',
    size: '14px',
    dur: '1280ms',
    delay: '30ms',
    color: '#ffd166',
  },
  {
    mode: 'rise',
    bx: '-42px',
    by: '-135px',
    dx: '-20px',
    fy: '-135px',
    rot: '-25deg',
    scale: '0.95',
    size: '18px',
    dur: '1380ms',
    delay: '10ms',
    color: '#e63946',
  },
  {
    mode: 'rise',
    bx: '46px',
    by: '-132px',
    dx: '24px',
    fy: '-130px',
    rot: '30deg',
    scale: '0.8',
    size: '14px',
    dur: '1350ms',
    delay: '40ms',
    color: '#ffb703',
  },
  {
    mode: 'rise',
    bx: '-140px',
    by: '-48px',
    dx: '-48px',
    fy: '-78px',
    rot: '-80deg',
    scale: '0.65',
    size: '12px',
    dur: '1200ms',
    delay: '45ms',
    color: '#ff4d6d',
  },
  {
    mode: 'rise',
    bx: '142px',
    by: '-45px',
    dx: '50px',
    fy: '-80px',
    rot: '75deg',
    scale: '0.75',
    size: '15px',
    dur: '1260ms',
    delay: '35ms',
    color: '#ffe8a3',
  },
  {
    mode: 'rise',
    bx: '-5px',
    by: '-150px',
    dx: '8px',
    fy: '-148px',
    rot: '18deg',
    scale: '0.9',
    size: '16px',
    dur: '1420ms',
    delay: '0ms',
    color: '#ffd166',
  },
  {
    mode: 'rise',
    bx: '-85px',
    by: '-115px',
    dx: '-34px',
    fy: '-112px',
    rot: '-45deg',
    scale: '0.7',
    size: '13px',
    dur: '1310ms',
    delay: '50ms',
    color: '#e63946',
  },
  {
    mode: 'rise',
    bx: '88px',
    by: '-112px',
    dx: '36px',
    fy: '-108px',
    rot: '45deg',
    scale: '0.75',
    size: '14px',
    dur: '1330ms',
    delay: '55ms',
    color: '#ffb703',
  },
  {
    mode: 'rise',
    bx: '0px',
    by: '-90px',
    dx: '-10px',
    fy: '-110px',
    rot: '-20deg',
    scale: '0.8',
    size: '14px',
    dur: '1250ms',
    delay: '65ms',
    color: '#ff4d6d',
  },
  {
    mode: 'rise',
    bx: '-165px',
    by: '-25px',
    dx: '-55px',
    fy: '-65px',
    rot: '-95deg',
    scale: '0.6',
    size: '11px',
    dur: '1180ms',
    delay: '60ms',
    color: '#ffd166',
  },
  {
    mode: 'rise',
    bx: '168px',
    by: '-22px',
    dx: '58px',
    fy: '-68px',
    rot: '90deg',
    scale: '0.65',
    size: '12px',
    dur: '1220ms',
    delay: '50ms',
    color: '#e63946',
  },
  {
    mode: 'rise',
    bx: '-28px',
    by: '-165px',
    dx: '-12px',
    fy: '-140px',
    rot: '-15deg',
    scale: '0.85',
    size: '15px',
    dur: '1450ms',
    delay: '15ms',
    color: '#ffe8a3',
  },
  {
    mode: 'rise',
    bx: '32px',
    by: '-162px',
    dx: '15px',
    fy: '-138px',
    rot: '22deg',
    scale: '0.8',
    size: '13px',
    dur: '1410ms',
    delay: '25ms',
    color: '#ffb703',
  },

  // Lower hemisphere / Gently fluttering downward confetti (mode: 'fall')
  {
    mode: 'fall',
    bx: '-92px',
    by: '-60px',
    dx: '-35px',
    fy: '140px',
    rot: '-85deg',
    scale: '0.85',
    size: '16px',
    dur: '1350ms',
    delay: '0ms',
    color: '#ffd166',
  },
  {
    mode: 'fall',
    bx: '95px',
    by: '-58px',
    dx: '38px',
    fy: '145px',
    rot: '88deg',
    scale: '0.8',
    size: '15px',
    dur: '1380ms',
    delay: '15ms',
    color: '#e63946',
  },
  {
    mode: 'fall',
    bx: '-128px',
    by: '-30px',
    dx: '-45px',
    fy: '150px',
    rot: '-105deg',
    scale: '0.75',
    size: '14px',
    dur: '1320ms',
    delay: '20ms',
    color: '#ffb703',
  },
  {
    mode: 'fall',
    bx: '130px',
    by: '-28px',
    dx: '48px',
    fy: '155px',
    rot: '108deg',
    scale: '0.85',
    size: '16px',
    dur: '1360ms',
    delay: '25ms',
    color: '#ff4d6d',
  },
  {
    mode: 'fall',
    bx: '-55px',
    by: '-72px',
    dx: '-25px',
    fy: '130px',
    rot: '-60deg',
    scale: '0.8',
    size: '15px',
    dur: '1300ms',
    delay: '10ms',
    color: '#ffe8a3',
  },
  {
    mode: 'fall',
    bx: '58px',
    by: '-70px',
    dx: '28px',
    fy: '135px',
    rot: '65deg',
    scale: '0.9',
    size: '17px',
    dur: '1340ms',
    delay: '18ms',
    color: '#ffd166',
  },
  {
    mode: 'fall',
    bx: '-150px',
    by: '5px',
    dx: '-52px',
    fy: '160px',
    rot: '-120deg',
    scale: '0.65',
    size: '13px',
    dur: '1280ms',
    delay: '30ms',
    color: '#e63946',
  },
  {
    mode: 'fall',
    bx: '152px',
    by: '8px',
    dx: '55px',
    fy: '162px',
    rot: '118deg',
    scale: '0.65',
    size: '13px',
    dur: '1290ms',
    delay: '35ms',
    color: '#ffb703',
  },
  {
    mode: 'fall',
    bx: '-75px',
    by: '-22px',
    dx: '-30px',
    fy: '165px',
    rot: '-78deg',
    scale: '0.65',
    size: '12px',
    dur: '1380ms',
    delay: '40ms',
    color: '#ff4d6d',
  },
  {
    mode: 'fall',
    bx: '78px',
    by: '-20px',
    dx: '32px',
    fy: '168px',
    rot: '80deg',
    scale: '0.75',
    size: '14px',
    dur: '1400ms',
    delay: '45ms',
    color: '#ffe8a3',
  },
  {
    mode: 'fall',
    bx: '-32px',
    by: '-40px',
    dx: '-18px',
    fy: '148px',
    rot: '-48deg',
    scale: '0.8',
    size: '15px',
    dur: '1330ms',
    delay: '22ms',
    color: '#e63946',
  },
  {
    mode: 'fall',
    bx: '35px',
    by: '-38px',
    dx: '20px',
    fy: '152px',
    rot: '52deg',
    scale: '0.75',
    size: '14px',
    dur: '1360ms',
    delay: '28ms',
    color: '#ffd166',
  },
  {
    mode: 'fall',
    bx: '-110px',
    by: '22px',
    dx: '-40px',
    fy: '172px',
    rot: '-95deg',
    scale: '0.65',
    size: '12px',
    dur: '1310ms',
    delay: '55ms',
    color: '#ffb703',
  },
  {
    mode: 'fall',
    bx: '114px',
    by: '25px',
    dx: '42px',
    fy: '175px',
    rot: '98deg',
    scale: '0.7',
    size: '13px',
    dur: '1320ms',
    delay: '60ms',
    color: '#ff4d6d',
  },
  {
    mode: 'fall',
    bx: '-180px',
    by: '15px',
    dx: '-60px',
    fy: '165px',
    rot: '-135deg',
    scale: '0.6',
    size: '11px',
    dur: '1260ms',
    delay: '40ms',
    color: '#ffd166',
  },
  {
    mode: 'fall',
    bx: '182px',
    by: '18px',
    dx: '62px',
    fy: '168px',
    rot: '130deg',
    scale: '0.6',
    size: '12px',
    dur: '1270ms',
    delay: '45ms',
    color: '#e63946',
  },
  {
    mode: 'fall',
    bx: '-15px',
    by: '-20px',
    dx: '-8px',
    fy: '158px',
    rot: '-30deg',
    scale: '0.7',
    size: '13px',
    dur: '1390ms',
    delay: '35ms',
    color: '#ffe8a3',
  },
  {
    mode: 'fall',
    bx: '18px',
    by: '-18px',
    dx: '10px',
    fy: '160px',
    rot: '35deg',
    scale: '0.75',
    size: '14px',
    dur: '1420ms',
    delay: '40ms',
    color: '#ffb703',
  },
]

async function open() {
  if (opening.value) return
  // Try gentle music autoplay on envelope open with safe default volume
  void floatingActions.value?.play()
  opening.value = true
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduced)
    await new Promise<void>((resolve) => {
      openingTimer = setTimeout(resolve, 1400)
    })
  opened.value = true
  opening.value = false
  await nextTick()
  content.value?.focus({ preventScroll: true })
  frame.value?.scrollToTop()
  // Ensure audio starts if user interaction wasn't caught before
  void floatingActions.value?.play()
}
async function replay() {
  opened.value = false
  await nextTick()
  shell.value?.querySelector<HTMLElement>('#second-intro')?.focus()
  frame.value?.scrollToTop()
}
// Map template photo nodes to user's real wedding photos
const NODE_PHOTO_OVERRIDES: Record<string, string> = {
  Gfh6fZBUdT: '/images/wedding-photos/white-dress-01.jpeg', // Top arch photo 1
  pSEot8hEia: '/images/wedding-photos/white-dress-02.jpeg', // Top arch photo 2
  zcjdCWdlXb: '/images/wedding-photos/white-dress-03.jpeg', // Calendar photo
  'NUvo3-ss6F': '/images/wedding-photos/traditional-red-02.jpeg', // Red photo left
  jIOYhoanmR: '/images/wedding-photos/traditional-red-03.jpeg', // Red photo right
  gurF8jcjvk: '/images/wedding-photos/wedding-hero.jpeg', // Bottom wide landscape photo
}

function resolvePhotoSrc(node: LayoutNode): string {
  return NODE_PHOTO_OVERRIDES[node.id] || asset(node.props.imgKey)
}

function showPhoto(key: string, nodeId?: string) {
  const fullUrl = (nodeId && NODE_PHOTO_OVERRIDES[nodeId]) || asset(key)
  const idx = weddingPhotos.findIndex((p) => p.src === fullUrl)
  if (idx !== -1) {
    openLightbox(idx)
  } else {
    selectedPhoto.value = fullUrl
    photoDialog.value?.showModal()
  }
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
              data-slr-theme="boho-floral-green"
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
              <div
                v-if="opening"
                class="slr-ui-seal-ring"
                aria-hidden="true"
              ></div>
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
                    src="/images/themes/boho-floral-green/flower.webp"
                    alt=""
                    aria-hidden="true"
                    class="slr-ui-art slr-ui-bfg-flower-left"
                  /><img
                    src="/images/themes/boho-floral-green/flower.webp"
                    alt=""
                    aria-hidden="true"
                    class="slr-ui-art slr-ui-bfg-flower-right"
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
              <div v-if="opening" class="slr-hy-burst" aria-hidden="true">
                <span class="slr-hy-shockwave"></span>
                <span
                  v-for="(p, idx) in HY_BURST_PARTICLES"
                  :key="idx"
                  class="slr-hy-particle"
                  :class="'slr-hy-particle--' + p.mode"
                  :style="{
                    '--bx': p.bx,
                    '--by': p.by,
                    '--dx': p.dx,
                    '--fy': p.fy,
                    '--rot': p.rot,
                    '--scale': p.scale,
                    '--size': p.size,
                    '--dur': p.dur,
                    '--delay': p.delay,
                    '--hy-color': p.color,
                  }"
                  >囍</span
                >
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
              <div class="boho-bg-layer" aria-hidden="true">
                <img
                  src="/images/themes/boho-floral-green/decoration_bar.webp"
                  alt=""
                  class="boho-bg-bar boho-bg-bar-top"
                />
                <img
                  src="/images/themes/boho-floral-green/flower.webp"
                  alt=""
                  class="boho-bg-flower boho-bg-top-1"
                />
                <img
                  src="/images/themes/boho-floral-green/flower.webp"
                  alt=""
                  class="boho-bg-flower boho-bg-top-2"
                />
                <img
                  src="/images/themes/boho-floral-green/flower.webp"
                  alt=""
                  class="boho-bg-flower boho-bg-top-3"
                />
                <img
                  src="/images/themes/boho-floral-green/flower.webp"
                  alt=""
                  class="boho-bg-flower boho-bg-top-4"
                />
                <img
                  src="/images/themes/boho-floral-green/flower.webp"
                  alt=""
                  loading="lazy"
                  class="boho-bg-flower boho-bg-top-5"
                />
                <img
                  src="/images/themes/boho-floral-green/flower.webp"
                  alt=""
                  loading="lazy"
                  class="boho-bg-flower boho-bg-top-6"
                />
                <img
                  src="/images/themes/boho-floral-green/flower.webp"
                  alt=""
                  loading="lazy"
                  class="boho-bg-flower boho-bg-top-7"
                />
                <img
                  src="/images/themes/boho-floral-green/flower.webp"
                  alt=""
                  loading="lazy"
                  class="boho-bg-flower boho-bg-top-8"
                />
                <img
                  src="/images/themes/boho-floral-green/flower.webp"
                  alt=""
                  loading="lazy"
                  class="boho-bg-flower boho-bg-top-9"
                />
                <img
                  src="/images/themes/boho-floral-green/flower.webp"
                  alt=""
                  loading="lazy"
                  class="boho-bg-flower boho-bg-top-10"
                />
              </div>
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
                        (node.props.imgKey?.startsWith('uploads/') ||
                          NODE_PHOTO_OVERRIDES[node.id])
                      "
                      type="button"
                      class="clone-photo-button"
                      aria-label="Xem ảnh cưới lớn"
                      @click="showPhoto(node.props.imgKey!, node.id)"
                    >
                      <img
                        :src="resolvePhotoSrc(node)"
                        alt="Ảnh cưới Quốc Trưởng và Lâm Oanh"
                        :loading="node.props.top > 900 ? 'lazy' : 'eager'"
                        :style="{
                          transform: `scale(${node.props.flipX ? -1 : 1},${node.props.flipY ? -1 : 1})`,
                        }"
                      />
                    </button>
                    <img
                      v-else
                      :src="resolvePhotoSrc(node)"
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

              <!-- 3D Coverflow Album Carousel (ported from Template 03) -->
              <div
                class="clone-node clone-album-section"
                :style="{
                  top: '2370px',
                  left: '0px',
                  width: '430px',
                  zIndex: 2,
                }"
              >
                <div class="flex flex-col items-center px-4 pt-4 pb-2 w-full">
                  <h2
                    class="uppercase font-bold tracking-wider text-center"
                    style="
                      color: var(--theme-accent, #2f5d3e);
                      font-family:
                        'Playfair Display', Georgia, 'Times New Roman', serif;
                      font-size: 21px;
                      letter-spacing: 1.5px;
                    "
                  >
                    Album Ảnh
                  </h2>
                  <div class="mt-4 w-full max-w-[390px] relative z-10">
                    <div
                      class="relative h-[340px] touch-pan-y"
                      @touchstart.passive="onTouchStart"
                      @touchend.passive="onTouchEnd"
                    >
                      <button
                        type="button"
                        aria-label="Ảnh trước"
                        class="flex absolute left-1 top-1/2 -translate-y-1/2 z-[200] w-8 h-8 items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors border-0 cursor-pointer shadow-md"
                        style="color: var(--theme-accent, #2f5d3e)"
                        @click="prevSlide"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15.75 19.5L8.25 12l7.5-7.5"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="Ảnh tiếp theo"
                        class="flex absolute right-1 top-1/2 -translate-y-1/2 z-[200] w-8 h-8 items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors border-0 cursor-pointer shadow-md"
                        style="color: var(--theme-accent, #2f5d3e)"
                        @click="nextSlide"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </button>

                      <div
                        class="relative w-full h-full flex items-center justify-center"
                        style="perspective: 1000px"
                      >
                        <div
                          v-for="(photo, index) in weddingPhotos"
                          :key="photo.src"
                          class="absolute h-[92%] rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all ease-in-out"
                          :class="{
                            'ring-2 ring-white/50': getSlideOffset(index) === 0,
                          }"
                          :style="slideStyle(index)"
                          @click="handleSlideClick(index)"
                        >
                          <img
                            :alt="photo.alt"
                            class="h-full w-full object-cover"
                            :src="photo.src"
                            loading="lazy"
                            style="object-position: 50% 20%"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="flex justify-center gap-1.5 mt-3">
                      <button
                        v-for="(photo, index) in weddingPhotos"
                        :key="photo.src"
                        type="button"
                        :aria-label="`Xem ảnh ${index + 1}`"
                        class="rounded-full transition-all duration-300 h-2 border-0 p-0 cursor-pointer"
                        :class="
                          activeSlide === index
                            ? 'w-6 opacity-80'
                            : 'w-2 opacity-30 hover:opacity-50'
                        "
                        :style="{
                          backgroundColor: 'var(--theme-accent, #2f5d3e)',
                        }"
                        @click="goToSlide(index)"
                      />
                    </div>
                  </div>
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
              <div class="boho-bg-layer" aria-hidden="true">
                <img
                  src="/images/themes/boho-floral-green/flower.webp"
                  alt=""
                  loading="lazy"
                  class="boho-bg-flower boho-bg-bottom-1"
                />
                <img
                  src="/images/themes/boho-floral-green/flower.webp"
                  alt=""
                  loading="lazy"
                  class="boho-bg-flower boho-bg-bottom-2"
                />
                <img
                  src="/images/themes/boho-floral-green/flower.webp"
                  alt=""
                  loading="lazy"
                  class="boho-bg-flower boho-bg-bottom-3"
                />
                <img
                  src="/images/themes/boho-floral-green/flower.webp"
                  alt=""
                  loading="lazy"
                  class="boho-bg-flower boho-bg-bottom-4"
                />
              </div>
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
                        (node.props.imgKey?.startsWith('uploads/') ||
                          NODE_PHOTO_OVERRIDES[node.id])
                      "
                      type="button"
                      class="clone-photo-button"
                      aria-label="Xem ảnh cưới lớn"
                      @click="showPhoto(node.props.imgKey!, node.id)"
                    >
                      <img
                        :src="resolvePhotoSrc(node)"
                        alt="Ảnh cưới Quốc Trưởng và Lâm Oanh"
                        loading="lazy"
                        :style="{
                          transform: `scale(${node.props.flipX ? -1 : 1},${node.props.flipY ? -1 : 1})`,
                        }"
                      />
                    </button>
                    <img
                      v-else
                      :src="resolvePhotoSrc(node)"
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
        class="clone-photo-lightbox"
        aria-label="Ảnh cưới lớn"
        @click="$event.target === photoDialog && closeLightbox()"
      >
        <div
          class="flex flex-col items-center h-[100dvh] w-screen px-2 sm:px-4 pt-10 sm:pt-12 pb-4 sm:pb-6 relative"
          @click="$event.target === $event.currentTarget && closeLightbox()"
        >
          <button
            type="button"
            class="absolute right-3 sm:right-5 top-3 sm:top-4 z-10 w-10 h-10 rounded-full bg-black/40 text-white text-xl flex items-center justify-center border-0 cursor-pointer hover:bg-white/20 transition-colors"
            aria-label="Đóng ảnh"
            @click="closeLightbox"
          >
            ✕
          </button>
          <div
            class="absolute top-3 sm:top-4 left-3 sm:left-5 text-white text-sm sm:text-base bg-black/40 px-3 py-1 rounded-full shadow-md z-10"
          >
            {{ lightboxIndex + 1 }} / {{ totalSlides }}
          </div>
          <div
            class="relative flex flex-1 w-full max-w-5xl items-center justify-center px-10 sm:px-14 min-h-0"
          >
            <button
              type="button"
              class="w-10 h-10 rounded-full bg-black/40 text-white text-2xl absolute left-1 sm:left-2 z-10 flex items-center justify-center border-0 cursor-pointer hover:bg-white/20 transition-colors"
              aria-label="Ảnh trước"
              @click="prevLightbox"
            >
              ‹
            </button>
            <img
              v-if="weddingPhotos[lightboxIndex]"
              :alt="weddingPhotos[lightboxIndex]!.alt"
              class="max-h-full max-w-full rounded-xl sm:rounded-2xl object-contain shadow-2xl select-none"
              draggable="false"
              :src="weddingPhotos[lightboxIndex]!.src"
            />
            <button
              type="button"
              class="w-10 h-10 rounded-full bg-black/40 text-white text-2xl absolute right-1 sm:right-2 z-10 flex items-center justify-center border-0 cursor-pointer hover:bg-white/20 transition-colors"
              aria-label="Ảnh tiếp theo"
              @click="nextLightbox"
            >
              ›
            </button>
          </div>
          <div
            class="flex-shrink-0 flex gap-2 sm:gap-3 overflow-x-auto px-3 py-2 mt-3 bg-black/30 rounded-lg backdrop-blur-sm max-w-[90vw] sm:max-w-[80vw]"
          >
            <button
              v-for="(photo, idx) in weddingPhotos"
              :key="photo.src"
              type="button"
              class="flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-md overflow-hidden transition-all duration-200 p-0 border-0 cursor-pointer bg-transparent"
              :class="
                lightboxIndex === idx
                  ? 'scale-105 shadow-lg opacity-100'
                  : 'opacity-60 hover:opacity-100'
              "
              :style="
                lightboxIndex === idx
                  ? {
                      outline: '2px solid var(--theme-accent, #2f5d3e)',
                      outlineOffset: '2px',
                    }
                  : undefined
              "
              :aria-label="`Xem ảnh ${idx + 1}`"
              @click="lightboxIndex = idx"
            >
              <img
                class="h-full w-full object-cover"
                :alt="photo.label"
                draggable="false"
                :src="photo.src"
              />
            </button>
          </div>
        </div>
      </dialog>
    </div>
    <template #actions>
      <FloatingActions
        ref="floatingActions"
        style="--floating-actions-width: 430px"
        :music-src="weddingMusic"
        :map-url="ceremony.mapUrl"
        :volume="0.4"
        rsvp
        @rsvp="rsvpDialog?.open()"
        @gifts="giftsDialog?.open()"
      />
    </template>
  </InvitationFrame>
  <Analytics />
</template>

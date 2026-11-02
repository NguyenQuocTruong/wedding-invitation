<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  type CSSProperties,
} from 'vue'
import sourceLayout from '../data/template-02-layout.json'
import assetManifest from '../data/template-02-assets.json'
import wedding from '../data/wedding.json'
import { countdownParts } from '../utils/preview'
import { useReveal } from '../composables/useReveal'
import '../styles/template-02.css'
interface NodeProps {
  top: number
  left: number
  width: number
  height: number
  rotation?: number
  zIndex?: number
  opacity?: number
  text?: string
  fallbackText?: string
  semanticField?: string
  imgKey?: string
  maskShapeImg?: string
  materialType?: string
  color?: string
  backgroundColor?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textAlign?: string
  lineHeight?: string | number
  letterSpacing?: string | number
  textTransform?: string
  padding?: number[]
  borderRadius?: number[]
  borderSize?: number
  borderColor?: string
  flipX?: boolean
  flipY?: boolean
  transition?: {
    effectType: string
    effectEnabled: boolean
    effectDuration: number
    effectDelay: number
  }
}
interface LayoutNode {
  id: string
  type: string
  props: NodeProps
}
const nodes = sourceLayout as LayoutNode[]
const assets: Record<string, string> = assetManifest
const shell = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)
const opened = ref(false)
const paused = ref(false)
const scale = ref(1)
const photoDialog = ref<HTMLDialogElement | null>(null)
const selectedPhoto = ref('')
const audio = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const musicStatus = ref('')
const now = ref(Date.now())
const ceremony = wedding.events.find((item) => item.id === 'ceremony')!
const countdown = computed(
  () => countdownParts(ceremony.dateTime, now.value) || [0, 0, 0, 0],
)
const calendarDays = Array.from({ length: 42 }, (_, i) =>
  i < 6 || i > 35 ? '' : String(i - 5),
)
let observer: ResizeObserver | undefined
let clock: ReturnType<typeof setInterval> | undefined
useReveal(content)
function displayedText(node: LayoutNode): string {
  const confirmed: Record<string, string> = {
    yVBwEU9zaz: `${wedding.couple.groomName} & ${wedding.couple.brideName}`,
    aTCEF52ZsB: wedding.couple.groomName,
    XJnZfJxoBp: wedding.couple.brideName,
    Ed3xk9f3C6: wedding.families.BRIDE.parents.join('\n'),
    '78T5hdX33j': wedding.families.GROOM.parents.join('\n'),
  }
  return confirmed[node.id] || node.props.text || ''
}
function asset(key = '') {
  return assets[key] || 'https://assets.ngaychungdoi.com/' + key
}
function nodeStyle(p: NodeProps): CSSProperties {
  return {
    top: p.top + 'px',
    left: p.left + 'px',
    width: p.width + 'px',
    height: p.height + 'px',
    zIndex: p.zIndex || 0,
    opacity: p.opacity ?? 1,
    transform: `rotate(${p.rotation || 0}deg)`,
    borderRadius: p.borderRadius?.map((x) => x + 'px').join(' '),
  }
}
function elementStyle(p: NodeProps): CSSProperties {
  const style: CSSProperties = {
    backgroundColor: p.backgroundColor?.startsWith('#')
      ? p.backgroundColor
      : 'transparent',
    color: p.color,
    fontSize: (p.fontSize || 16) + 'px',
    fontFamily: (p.fontFamily || 'Georgia') + ', PreviewLora, Georgia, serif',
    fontWeight: p.fontWeight,
    fontStyle: p.fontStyle,
    textAlign: p.textAlign as CSSProperties['textAlign'],
    lineHeight: p.lineHeight || 'normal',
    letterSpacing:
      typeof p.letterSpacing === 'number'
        ? p.letterSpacing + 'px'
        : p.letterSpacing,
    textTransform: p.textTransform as CSSProperties['textTransform'],
    padding: p.padding?.map((x) => x + 'px').join(' '),
    borderRadius: p.borderRadius?.map((x) => x + 'px').join(' '),
    border: p.borderSize
      ? `${p.borderSize}px solid ${p.borderColor}`
      : undefined,
    '--enter-duration': `${p.transition?.effectDuration || 1}s`,
    '--enter-delay': `${p.transition?.effectDelay || 0}s`,
  }
  if (p.maskShapeImg) {
    style.maskImage = `url("${asset(p.maskShapeImg)}")`
    style.maskSize = '100% 100%'
  }
  if (p.materialType === 'svg') {
    style.backgroundColor = p.color
    style.maskImage = `url("${asset(p.imgKey)}")`
    style.maskSize = '100% 100%'
  }
  return style
}
async function open() {
  opened.value = true
  await nextTick()
  content.value?.focus({ preventScroll: true })
  window.scrollTo({ top: 0, behavior: 'instant' })
}
async function replay() {
  opened.value = false
  await nextTick()
  shell.value?.querySelector<HTMLElement>('#second-intro')?.focus()
  window.scrollTo({ top: 0, behavior: 'instant' })
}
function showPhoto(key: string) {
  selectedPhoto.value = asset(key)
  photoDialog.value?.showModal()
}
async function toggleMusic() {
  if (!assets['mp3/3a627e88-dbcc-46bd-8b9d-160e5fe75e14.mp3']) {
    musicStatus.value = 'Nhạc nền chưa sẵn sàng.'
    return
  }
  if (playing.value) {
    audio.value?.pause()
    playing.value = false
    return
  }
  try {
    await audio.value?.play()
    playing.value = true
    musicStatus.value = ''
  } catch {
    musicStatus.value = 'Chưa phát được nhạc. Bạn vui lòng thử lại.'
  }
}
onMounted(() => {
  observer = new ResizeObserver((entries) => {
    scale.value = entries[0]!.contentRect.width / 430
  })
  if (shell.value) observer.observe(shell.value)
  clock = setInterval(() => (now.value = Date.now()), 1000)
})
onUnmounted(() => {
  observer?.disconnect()
  clearInterval(clock)
  audio.value?.pause()
})
</script>
<template>
  <div class="clone-page" :class="{ 'motion-disabled': paused }">
    <nav class="clone-switch" aria-label="Chọn mẫu thiệp">
      <a href="/">Thiệp 1</a><span>Thiệp 2 · Quốc Trưởng &amp; Lâm Oanh</span
      ><button type="button" :aria-pressed="paused" @click="paused = !paused">
        {{ paused ? 'Bật hiệu ứng' : 'Tắt hiệu ứng' }}
      </button>
    </nav>
    <div ref="shell" class="clone-shell">
      <section
        v-if="!opened"
        class="clone-opening"
        aria-labelledby="second-intro"
      >
        <img
          class="opening-flower top"
          :src="
            asset(
              'card-assets/opening-effect/opening-cards/themes/nature/flower_top.webp',
            )
          "
          alt=""
          aria-hidden="true"
        />
        <p class="clone-small">TRÂN TRỌNG KÍNH MỜI</p>
        <h1 id="second-intro" tabindex="-1">
          {{ wedding.couple.groomName }}<span>&amp;</span
          >{{ wedding.couple.brideName }}
        </h1>
        <div class="opening-rule"></div>
        <p class="opening-date">14 tháng 11, 2026</p>
        <p>Kính mời</p>
        <h2>Bạn &amp; người thương</h2>
        <p>đến dự buổi tiệc chung vui cùng gia đình</p>
        <button class="clone-open-button" type="button" @click="open">
          Mở thiệp <span aria-hidden="true">↗</span>
        </button>
        <img
          class="opening-flower bottom"
          :src="
            asset(
              'card-assets/opening-effect/opening-cards/themes/nature/flower_paralax.webp',
            )
          "
          alt=""
          aria-hidden="true"
        />
      </section>
      <div v-else class="clone-stage" :style="{ height: 4567 * scale + 'px' }">
        <main
          ref="content"
          tabindex="-1"
          class="clone-canvas"
          :style="{ transform: `scale(${scale})` }"
          aria-label="Thiệp cưới Quốc Trưởng và Lâm Oanh"
        >
          <h1 class="sr-only">
            Lễ thành hôn Quốc Trưởng và Lâm Oanh · 14 tháng 11 năm 2026
          </h1>
          <div
            v-for="node in nodes"
            :key="node.id"
            class="clone-node"
            :style="nodeStyle(node.props)"
          >
            <div
              class="clone-element"
              :class="{ 'clone-reveal': node.props.transition?.effectEnabled }"
              :data-reveal="
                node.props.transition?.effectEnabled ? '' : undefined
              "
              :data-effect="node.props.transition?.effectType"
              :style="elementStyle(node.props)"
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
              <div
                v-else-if="node.type === 'PluginCountDown'"
                class="clone-countdown"
                aria-label="Đếm ngược đến hôn lễ"
              >
                <div v-for="(value, index) in countdown" :key="index">
                  <strong>{{ String(value).padStart(2, '0') }}</strong
                  ><small>{{ ['Ngày', 'Giờ', 'Phút', 'Giây'][index] }}</small>
                </div>
              </div>
              <div v-else-if="node.type === 'PluginRsvp'" class="clone-rsvp">
                <h2>Xác nhận tham dự</h2>
                <p>Vui lòng liên hệ cô dâu hoặc chú rể để xác nhận.</p>
                <label
                  >Họ và tên<input
                    disabled
                    placeholder="Họ và tên của bạn" /></label
                ><button disabled type="button">
                  Chưa mở xác nhận trực tuyến</button
                ><small>Biểu mẫu chưa thu thập thông tin.</small>
              </div>
              <div v-else-if="node.type === 'PluginQrBox'" class="clone-gifts">
                <span aria-hidden="true">♡</span>
                <p>Sự hiện diện của bạn là món quà quý giá.</p>
                <small>Thông tin mừng cưới sẽ được cập nhật.</small>
              </div>
            </div>
          </div>
        </main>
      </div>
      <footer v-if="opened" class="clone-end">
        <a href="/">Xem thiệp 1</a
        ><button type="button" @click="replay">Xem lại mở thiệp</button>
      </footer>
    </div>
    <div class="clone-tools">
      <button type="button" :aria-pressed="playing" @click="toggleMusic">
        {{ playing ? 'Tắt nhạc' : 'Bật nhạc' }} ♫</button
      ><a
        v-if="opened"
        :href="ceremony.mapUrl"
        target="_blank"
        rel="noopener noreferrer"
        >Chỉ đường ↗</a
      >
      <p v-if="musicStatus" role="status">{{ musicStatus }}</p>
    </div>
    <audio
      v-if="assets['mp3/3a627e88-dbcc-46bd-8b9d-160e5fe75e14.mp3']"
      ref="audio"
      :src="assets['mp3/3a627e88-dbcc-46bd-8b9d-160e5fe75e14.mp3']"
      preload="none"
      loop
      @pause="playing = false"
    />
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
</template>

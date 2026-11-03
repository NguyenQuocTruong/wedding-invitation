<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import sourceLayout from '../data/template-02-layout.json'
import FloatingActions from '../components/shared/FloatingActions.vue'
import InvitationFrame from '../components/shared/InvitationFrame.vue'
import GiftDialog from '../components/shared/GiftDialog.vue'
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
} from '../utils/template-02'
import '../styles/template-02-fonts.css'
import '../styles/template-02-opening.css'
const nodes = sourceLayout as LayoutNode[]
const shell = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)
const opened = ref(false)
const opening = ref(false)
let openingTimer: ReturnType<typeof setTimeout> | undefined
const scale = ref(1)
const photoDialog = ref<HTMLDialogElement | null>(null)
const selectedPhoto = ref('')
const rsvpDialog = ref<HTMLDialogElement | null>(null)
const giftsDialog = ref<InstanceType<typeof GiftDialog> | null>(null)
const frame = ref<InstanceType<typeof InvitationFrame> | null>(null)
const ceremony = wedding.events.find((item) => item.id === 'ceremony')!
const calendarDays = Array.from({ length: 42 }, (_, i) =>
  i < 6 || i > 35 ? '' : String(i - 5),
)
let observer: ResizeObserver | undefined
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
    <div class="clone-page">
      <div ref="shell" class="clone-shell">
        <div
          v-if="!opened"
          class="slr-root"
          :class="{ 'is-opening': opening }"
          style="
            position: fixed;
            inset: 0 0 var(--actions-height);
            z-index: 999999;
            display: flex;
            align-items: var(--opening-alignment, center);
            justify-content: center;
            overflow-x: hidden;
            overflow-y: auto;
            padding: var(--opening-padding, 0);
            background: linear-gradient(
              to bottom right,
              #364131,
              #2c3528,
              #22291f
            );
          "
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
              style="
                --slr-font-display:
                  'UNI Chu truyen thong', 'Baskerville', 'Times New Roman',
                  serif;
                --slr-card-glow-rgb: 105, 122, 98;
                --slr-open-button-shadow-rgb: 93, 106, 87;
                --slr-guest-badge-bg: rgba(93, 106, 87, 0.1);
                --slr-text-color: #5d6a57;
                --slr-open-button-bg: #5d6a57;
                --slr-open-button-text-color: #ffffff;
              "
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
                  /><img
                    src="/template-02/9ae458b6b007e3ae.webp"
                    alt=""
                    aria-hidden="true"
                    class="slr-ui-art slr-ui-vxg-flower-bottom"
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
        <div
          v-else
          class="clone-stage"
          :style="{ height: 4567 * scale + 'px' }"
        >
          <main
            ref="content"
            tabindex="-1"
            class="clone-canvas"
            :style="{ transform: `scale(${scale})`, '--canvas-scale': scale }"
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
                :class="{
                  'clone-reveal': node.props.transition?.effectEnabled,
                }"
                :data-reveal="
                  node.props.transition?.effectEnabled ? '' : undefined
                "
                :data-effect="node.props.transition?.effectType"
                :data-continuous="node.props.continuousAnimation?.type"
                :style="elementStyle(node.props, node.type)"
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
                <div v-else-if="node.type === 'PluginRsvp'" class="clone-rsvp">
                  <div class="rsvp-head">
                    <span class="rsvp-eng">R.S.V.P.</span>
                    <h2>Xác nhận tham dự</h2>
                  </div>
                  <p>
                    Vui lòng xác nhận tham dự để chúng mình chuẩn bị lễ cưới
                    được thuận lợi và trọn vẹn nhất.
                  </p>
                  <button type="button" @click="rsvpDialog?.showModal()">
                    ♧ Gửi xác nhận
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
          </main>
        </div>
        <WeddingTimeline v-if="opened" :events="wedding.events" />
        <footer v-if="opened" class="clone-end">
          <a href="/">Xem thiệp 1</a
          ><button type="button" @click="replay">Xem lại mở thiệp</button>
        </footer>
      </div>
      <dialog
        ref="rsvpDialog"
        class="clone-form-dialog"
        aria-label="Xác nhận tham dự"
      >
        <h2>Xác nhận tham dự</h2>
        <p>
          Xác nhận trực tuyến chưa mở. Bạn vui lòng liên hệ trực tiếp cô dâu
          hoặc chú rể.
        </p>
        <label
          >Họ và tên<input disabled placeholder="Họ và tên của bạn" /></label
        ><button type="button" @click="rsvpDialog?.close()">Đóng</button>
      </dialog>
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
        :music-src="weddingMusic"
        :map-url="ceremony.mapUrl"
        @gifts="giftsDialog?.open()"
      />
    </template>
  </InvitationFrame>
</template>

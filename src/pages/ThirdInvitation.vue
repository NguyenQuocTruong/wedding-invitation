<script setup lang="ts">
import { Analytics } from '@vercel/analytics/vue'
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  type CSSProperties,
} from 'vue'
import FloatingActions from '../components/shared/FloatingActions.vue'
import GiftDialog from '../components/shared/GiftDialog.vue'
import InvitationFrame from '../components/shared/InvitationFrame.vue'
import RsvpDialog from '../components/shared/RsvpDialog.vue'
import { event } from '../config/event'
import { weddingMusic, weddingPhotos } from '../config/weddingMedia'
import wedding from '../data/wedding.json'
import '../styles/template-03.css'

const frame = ref<InstanceType<typeof InvitationFrame> | null>(null)
const pageRoot = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)
const rsvpDialog = ref<InstanceType<typeof RsvpDialog> | null>(null)
const giftsDialog = ref<InstanceType<typeof GiftDialog> | null>(null)
const lightboxDialog = ref<HTMLDialogElement | null>(null)

const ceremony = wedding.events.find((item) => item.id === 'ceremony')!
const meal = wedding.events.find((item) => item.id === 'meal')!
const receptionStartTime = meal.time.split('–')[0] || meal.time

const initialOpen =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('open') === '1'

const opened = ref(initialOpen)
const opening = ref(false)
let openingTimer: ReturnType<typeof setTimeout> | undefined

// Ambient falling cherry blossoms for the envelope screen (exact Hoa Moc Hong config)
const ambientPetals = [
  {
    left: '59.15%',
    color: '#BAB4C7',
    fontSize: '19.5px',
    sway: '14.35px',
    duration: '25.78s',
    delay: '-24.84s',
  },
  {
    left: '52.87%',
    color: '#d4b8b4',
    fontSize: '12.16px',
    sway: '10.3px',
    duration: '20.8s',
    delay: '-18.71s',
  },
  {
    left: '33.92%',
    color: '#BAB4C7',
    fontSize: '22.91px',
    sway: '14.15px',
    duration: '20.65s',
    delay: '-11.19s',
  },
  {
    left: '46.29%',
    color: '#d4b8b4',
    fontSize: '12.47px',
    sway: '4.77px',
    duration: '21.76s',
    delay: '-12.09s',
  },
  {
    left: '78.95%',
    color: '#e8a8a0',
    fontSize: '18.26px',
    sway: '29.83px',
    duration: '22.23s',
    delay: '-13.83s',
  },
  {
    left: '48.14%',
    color: '#e8a8a0',
    fontSize: '15.63px',
    sway: '-23.9px',
    duration: '18.59s',
    delay: '-10.13s',
  },
  {
    left: '58.88%',
    color: '#F5C6C9',
    fontSize: '16.54px',
    sway: '22.03px',
    duration: '24.87s',
    delay: '-2.99s',
  },
  {
    left: '53.81%',
    color: '#F5C6C9',
    fontSize: '19.96px',
    sway: '28.57px',
    duration: '25.99s',
    delay: '-13.57s',
  },
  {
    left: '19.55%',
    color: '#F5C6C9',
    fontSize: '14.27px',
    sway: '-1.02px',
    duration: '23.68s',
    delay: '-7.88s',
  },
  {
    left: '69.32%',
    color: '#F5C6C9',
    fontSize: '11.74px',
    sway: '19.04px',
    duration: '21.98s',
    delay: '-13.15s',
  },
  {
    left: '29.24%',
    color: '#BAB4C7',
    fontSize: '22.7px',
    sway: '22.68px',
    duration: '20.81s',
    delay: '-0.28s',
  },
  {
    left: '47.87%',
    color: '#BAB4C7',
    fontSize: '22.11px',
    sway: '14.67px',
    duration: '18.49s',
    delay: '-2.24s',
  },
]

const burstParticles = Array.from({ length: 30 }, (_, index) => {
  const angle = (index / 30) * Math.PI * 2 + (index % 3) * 0.18
  const distance = 90 + (index % 5) * 38
  const dx = Math.round(Math.cos(angle) * distance)
  const dy = Math.round(Math.sin(angle) * distance - 30)
  const colors = ['#F5C6C9', '#e8a8a0', '#BAB4C7', '#d4b8b4']
  return {
    id: index,
    dx: `${dx}px`,
    dy: `${dy}px`,
    rotStart: `${(index % 7) * 12 - 36}deg`,
    rotEnd: `${(index % 2 === 0 ? 1 : -1) * (120 + (index % 5) * 45)}deg`,
    size: `${13 + (index % 4) * 4}px`,
    delay: `${(index % 6) * 0.03}s`,
    duration: `${0.75 + (index % 4) * 0.12}s`,
    color: colors[index % colors.length]!,
  }
})

async function openInvitation() {
  if (opening.value) return
  opening.value = true
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduced) {
    await new Promise<void>((resolve) => {
      openingTimer = setTimeout(resolve, 900)
    })
  }
  opened.value = true
  opening.value = false
  await nextTick()
  content.value?.focus({ preventScroll: true })
  frame.value?.scrollToTop()
}

async function replay() {
  opened.value = false
  opening.value = false
  await nextTick()
  frame.value?.scrollToTop()
}

// Scroll parallax for background floral watermarks & sprigs
const scrollY = ref(0)
let scrollTarget: HTMLElement | Window | null = null

function handleScroll() {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    scrollY.value = 0
    return
  }
  if (scrollTarget && scrollTarget !== window) {
    scrollY.value = (scrollTarget as HTMLElement).scrollTop
  } else if (typeof window !== 'undefined') {
    scrollY.value = window.scrollY
  }
}

// 3D Coverflow Album Carousel + Lightbox
const activeSlide = ref(0)
const lightboxIndex = ref(0)
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
  // Match portrait/landscape aspect ratios in coverflow
  const aspectRatio = photo?.group === 'red' ? '0.67 / 1' : '1.2 / 1'
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
  lightboxDialog.value?.showModal()
}

function closeLightbox() {
  lightboxDialog.value?.close()
}

function prevLightbox() {
  lightboxIndex.value = (lightboxIndex.value - 1 + totalSlides) % totalSlides
}

function nextLightbox() {
  lightboxIndex.value = (lightboxIndex.value + 1) % totalSlides
}

// November 2026 Calendar: Nov 1, 2026 is Sunday (T2..CN -> 6 leading blank cells + 30 days)
const calendarCells = [
  ...Array.from({ length: 6 }, () => ''),
  ...Array.from({ length: 30 }, (_, idx) => String(idx + 1)),
]

const googleCalendarUrl = computed(() => {
  const title = encodeURIComponent(
    `Đám cưới ${wedding.couple.groomName} & ${wedding.couple.brideName}`,
  )
  const details = encodeURIComponent(
    `Tiệc cưới của ${wedding.couple.groomName} & ${wedding.couple.brideName} tại ${meal.venue}, ${meal.address}`,
  )
  const location = encodeURIComponent(`${meal.venue}, ${meal.address}`)
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20261114T033000Z/20261114T050000Z&ctz=Asia/Ho_Chi_Minh&details=${details}&location=${location}`
})

onMounted(() => {
  const viewportEl = pageRoot.value?.closest(
    '.invitation-viewport',
  ) as HTMLElement | null
  scrollTarget = viewportEl || window
  scrollTarget.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  scrollTarget?.removeEventListener('scroll', handleScroll)
  clearTimeout(openingTimer)
})
</script>

<template>
  <InvitationFrame ref="frame">
    <div ref="pageRoot" class="boho-pink-page">
      <!-- Envelope Opening Screen -->
      <div
        v-if="!opened"
        data-landing-screenshot-id="invite-envelope"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        :style="{
          inset: '0 0 var(--actions-height, 0px)',
          background:
            'linear-gradient(to bottom right, #6b2d3a, #4a1f28, #2e1219)',
        }"
      >
        <!-- Falling Sakura Petals -->
        <div
          class="absolute inset-0 pointer-events-none overflow-hidden"
          style="z-index: 1"
          aria-hidden="true"
        >
          <div
            v-for="(petal, idx) in ambientPetals"
            :key="idx"
            class="absolute"
            :style="{
              left: petal.left,
              top: '-30px',
              bottom: 'auto',
              color: petal.color,
              fontSize: petal.fontSize,
              '--sway': petal.sway,
              animation: `ambient-fall ${petal.duration} ease-in-out ${petal.delay} infinite`,
            }"
          >
            🌸
          </div>
        </div>

        <!-- Particle Burst on Opening -->
        <div
          v-if="opening"
          class="absolute inset-0 pointer-events-none overflow-hidden"
          style="z-index: 28"
          aria-hidden="true"
        >
          <div
            v-for="p in burstParticles"
            :key="p.id"
            class="absolute left-1/2 top-1/2"
            :style="{
              color: p.color,
              fontSize: p.size,
              '--dx': p.dx,
              '--dy': p.dy,
              '--rot-start': p.rotStart,
              '--rot-end': p.rotEnd,
              animation: `particle-burst ${p.duration} cubic-bezier(0.16, 1, 0.3, 1) ${p.delay} forwards`,
            }"
          >
            🌸
          </div>
        </div>

        <!-- Envelope Card -->
        <div class="relative" style="z-index: 10">
          <div
            class="relative w-[310px] sm:w-[340px] md:w-[520px] lg:w-[600px]"
            :style="
              opening
                ? {
                    animation:
                      'envelope-away 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.15s forwards',
                  }
                : undefined
            "
          >
            <!-- Wax Seal Ring on Break -->
            <div
              v-if="opening"
              aria-hidden="true"
              class="absolute left-1/2 rounded-full pointer-events-none"
              :style="{
                top: '50px',
                width: '56px',
                height: '56px',
                border: '2px solid #9D6D63',
                zIndex: 29,
                animation: 'seal-ring 0.6s ease-out forwards',
              }"
            />

            <!-- Wax Seal -->
            <div
              class="absolute left-1/2 rounded-full flex items-center justify-center"
              :style="{
                top: '50px',
                width: '56px',
                height: '56px',
                transform: 'translate(-50%, -50%)',
                background:
                  'radial-gradient(circle at 30% 30%, #9D6D63, rgb(127, 79, 69))',
                '--shadow-color': 'rgba(157, 109, 99, 0.5)',
                boxShadow:
                  '0 4px 20px rgba(157, 109, 99, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
                zIndex: 30,
                animation: opening
                  ? 'seal-break 0.5s ease-out forwards'
                  : 'seal-pulse 2s ease-in-out infinite',
              }"
            >
              <svg
                style="fill: #fffaf7"
                viewBox="0 0 24 24"
                class="w-7 h-7"
                aria-hidden="true"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            </div>

            <!-- Card Body -->
            <div
              class="relative rounded-lg"
              style="
                box-shadow:
                  0 25px 60px -12px rgba(0, 0, 0, 0.45),
                  0 8px 24px rgba(0, 0, 0, 0.2),
                  0 0 40px rgba(196, 137, 127, 0.15);
              "
            >
              <div
                class="absolute inset-0 rounded-lg overflow-hidden"
                style="
                  background: rgba(255, 250, 247, 0.95);
                  border: 1px solid rgba(196, 137, 127, 0.15);
                  clip-path: inset(0 round 8px);
                "
              >
                <img
                  src="/images/themes/boho-floral-pink/asset_1.webp"
                  alt=""
                  aria-hidden="true"
                  class="absolute pointer-events-none w-[360px] md:w-[450px] lg:w-[520px] -top-[50px] md:-top-[65px] lg:-top-[80px] left-[calc(-30%+60px)] md:left-[calc(-30%+75px)] lg:left-[calc(-30%+90px)] opacity-40"
                  :style="
                    opening
                      ? {
                          animation:
                            'dragon-fly-forward 1.2s ease-out forwards',
                        }
                      : undefined
                  "
                />
                <img
                  src="/images/themes/boho-floral-pink/asset_3.webp"
                  alt=""
                  aria-hidden="true"
                  class="absolute pointer-events-none w-[130px] md:w-[180px] -bottom-[40px] -right-[35px] md:-bottom-[50px] md:-right-[45px] opacity-30 rotate-[150deg]"
                  :style="
                    opening
                      ? {
                          animation:
                            'dragon-fly-forward 1.2s ease-out forwards',
                        }
                      : undefined
                  "
                />
              </div>

              <div
                class="relative z-10 text-center px-6 pt-28 pb-14 md:pt-24 md:pb-8"
              >
                <h1
                  class="mb-2 flex flex-col items-center leading-tight text-3xl sm:text-4xl"
                  style="
                    color: #9d6d63;
                    font-family:
                      'Playfair Display', 'Baskerville', 'Times New Roman',
                      serif;
                  "
                >
                  <span
                    class="block w-full text-center"
                    style="
                      font-family:
                        'Playfair Display', 'Baskerville', 'Times New Roman',
                        serif;
                    "
                  >
                    {{ wedding.couple.groomName }}
                  </span>
                  <span
                    class="block w-full text-center text-lg leading-none sm:text-xl"
                    style="font-family: 'Baskerville', 'Times New Roman', serif"
                  >
                    &amp;
                  </span>
                  <span
                    class="block w-full text-center"
                    style="
                      font-family:
                        'Playfair Display', 'Baskerville', 'Times New Roman',
                        serif;
                    "
                  >
                    {{ wedding.couple.brideName }}
                  </span>
                </h1>

                <div class="flex items-center justify-center gap-3 mb-2">
                  <div
                    class="w-10 h-px"
                    style="
                      background: linear-gradient(
                        to right,
                        transparent,
                        #c4897f
                      );
                    "
                  />
                  <span class="text-sm" style="color: #c4897f; opacity: 0.7">
                    ❦
                  </span>
                  <div
                    class="w-10 h-px"
                    style="
                      background: linear-gradient(
                        to left,
                        transparent,
                        #c4897f
                      );
                    "
                  />
                </div>

                <div
                  class="text-[18px] mb-5 flex flex-col items-center"
                  style="
                    color: rgba(157, 109, 99, 0.7);
                    font-family: 'Lora', 'Times New Roman', serif;
                  "
                >
                  <span dir="auto">14 tháng 11, 2026</span>
                </div>

                <div class="mb-6">
                  <p
                    class="text-[18px] font-light mb-2"
                    style="
                      color: rgba(157, 109, 99, 0.7);
                      font-family: 'Lora', 'Times New Roman', serif;
                    "
                  >
                    <span dir="auto">Thân Mời</span>
                  </p>
                </div>

                <button
                  type="button"
                  :aria-busy="opening"
                  class="relative px-8 py-2.5 text-lg font-semibold sm:font-medium rounded-full shadow-lg no-underline cursor-pointer flex w-fit items-center justify-center mx-auto overflow-hidden border-0"
                  style="
                    background-color: #9d6d63;
                    color: #fffaf7;
                    box-shadow: 0 4px 14px rgba(157, 109, 99, 0.35);
                    font-family: 'Lora', 'Times New Roman', serif;
                    -webkit-touch-callout: none;
                    user-select: none;
                  "
                  @click="openInvitation"
                >
                  <span dir="auto">Mở thiệp</span>
                  <span
                    aria-hidden="true"
                    class="absolute top-0 h-full w-8 pointer-events-none"
                    style="
                      background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.4),
                        transparent
                      );
                      animation: shine 3s ease-in-out infinite;
                    "
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Opened Invitation -->
      <main
        ref="content"
        tabindex="-1"
        class="min-h-screen w-full outline-none"
      >
        <div
          class="flex w-full justify-center overflow-x-clip bg-white"
          data-testid="boho-floral-pink-template"
        >
          <div
            data-showcase-root=""
            class="relative w-full max-w-[480px] md:max-w-[900px] md:mx-auto overflow-hidden md:border md:border-[#9D6D6322] isolate"
            style="
              background-color: rgb(255, 250, 247);
              color: rgb(157, 109, 99);
            "
          >
            <!-- Section 1: Header with Couple Names & Tilted Portrait Frames -->
            <header
              class="relative flex flex-col items-center justify-start text-center z-10 px-6 md:px-8 pb-4 md:pb-8 pt-[190px] md:pt-[300px] min-h-[910px] md:min-h-[900px] overflow-visible"
            >
              <div
                aria-hidden="true"
                class="absolute top-[-20px] left-[-70px] w-[440px] md:top-[-210px] md:left-[-100px] md:w-[560px] lg:top-[-20px] lg:left-[0px] lg:w-[670px] -z-10 pointer-events-none"
                :style="{
                  willChange: 'transform',
                  transform: `translateY(${(scrollY * 0.1).toFixed(1)}px)`,
                }"
              >
                <img
                  alt=""
                  class="w-full h-auto"
                  src="/images/themes/boho-floral-pink/asset_1.webp"
                />
              </div>
              <div
                aria-hidden="true"
                class="absolute top-[10px] md:top-[20px] lg:top-[30px] left-[calc(80%-300px)] md:left-[calc(80%-400px)] lg:left-[calc(80%-480px)] w-[600px] md:w-[800px] lg:w-[960px] -z-10 opacity-[0.15] pointer-events-none"
                :style="{
                  willChange: 'transform',
                  transform: `translateY(${(scrollY * 0.13).toFixed(1)}px) rotate(162deg)`,
                }"
              >
                <img
                  alt=""
                  class="w-full h-auto"
                  src="/images/themes/boho-floral-pink/asset_2.webp"
                />
              </div>

              <div class="boho-pink-names">
                <div class="flex flex-col items-center">
                  <div
                    class="text-[13px] md:text-[16px] tracking-widest"
                    style="
                      color: rgb(122, 90, 82);
                      font-family: Baskerville, 'Times New Roman', serif;
                    "
                  >
                    <span dir="auto">Trưởng Nam</span>
                  </div>
                  <div
                    class="text-[29px] md:text-[36px] whitespace-nowrap leading-tight"
                    style="
                      color: rgb(157, 109, 99);
                      font-family: 'Playfair Display', serif;
                    "
                  >
                    {{ wedding.couple.groomName }}
                  </div>
                </div>
                <div class="flex flex-col items-center mt-1">
                  <div
                    class="text-[13px] md:text-[16px] tracking-widest"
                    style="
                      color: rgb(122, 90, 82);
                      font-family: Baskerville, 'Times New Roman', serif;
                    "
                  >
                    <span dir="auto">Ái Nữ</span>
                  </div>
                  <div
                    class="text-[29px] md:text-[36px] whitespace-nowrap leading-tight"
                    style="
                      color: rgb(157, 109, 99);
                      font-family: 'Playfair Display', serif;
                    "
                  >
                    {{ wedding.couple.brideName }}
                  </div>
                </div>
              </div>

              <div
                class="relative z-10 mx-auto w-[300px] md:w-[480px] h-[460px] md:h-[720px] translate-x-[20px] translate-y-[80px] md:translate-x-0 md:translate-y-0"
              >
                <div
                  class="absolute left-[45px] md:left-[90px] top-[30px] md:top-[50px] z-10"
                >
                  <div class="rotate-[13deg] w-[155px] md:w-[235px] shrink-0">
                    <button
                      type="button"
                      class="border-[5px] overflow-hidden aspect-[2/3] relative block w-full p-0 bg-transparent cursor-pointer"
                      style="border-color: rgb(245, 198, 201)"
                      aria-label="Xem ảnh chú rể và cô dâu 1"
                      @click="openLightbox(0)"
                    >
                      <img
                        :alt="wedding.couple.groomName"
                        class="w-full h-full object-cover"
                        :src="weddingPhotos[0]!.src"
                      />
                    </button>
                  </div>
                </div>
                <div
                  class="absolute left-[0px] md:left-[0px] top-[230px] md:top-[360px] z-20"
                >
                  <div class="rotate-[-13deg] w-[155px] md:w-[235px] shrink-0">
                    <button
                      type="button"
                      class="border-[5px] overflow-hidden aspect-[2/3] relative block w-full p-0 bg-transparent cursor-pointer"
                      style="border-color: rgb(186, 180, 199)"
                      aria-label="Xem ảnh chú rể và cô dâu 2"
                      @click="openLightbox(1)"
                    >
                      <img
                        :alt="wedding.couple.brideName"
                        class="w-full h-full object-cover"
                        :src="weddingPhotos[1]!.src"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <!-- Background Floral Watermarks & Sprigs -->
            <div
              aria-hidden="true"
              class="absolute -z-10 pointer-events-none rotate-[20deg] scale-x-[-1] scale-y-[-1] boho-pink-fixed-flower"
            >
              <img
                alt=""
                class="w-full h-auto opacity-70"
                src="/images/themes/boho-floral-pink/asset_1.webp"
              />
            </div>
            <div
              aria-hidden="true"
              class="absolute top-[1160px] md:top-[770px] lg:top-[920px] left-[calc(50%-310px)] md:left-[calc(30%-410px)] lg:left-[calc(30%-495px)] w-[620px] md:w-[820px] lg:w-[990px] -z-10 opacity-[0.15] pointer-events-none"
              :style="{
                willChange: 'transform',
                transform: `rotate(162deg) translateY(${(scrollY * 0.08).toFixed(1)}px)`,
              }"
            >
              <img
                alt=""
                class="w-full h-auto"
                src="/images/themes/boho-floral-pink/asset_2.webp"
              />
            </div>
            <div
              aria-hidden="true"
              class="absolute top-[1945px] md:top-[2163px] lg:top-[2590px] left-[calc(50%-320px)] md:left-[calc(50%-420px)] lg:left-[calc(50%-505px)] w-[640px] md:w-[840px] lg:w-[1010px] -z-10 opacity-[0.15] pointer-events-none"
              :style="{
                willChange: 'transform',
                transform: `rotate(142deg) translateY(${(scrollY * 0.11).toFixed(1)}px)`,
              }"
            >
              <img
                alt=""
                class="w-full h-auto"
                src="/images/themes/boho-floral-pink/asset_2.webp"
              />
            </div>

            <!-- Section 2: THÔNG TIN LỄ CƯỚI -->
            <h2
              class="text-center uppercase mt-10 md:mt-[228px] mb-6 md:mb-8 px-4"
              style="
                color: rgb(157, 109, 99);
                font-family: 'Times New Roman', serif;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: 1px;
              "
            >
              <span dir="auto">THÔNG TIN LỄ&nbsp;CƯỚI</span>
            </h2>

            <div class="mb-6 md:mb-8">
              <div
                class="relative grid grid-cols-2 gap-2 md:gap-3 text-center"
                style="
                  color: rgb(157, 109, 99);
                  font-family: Baskerville, 'Times New Roman', serif;
                "
              >
                <div class="flex flex-col gap-1.5">
                  <span style="color: rgb(157, 109, 99)">
                    <span dir="auto">Ông bà</span>
                  </span>
                  <span
                    v-for="parent in wedding.families.GROOM.parents"
                    :key="parent"
                    class="text-[13px] md:text-[23px] [overflow-wrap:anywhere]"
                    style="color: rgb(157, 109, 99); font-weight: 600"
                  >
                    <span dir="auto">{{ parent }}</span>
                  </span>
                </div>

                <div class="flex flex-col gap-1.5">
                  <span style="color: rgb(157, 109, 99)">
                    <span dir="auto">Ông bà</span>
                  </span>
                  <span
                    v-for="parent in wedding.families.BRIDE.parents"
                    :key="parent"
                    class="text-[13px] md:text-[23px] [overflow-wrap:anywhere]"
                    style="color: rgb(157, 109, 99); font-weight: 600"
                  >
                    <span dir="auto">{{ parent }}</span>
                  </span>
                </div>
              </div>
            </div>

            <div
              class="text-center text-[16px] md:text-[20px] flex flex-col gap-1 mb-6 md:mb-8 mx-auto md:max-w-[560px]"
              style="
                white-space: pre-line;
                font-family: Baskerville, 'Times New Roman', serif;
                color: rgb(157, 109, 99);
              "
            >
              <span dir="auto"
                >TRÂN TRỌNG BÁO TIN LỄ THÀNH HÔN CỦA CON CHÚNG TÔI</span
              >
            </div>

            <div
              data-showcase-keep=""
              class="w-full min-w-0 relative flex flex-col items-center text-center gap-3 md:gap-4"
            >
              <h3
                class="w-full flex items-center justify-center leading-[55px] md:leading-[80px] whitespace-nowrap text-[40px] md:text-[64px]"
                style="
                  font-family: 'EB Garamond', serif;
                  color: rgb(157, 109, 99);
                "
              >
                {{ wedding.couple.groomName }}
              </h3>
              <div
                class="text-xs uppercase tracking-[0.2em]"
                style="
                  color: rgb(157, 109, 99);
                  font-family: Baskerville, 'Times New Roman', serif;
                  font-size: 10px;
                  letter-spacing: 0.1em;
                "
              >
                <span dir="auto">Trưởng Nam</span>
              </div>
              <div
                class="text-[35px] md:text-[42px]"
                style="
                  color: rgb(157, 109, 99);
                  font-family: 'Ms Madi', cursive;
                "
              >
                &amp;
              </div>
              <h3
                class="w-full flex items-center justify-center leading-[55px] md:leading-[80px] whitespace-nowrap text-[40px] md:text-[64px]"
                style="
                  font-family: 'EB Garamond', serif;
                  color: rgb(157, 109, 99);
                "
              >
                {{ wedding.couple.brideName }}
              </h3>
              <div
                class="text-xs uppercase tracking-[0.2em]"
                style="
                  color: rgb(157, 109, 99);
                  font-family: Baskerville, 'Times New Roman', serif;
                  font-size: 10px;
                  letter-spacing: 0.1em;
                "
              >
                <span dir="auto">Ái Nữ</span>
              </div>
            </div>

            <div class="mt-6 md:mt-8">
              <div
                class="relative flex flex-col items-center gap-4 md:gap-5 text-center"
                style="font-family: Baskerville, 'Times New Roman', serif"
              >
                <div
                  class="flex flex-col items-center gap-2"
                  style="color: rgb(157, 109, 99)"
                >
                  <span
                    dir="auto"
                    class="whitespace-pre-line font-normal text-[16px] md:text-[20px] text-center"
                    >LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI TƯ GIA</span
                  >
                  <p
                    class="font-normal text-[16px] md:text-[18px] mb-2 uppercase"
                    style="color: rgb(157, 109, 99)"
                  >
                    VÀO LÚC
                  </p>
                </div>
                <div
                  class="text-[20px] md:text-[30px]"
                  style="
                    color: rgb(157, 109, 99);
                    font-family: Baskerville, 'Times New Roman', serif;
                  "
                >
                  {{ ceremony.time }}
                </div>
                <div
                  class="flex items-center gap-6"
                  style="color: rgb(157, 109, 99)"
                >
                  <span
                    class="text-[12px] md:text-[16px]"
                    style="
                      font-family: Baskerville, 'Times New Roman', serif;
                      text-align: right;
                    "
                  >
                    <span dir="auto">THỨ BẢY</span>
                  </span>
                  <span
                    class="text-[20px] md:text-[28px] flex items-center justify-center leading-none"
                    style="
                      font-family: Baskerville, 'Times New Roman', serif;
                      color: rgb(157, 109, 99);
                      opacity: 0.5;
                    "
                    >|</span
                  >
                  <span
                    class="text-[30px] md:text-[40px]"
                    style="font-family: Baskerville, 'Times New Roman', serif"
                    >14</span
                  >
                  <span
                    class="text-[20px] md:text-[28px] flex items-center justify-center leading-none"
                    style="
                      font-family: Baskerville, 'Times New Roman', serif;
                      color: rgb(157, 109, 99);
                      opacity: 0.5;
                    "
                    >|</span
                  >
                  <span
                    class="text-[12px] md:text-[16px]"
                    style="
                      font-family: Baskerville, 'Times New Roman', serif;
                      text-align: left;
                    "
                  >
                    <span dir="auto">THÁNG 11</span>
                  </span>
                </div>
                <div
                  class="text-[18px] md:text-[24px]"
                  style="
                    color: rgb(157, 109, 99);
                    font-family: Baskerville, 'Times New Roman', serif;
                  "
                >
                  2026
                </div>
                <div
                  class="text-xs md:text-sm uppercase tracking-[0.25em] px-4"
                  style="
                    color: rgb(157, 109, 99);
                    font-family: Baskerville, 'Times New Roman', serif;
                  "
                >
                  (Tức ngày {{ ceremony.lunarDate }})
                </div>
              </div>
            </div>

            <!-- Decorative Sprigs -->
            <div
              aria-hidden="true"
              class="absolute top-[1180px] md:top-[1320px] lg:top-[1460px] -right-[180px] md:-right-[160px] lg:-right-[200px] w-[260px] md:w-[350px] lg:w-[420px] -z-10 pointer-events-none scale-x-[-1]"
              :style="{
                willChange: 'transform',
                transform: `rotate(-26deg) translateY(${(scrollY * -0.04).toFixed(1)}px)`,
              }"
            >
              <img
                alt=""
                class="w-full h-auto"
                src="/images/themes/boho-floral-pink/asset_3.webp"
              />
            </div>
            <div
              aria-hidden="true"
              class="absolute top-[1830px] md:top-[2010px] lg:top-[2190px] left-[-70px] md:left-[-130px] lg:left-[-160px] w-[170px] md:w-[320px] lg:w-[420px] rotate-180 -z-10 pointer-events-none"
              :style="{
                willChange: 'transform',
                transform: `translateY(${(scrollY * 0.05).toFixed(1)}px)`,
              }"
            >
              <img
                alt=""
                class="w-full h-auto"
                src="/images/themes/boho-floral-pink/asset_3.webp"
              />
            </div>
            <div
              aria-hidden="true"
              class="absolute top-[2211px] md:top-[2430px] lg:top-[2650px] -right-[140px] md:-right-[260px] lg:-right-[350px] w-[195px] md:w-[365px] lg:w-[490px] -z-10 pointer-events-none scale-x-[-1] rotate-180"
              :style="{
                willChange: 'transform',
                transform: `rotate(-28deg) translateY(${(scrollY * -0.04).toFixed(1)}px)`,
              }"
            >
              <img
                alt=""
                class="w-full h-auto"
                src="/images/themes/boho-floral-pink/asset_3.webp"
              />
            </div>

            <!-- Section 3: ALBUM ẢNH (3D Coverflow Carousel) -->
            <div
              class="relative flex flex-col items-center px-6 md:px-10 pt-10 md:pt-14 pb-10 md:pb-12 overflow-visible z-10"
            >
              <h2
                class="uppercase font-bold"
                style="
                  color: rgb(157, 109, 99);
                  font-family: 'Times New Roman', serif;
                  font-size: 24px;
                  font-weight: 700;
                  letter-spacing: 1px;
                "
              >
                <span dir="auto">Album Ảnh</span>
              </h2>
              <div
                class="mt-6 w-full max-w-[390px] md:max-w-[560px] relative z-10"
              >
                <div
                  class="relative h-[340px] md:h-[520px] touch-pan-y"
                  @touchstart.passive="onTouchStart"
                  @touchend.passive="onTouchEnd"
                >
                  <button
                    type="button"
                    aria-label="Ảnh trước"
                    class="flex absolute left-0 top-1/2 -translate-y-1/2 z-[200] w-8 h-8 items-center justify-center rounded-full bg-white/70 hover:bg-white transition-colors border-0 cursor-pointer shadow-sm"
                    style="color: rgb(157, 109, 99)"
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
                    class="flex absolute right-0 top-1/2 -translate-y-1/2 z-[200] w-8 h-8 items-center justify-center rounded-full bg-white/70 hover:bg-white transition-colors border-0 cursor-pointer shadow-sm"
                    style="color: rgb(157, 109, 99)"
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
                        'ring-2 ring-white/30': getSlideOffset(index) === 0,
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
                    class="rounded-full transition-all duration-300 h-2 bg-current border-0 p-0 cursor-pointer"
                    :class="
                      activeSlide === index
                        ? 'w-6 opacity-70'
                        : 'w-2 opacity-25 hover:opacity-40'
                    "
                    @click="goToSlide(index)"
                  />
                </div>
              </div>
            </div>

            <!-- Section 4: THÔNG TIN TIỆC CƯỚI & RSVP -->
            <h2
              class="text-center uppercase mt-10 md:mt-12 mb-6 md:mb-8 px-4"
              style="
                color: rgb(157, 109, 99);
                font-family: 'Times New Roman', serif;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: 1px;
              "
            >
              <span dir="auto">THÔNG TIN TIỆC&nbsp;CƯỚI</span>
            </h2>

            <div
              class="flex flex-col items-center gap-4 md:gap-5 text-center"
              data-landing-screenshot-id="invite-reception"
              style="
                font-family: Baskerville, 'Times New Roman', serif;
                color: rgb(157, 109, 99);
              "
            >
              <h3
                class="font-normal uppercase text-[16px] md:text-[20px] flex flex-col items-center"
                style="color: rgb(157, 109, 99)"
              >
                <span dir="auto">Tiệc cưới sẽ diễn ra vào&nbsp;lúc:</span>
              </h3>
              <div
                class="text-[20px] md:text-[30px]"
                style="
                  color: rgb(157, 109, 99);
                  font-family: Baskerville, 'Times New Roman', serif;
                "
              >
                {{ receptionStartTime }}
              </div>
              <div
                class="flex items-center gap-6"
                style="
                  font-family: Baskerville, 'Times New Roman', serif;
                  font-weight: 600;
                "
              >
                <span
                  class="text-[12px] md:text-[16px] uppercase"
                  style="
                    font-family: Baskerville, 'Times New Roman', serif;
                    font-weight: 600;
                    text-align: right;
                  "
                >
                  <span dir="auto">THỨ BẢY</span>
                </span>
                <div
                  class="w-[2px] h-6 md:h-8"
                  style="background-color: rgb(157, 109, 99)"
                />
                <span
                  class="text-[30px] md:text-[40px]"
                  style="
                    font-family: Baskerville, 'Times New Roman', serif;
                    font-weight: 600;
                  "
                  >14</span
                >
                <div
                  class="w-[2px] h-6 md:h-8"
                  style="background-color: rgb(157, 109, 99)"
                />
                <span
                  class="text-[12px] md:text-[16px] uppercase"
                  style="
                    font-family: Baskerville, 'Times New Roman', serif;
                    font-weight: 600;
                    text-align: left;
                  "
                >
                  <span dir="auto">THÁNG 11</span>
                </span>
              </div>
              <div
                class="text-[18px] md:text-[24px]"
                style="
                  color: rgb(157, 109, 99);
                  font-family: Baskerville, 'Times New Roman', serif;
                "
              >
                2026
              </div>
              <div
                class="text-xs md:text-sm uppercase tracking-[0.25em] px-4"
                style="
                  color: rgb(157, 109, 99);
                  font-family: Baskerville, 'Times New Roman', serif;
                "
              >
                (Tức ngày {{ meal.lunarDate }})
              </div>

              <div class="flex items-center justify-center gap-8 mt-4">
                <div class="flex flex-col items-center">
                  <span
                    class="text-xs uppercase tracking-wider"
                    style="
                      color: rgb(157, 109, 99);
                      font-family: Baskerville, 'Times New Roman', serif;
                    "
                  >
                    <span dir="auto">Khai tiệc</span>
                  </span>
                  <span
                    class="text-lg md:text-xl font-medium mt-1"
                    style="
                      color: rgb(157, 109, 99);
                      font-family: Baskerville, 'Times New Roman', serif;
                      font-weight: 600;
                    "
                  >
                    {{ receptionStartTime }}
                  </span>
                </div>
              </div>

              <!-- Monthly Calendar Box -->
              <div class="mt-2 w-[296px] md:w-[352px] max-w-full mx-auto">
                <div
                  data-showcase-keep=""
                  class="w-full mx-auto rounded-lg overflow-hidden border"
                  style="
                    border-color: color-mix(
                      in srgb,
                      rgb(157, 109, 99) 27%,
                      transparent 73%
                    );
                    color: rgb(157, 109, 99);
                  "
                  aria-label="Lịch tháng 11 năm 2026, ngày cưới 14 tháng 11"
                >
                  <div
                    class="text-center py-2.5 text-[13px] md:text-[14px] font-semibold tracking-wide border-b"
                    style="
                      border-color: color-mix(
                        in srgb,
                        rgb(157, 109, 99) 27%,
                        transparent 73%
                      );
                    "
                  >
                    Tháng 11 / 2026
                  </div>
                  <div
                    class="grid grid-cols-7 border-b-2"
                    style="border-color: rgb(157, 109, 99)"
                  >
                    <div
                      v-for="dow in ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']"
                      :key="dow"
                      class="text-center py-1.5 text-[10px] md:text-[11px] font-medium opacity-60"
                    >
                      {{ dow }}
                    </div>
                  </div>
                  <div class="grid grid-cols-7 gap-y-0.5 px-1 py-2">
                    <div
                      v-for="(day, idx) in calendarCells"
                      :key="idx"
                      class="flex items-center justify-center h-[30px] md:h-[34px]"
                    >
                      <div
                        v-if="day === '14'"
                        class="relative w-[26px] h-[24px] md:w-[30px] md:h-[28px] flex items-center justify-center"
                      >
                        <svg
                          viewBox="0 0 24 22"
                          class="absolute inset-0 w-full h-full drop-shadow-sm"
                          fill="#9D6D63"
                          aria-hidden="true"
                        >
                          <path
                            d="M12 21C12 21 1.5 13.5 1.5 7.5C1.5 4.46 3.96 2 7 2C8.76 2 10.35 2.81 11.4 4.09L12 4.8L12.6 4.09C13.65 2.81 15.24 2 17 2C20.04 2 22.5 4.46 22.5 7.5C22.5 13.5 12 21 12 21Z"
                          />
                        </svg>
                        <span
                          class="relative z-10 text-[11px] md:text-[12px] font-bold"
                          style="color: rgb(255, 255, 255)"
                          >14</span
                        >
                      </div>
                      <span
                        v-else-if="day"
                        class="text-[12px] md:text-[13px]"
                        >{{ day }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <a
                :href="googleCalendarUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-4 inline-flex items-center justify-center text-sm tracking-wider underline underline-offset-4 decoration-1 transition-opacity hover:opacity-70"
                style="color: rgb(157, 109, 99); background: none"
              >
                <span dir="auto">Thêm vào lịch</span>
              </a>
            </div>

            <!-- RSVP Trigger Button -->
            <div
              class="relative z-10 flex flex-col items-center justify-center w-full my-8 md:my-10"
              data-landing-screenshot-id="invite-rsvp"
            >
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-[10px] px-6 py-2 font-semibold transition-transform hover:scale-[1.03] border-0 cursor-pointer"
                style="
                  background-color: rgb(157, 109, 99);
                  color: rgb(255, 250, 247);
                  font-family: Baskerville, 'Times New Roman', serif;
                "
                @click="rsvpDialog?.open()"
              >
                <span
                  class="relative z-10 flex min-h-0 items-center justify-center gap-2"
                >
                  <span dir="auto">XÁC NHẬN THAM DỰ</span>
                </span>
              </button>
            </div>

            <!-- Bottom Watermark -->
            <div
              aria-hidden="true"
              class="absolute bottom-[100px] -right-[340px] w-[510px] md:w-[660px] -z-10 opacity-[0.18] pointer-events-none"
              :style="{
                willChange: 'transform',
                transform: `rotate(159deg) translateY(${(scrollY * 0.09).toFixed(1)}px)`,
              }"
            >
              <img
                alt=""
                class="w-full h-auto"
                src="/images/themes/boho-floral-pink/asset_2.webp"
              />
            </div>

            <!-- Note: Map section and Guestbook section omitted per user request -->

            <!-- Section 5: DRESS CODE -->
            <div
              class="relative z-10 flex flex-col items-center gap-5 px-6 md:px-10 py-10 md:py-12"
            >
              <div class="flex flex-col items-center gap-1">
                <h2
                  class="uppercase font-normal text-[20px] md:text-[26px] text-center"
                  style="
                    color: rgb(157, 109, 99);
                    font-family: 'Times New Roman', serif;
                    font-size: 24px;
                    font-weight: 700;
                    letter-spacing: 1px;
                  "
                >
                  <span dir="auto">DRESS CODE</span>
                </h2>
                <p
                  class="whitespace-pre-line text-sm md:text-base text-center opacity-70"
                  style="
                    color: rgb(157, 109, 99);
                    font-family: Baskerville, 'Times New Roman', serif;
                  "
                >
                  <span dir="auto">Trang phục dự tiệc</span>
                </p>
              </div>
              <div class="flex flex-wrap justify-center gap-4 md:gap-6">
                <div
                  class="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-md"
                  style="background-color: rgb(101, 18, 18)"
                />
                <div
                  class="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-md"
                  style="background-color: rgb(141, 58, 58)"
                />
                <div
                  class="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-md"
                  style="
                    background-color: rgb(255, 178, 178);
                    border: 1.5px solid rgba(157, 109, 99, 0.19);
                  "
                />
              </div>
            </div>

            <!-- Section 6: LỊCH TRÌNH NGÀY CƯỚI -->
            <div
              class="relative z-10 flex flex-col gap-6 md:gap-8 px-2 md:px-4 mt-10 md:mt-12 mb-10 md:mb-12"
            >
              <h2
                class="uppercase font-bold text-center px-2 md:px-4"
                style="
                  color: rgb(157, 109, 99);
                  font-family: 'Times New Roman', serif;
                  font-size: 24px;
                  font-weight: 700;
                  letter-spacing: 1px;
                "
              >
                <span dir="auto">LỊCH TRÌNH NGÀY&nbsp;CƯỚI</span>
              </h2>
              <ol
                class="relative mx-auto grid w-full max-w-[460px] grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-x-6 md:gap-x-8 gap-y-8 md:gap-y-10"
                style="font-family: Baskerville, 'Times New Roman', serif"
              >
                <li
                  v-for="(item, index) in wedding.events"
                  :key="item.id"
                  class="contents"
                >
                  <span
                    class="pt-0.5 text-right text-[16px] md:text-[17px] tabular-nums tracking-wide leading-snug"
                    style="
                      color: rgb(157, 109, 99);
                      font-family: Baskerville, 'Times New Roman', serif;
                    "
                  >
                    {{ item.time }}
                  </span>
                  <span
                    aria-hidden="true"
                    class="relative flex items-center justify-center self-stretch"
                  >
                    <span
                      class="absolute left-1/2 -translate-x-1/2 w-px"
                      :class="[
                        index === 0 ? 'top-1/2' : '-top-8 md:-top-10',
                        index === wedding.events.length - 1
                          ? 'bottom-1/2'
                          : '-bottom-8 md:-bottom-10',
                      ]"
                      style="
                        background-color: color-mix(
                          in srgb,
                          rgb(157, 109, 99) 40%,
                          transparent 60%
                        );
                      "
                    />
                    <span
                      class="relative block h-2.5 w-2.5 rounded-full"
                      style="
                        background-color: rgb(157, 109, 99);
                        box-shadow: color-mix(
                            in srgb,
                            rgb(157, 109, 99) 13%,
                            transparent 87%
                          )
                          0px 0px 0px 2px;
                      "
                    />
                  </span>
                  <span
                    class="pt-0.5 text-start text-[17px] md:text-[19px] font-medium leading-snug"
                    style="
                      color: rgb(157, 109, 99);
                      font-family: Baskerville, 'Times New Roman', serif;
                    "
                  >
                    <span dir="auto">{{ item.title }}</span>
                  </span>
                </li>
              </ol>
            </div>

            <!-- Section 7: HỘP QUÀ MỪNG -->
            <div
              class="flex flex-col items-center justify-center py-8 relative z-10 pt-8 md:pt-12 pb-10 md:pb-14"
              style="background-color: transparent"
            >
              <h2
                class="mb-4 uppercase font-bold flex flex-col items-center"
                style="
                  color: rgb(157, 109, 99);
                  font-family: 'Times New Roman', serif;
                  font-size: 24px;
                  font-weight: 700;
                  letter-spacing: 1px;
                "
              >
                <span dir="auto">Hộp Quà&nbsp;Mừng</span>
              </h2>
              <button
                type="button"
                aria-label="Mở hộp mừng cưới"
                class="group relative cursor-pointer outline-none border-none bg-transparent"
                style="width: 260px; height: 280px"
                @click="giftsDialog?.open()"
              >
                <div
                  class="relative w-full h-full flex items-end justify-center pb-[26px]"
                >
                  <span
                    class="igb-sparkle absolute pointer-events-none z-20"
                    style="
                      top: 8%;
                      left: 14%;
                      color: rgb(157, 109, 99);
                      font-size: 22px;
                    "
                    aria-hidden="true"
                    >✦</span
                  >
                  <span
                    class="igb-sparkle-2 absolute pointer-events-none z-20"
                    style="
                      top: 18%;
                      right: 10%;
                      color: rgb(157, 109, 99);
                      font-size: 16px;
                    "
                    aria-hidden="true"
                    >✦</span
                  >
                  <span
                    class="igb-sparkle-3 absolute pointer-events-none z-20"
                    style="
                      top: 32%;
                      left: 5%;
                      color: rgb(157, 109, 99);
                      font-size: 14px;
                    "
                    aria-hidden="true"
                    >✦</span
                  >
                  <span
                    class="igb-sparkle-4 absolute pointer-events-none z-20"
                    style="
                      top: 26%;
                      right: 5%;
                      color: rgb(157, 109, 99);
                      font-size: 14px;
                    "
                    aria-hidden="true"
                    >✦</span
                  >
                  <div
                    class="absolute pointer-events-none z-0"
                    style="bottom: 187px; left: 50%"
                    aria-hidden="true"
                  >
                    <div
                      class="igb-confetti igb-c1"
                      style="
                        margin-left: -5.5px;
                        margin-top: -2.75px;
                        width: 11px;
                        height: 5.5px;
                        background-color: rgb(236, 72, 153);
                        border-radius: 2px;
                      "
                    />
                    <div
                      class="igb-confetti igb-c2"
                      style="
                        margin-left: -5px;
                        margin-top: -5px;
                        width: 10px;
                        height: 10px;
                        background-color: rgb(157, 109, 99);
                        border-radius: 50%;
                      "
                    />
                    <div
                      class="igb-confetti igb-c3"
                      style="
                        margin-left: -5.5px;
                        margin-top: -2.75px;
                        width: 11px;
                        height: 5.5px;
                        background-color: rgb(34, 197, 94);
                        border-radius: 2px;
                      "
                    />
                    <div
                      class="igb-confetti igb-c4"
                      style="
                        margin-left: -4.5px;
                        margin-top: -4.5px;
                        width: 9px;
                        height: 9px;
                        background-color: rgb(59, 130, 246);
                        border-radius: 50%;
                      "
                    />
                    <div
                      class="igb-confetti igb-c5"
                      style="
                        margin-left: -6px;
                        margin-top: -3px;
                        width: 12px;
                        height: 6px;
                        background-color: rgb(168, 85, 247);
                        border-radius: 2px;
                      "
                    />
                    <div
                      class="igb-confetti igb-c6"
                      style="
                        margin-left: -5px;
                        margin-top: -5px;
                        width: 0px;
                        height: 0px;
                        border-left: 5px solid transparent;
                        border-right: 5px solid transparent;
                        border-bottom: 10px solid rgb(250, 204, 21);
                      "
                    />
                    <div
                      class="igb-confetti igb-c7"
                      style="
                        margin-left: -5px;
                        margin-top: -2.5px;
                        width: 10px;
                        height: 5px;
                        background-color: rgb(157, 109, 99);
                        border-radius: 2px;
                      "
                    />
                    <div
                      class="igb-confetti igb-c8"
                      style="
                        margin-left: -4.5px;
                        margin-top: -4.5px;
                        width: 9px;
                        height: 9px;
                        background-color: rgb(249, 115, 22);
                        border-radius: 50%;
                      "
                    />
                  </div>
                  <div
                    class="igb-bob relative"
                    style="width: 200px; height: 220px"
                  >
                    <div
                      class="igb-shadow absolute pointer-events-none"
                      style="
                        left: 50%;
                        bottom: -8px;
                        width: 144px;
                        height: 12px;
                        margin-left: -72px;
                        border-radius: 50%;
                        background-color: rgba(0, 0, 0, 0.45);
                        filter: blur(4px);
                        z-index: 0;
                      "
                      aria-hidden="true"
                    />
                    <img
                      alt=""
                      loading="lazy"
                      decoding="async"
                      class="igb-decor igb-decor-1 absolute pointer-events-none"
                      src="/images/giftbox/mini/baroque_blue.webp"
                      style="
                        left: -20px;
                        top: 10px;
                        width: 34px;
                        z-index: 1;
                        transform: rotate(-22deg);
                        filter: drop-shadow(rgba(0, 0, 0, 0.25) 0px 2px 3px);
                      "
                    />
                    <img
                      alt=""
                      loading="lazy"
                      decoding="async"
                      class="igb-decor igb-decor-2 absolute pointer-events-none"
                      src="/images/giftbox/mini/mahal_gold.webp"
                      style="
                        left: 168px;
                        top: 2px;
                        width: 38px;
                        z-index: 1;
                        transform: rotate(20deg);
                        filter: drop-shadow(rgba(0, 0, 0, 0.25) 0px 2px 3px);
                      "
                    />
                    <img
                      alt=""
                      loading="lazy"
                      decoding="async"
                      class="igb-decor igb-decor-3 absolute pointer-events-none"
                      src="/images/giftbox/mini/crystal_floral_green.webp"
                      style="
                        left: -16px;
                        top: 120px;
                        width: 26px;
                        z-index: 1;
                        transform: rotate(-18deg);
                        filter: drop-shadow(rgba(0, 0, 0, 0.25) 0px 2px 3px);
                      "
                    />
                    <img
                      alt=""
                      loading="lazy"
                      decoding="async"
                      class="igb-decor igb-decor-4 absolute pointer-events-none"
                      src="/images/giftbox/mini/lien_hoa_pink.webp"
                      style="
                        left: 182px;
                        top: 114px;
                        width: 24px;
                        z-index: 1;
                        transform: rotate(14deg);
                        filter: drop-shadow(rgba(0, 0, 0, 0.25) 0px 2px 3px);
                      "
                    />
                    <img
                      alt="Hộp quà mừng cưới"
                      loading="lazy"
                      decoding="async"
                      class="igb-box absolute pointer-events-none"
                      src="/images/giftbox/boho_floral_pink.webp"
                      style="
                        left: 50%;
                        bottom: 0px;
                        width: 170px;
                        max-height: 220px;
                        object-fit: contain;
                        margin-left: -85px;
                        z-index: 2;
                        filter: drop-shadow(rgba(0, 0, 0, 0.25) 0px 10px 18px);
                      "
                    />
                    <img
                      alt=""
                      loading="lazy"
                      decoding="async"
                      class="igb-decor igb-decor-5 absolute pointer-events-none"
                      src="/images/giftbox/mini/song_hac_red.webp"
                      style="
                        left: -8px;
                        top: 172px;
                        width: 44px;
                        z-index: 3;
                        transform: rotate(8deg);
                        filter: drop-shadow(rgba(0, 0, 0, 0.25) 0px 2px 3px);
                      "
                    />
                    <img
                      alt=""
                      loading="lazy"
                      decoding="async"
                      class="igb-decor igb-decor-6 absolute pointer-events-none"
                      src="/images/giftbox/mini/royal.webp"
                      style="
                        left: 26px;
                        top: 182px;
                        width: 26px;
                        z-index: 3;
                        transform: rotate(-10deg);
                        filter: drop-shadow(rgba(0, 0, 0, 0.25) 0px 2px 3px);
                      "
                    />
                    <img
                      alt=""
                      loading="lazy"
                      decoding="async"
                      class="igb-decor igb-decor-7 absolute pointer-events-none"
                      src="/images/giftbox/mini/baroque_gold.webp"
                      style="
                        left: 118px;
                        top: 176px;
                        width: 40px;
                        z-index: 3;
                        transform: rotate(-14deg);
                        filter: drop-shadow(rgba(0, 0, 0, 0.25) 0px 2px 3px);
                      "
                    />
                  </div>
                </div>
                <p
                  class="igb-hint absolute bottom-0 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap font-medium m-0"
                  style="color: rgb(157, 109, 99)"
                >
                  <span dir="auto">Nhấn để mở</span>
                </p>
              </button>
            </div>

            <!-- Section 8: Footer -->
            <footer
              class="relative flex flex-col items-center gap-4 px-6 md:px-10 pb-24 md:pb-28 text-center z-10"
            >
              <span
                class="whitespace-pre-line flex flex-col items-center gap-1 text-base md:text-lg mx-auto md:max-w-[560px]"
                style="
                  color: rgb(157, 109, 99);
                  font-family: Baskerville, 'Times New Roman', serif;
                "
              >
                <span dir="auto"
                  >Sự hiện diện của quý khách là niềm vinh hạnh của gia đình
                  chúng tôi!</span
                >
              </span>
              <div
                class="flex flex-wrap items-center justify-center gap-4 text-xs opacity-75"
                style="
                  color: rgb(157, 109, 99);
                  font-family: Baskerville, 'Times New Roman', serif;
                "
              >
                <a href="/" class="underline hover:opacity-100">Xem thiệp 1</a>
                <a href="/thiep-2" class="underline hover:opacity-100"
                  >Xem thiệp 2</a
                >
                <button
                  type="button"
                  class="underline bg-transparent border-0 p-0 cursor-pointer hover:opacity-100"
                  style="color: inherit; font: inherit"
                  @click="replay"
                >
                  Xem lại mở thiệp
                </button>
              </div>
            </footer>
          </div>
        </div>
      </main>

      <!-- Shared RSVP & Gift Dialogs -->
      <RsvpDialog ref="rsvpDialog" />
      <GiftDialog ref="giftsDialog" :gifts="event.gifts" />

      <!-- Fullscreen Photo Lightbox Dialog -->
      <dialog
        ref="lightboxDialog"
        class="boho-pink-lightbox"
        aria-label="Ảnh cưới lớn"
        @click="$event.target === lightboxDialog && closeLightbox()"
      >
        <div
          class="flex flex-col items-center h-[100dvh] w-screen px-2 sm:px-4 pt-10 sm:pt-12 pb-4 sm:pb-6 relative"
          @click="$event.target === $event.currentTarget && closeLightbox()"
        >
          <button
            type="button"
            class="absolute right-3 sm:right-5 top-3 sm:top-4 z-10 w-10 h-10 rounded-full bg-black/40 text-white text-xl flex items-center justify-center border-0 cursor-pointer hover:bg-white/20"
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
              class="w-10 h-10 rounded-full bg-black/40 text-white text-2xl absolute left-1 sm:left-2 z-10 flex items-center justify-center border-0 cursor-pointer hover:bg-white/20"
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
              class="w-10 h-10 rounded-full bg-black/40 text-white text-2xl absolute right-1 sm:right-2 z-10 flex items-center justify-center border-0 cursor-pointer hover:bg-white/20"
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
                      outline: '2px solid rgb(157, 109, 99)',
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
        class="boho-pink-floating-actions"
        :music-src="weddingMusic"
        :map-url="''"
        rsvp
        @rsvp="rsvpDialog?.open()"
        @gifts="giftsDialog?.open()"
      />
    </template>
  </InvitationFrame>
  <Analytics />
</template>

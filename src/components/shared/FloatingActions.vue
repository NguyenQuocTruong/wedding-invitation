<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
const props = defineProps<{ musicSrc: string | null; mapUrl: string }>()
const emit = defineEmits<{ gifts: [] }>()
const audio = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const loading = ref(false)
const status = ref('')
const musicLabel = computed(() =>
  playing.value ? 'Tắt nhạc' : loading.value ? 'Đang tải nhạc' : 'Bật nhạc',
)
async function toggleMusic() {
  status.value = ''
  if (!props.musicSrc || !audio.value) {
    status.value = 'Nhạc nền sẽ được cập nhật.'
    return
  }
  if (playing.value) {
    audio.value.pause()
    return
  }
  loading.value = true
  try {
    await audio.value.play()
  } catch {
    playing.value = false
    status.value = 'Chưa phát được nhạc. Bạn thử lại nhé.'
  } finally {
    loading.value = false
  }
}
function musicError() {
  playing.value = false
  loading.value = false
  status.value = 'Chưa tải được nhạc. Bạn thử lại nhé.'
}
onUnmounted(() => audio.value?.pause())
</script>
<template>
  <aside class="floating-actions" aria-label="Nhạc, gửi quà và chỉ đường">
    <p v-if="status" class="floating-actions-status" role="status">
      {{ status }}
    </p>
    <button
      class="floating-action floating-action--music"
      :title="musicLabel"
      :class="{ 'is-playing': playing }"
      type="button"
      :aria-label="musicLabel"
      :aria-pressed="playing"
      :aria-busy="loading"
      :disabled="loading"
      @click="toggleMusic"
    >
      <span class="sound-signal" aria-hidden="true"
        ><i v-for="bar in 4" :key="bar" :style="{ '--signal-bar': bar }"></i
      ></span>
      <span class="action-label">{{ playing ? 'Tắt nhạc' : 'Nhạc' }}</span>
    </button>
    <div class="floating-shortcuts">
      <button
        class="floating-action floating-action--gift"
        type="button"
        title="Gửi quà"
        aria-label="Gửi quà"
        @click="emit('gifts')"
      >
        <svg
          class="direction-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M4 10h16v11H4zM3 6h18v4H3zM12 6v15" />
          <path
            d="M12 6H8.5a2.5 2.5 0 1 1 2.4-3.2L12 6Zm0 0h3.5a2.5 2.5 0 1 0-2.4-3.2L12 6Z"
          />
        </svg>
        <span class="action-label">Gửi quà</span>
      </button>
      <a
        v-if="mapUrl"
        class="floating-action floating-action--directions"
        title="Chỉ đường"
        :href="mapUrl"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chỉ đường"
      >
        <svg
          class="direction-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.7" />
        </svg>
        <span class="action-label">Chỉ đường</span>
      </a>
    </div>
    <audio
      v-if="musicSrc"
      ref="audio"
      :src="musicSrc"
      preload="none"
      loop
      @playing="playing = true"
      @pause="playing = false"
      @ended="playing = false"
      @error="musicError"
    />
  </aside>
</template>
<style>
.floating-actions {
  position: absolute;
  inset: 0;
  z-index: 1000001;
  width: min(100%, var(--floating-actions-width, 100%));
  height: 100%;
  margin: 0 auto;
  pointer-events: none;
}
.floating-shortcuts {
  position: absolute;
  right: max(16px, env(safe-area-inset-right));
  bottom: calc(18px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 12px;
  pointer-events: none;
}
.floating-actions .floating-action {
  --bounce-height: -7px;
  position: relative;
  box-sizing: border-box;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  margin: 0;
  padding: 0;
  border: 1px solid #ffffff38;
  border-radius: 50%;
  background: #3939398a;
  color: #fff;
  box-shadow: 0 2px 8px #0000000a;
  -webkit-backdrop-filter: blur(18px) saturate(110%);
  backdrop-filter: blur(18px) saturate(110%);
  text-decoration: none;
  cursor: pointer;
  touch-action: manipulation;
  pointer-events: auto;
  animation: invitation-control-bounce 3.4s ease-in-out infinite;
  transition: background 160ms ease;
  -webkit-tap-highlight-color: transparent;
}
.floating-actions .floating-action--music {
  --bounce-height: -4px;
  position: absolute;
  top: calc(12px + env(safe-area-inset-top));
  right: max(16px, env(safe-area-inset-right));
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  box-shadow: none;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
.floating-actions .floating-action--music::before {
  content: '';
  position: absolute;
  inset: 6px 0;
  border: 1px solid #ffffff38;
  border-radius: inherit;
  background: #3939398a;
  -webkit-backdrop-filter: blur(18px) saturate(110%);
  backdrop-filter: blur(18px) saturate(110%);
  z-index: -1;
}
.floating-actions .floating-action--gift {
  --bounce-height: -8px;
  animation-delay: -0.35s;
}
.floating-actions .floating-action--directions {
  animation-delay: -0.7s;
}
.floating-actions .floating-action:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
  animation-play-state: paused;
}
.floating-actions .floating-action:active {
  animation-play-state: paused;
}
.floating-actions .floating-action:disabled {
  cursor: wait;
  opacity: 0.7;
}
.floating-actions .action-label {
  display: none;
}
.floating-actions .sound-signal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 20px;
  height: 18px;
}
.floating-actions .sound-signal i {
  display: block;
  width: 2px;
  height: calc(3px + var(--signal-bar) * 2.5px);
  border-radius: 2px;
  background: currentColor;
  transform-origin: center;
}
.floating-actions .is-playing .sound-signal i {
  animation: glass-signal-wave 750ms calc(var(--signal-bar) * -170ms)
    ease-in-out infinite alternate;
}
.floating-actions .direction-icon {
  width: 23px;
  height: 23px;
}
.floating-actions-status {
  position: absolute;
  top: calc(66px + env(safe-area-inset-top));
  right: 16px;
  box-sizing: border-box;
  width: 220px;
  max-width: calc(100vw - 32px);
  margin: 0;
  padding: 12px 15px;
  border: 1px solid #ffffff38;
  border-radius: 16px;
  color: #fff;
  background: #393939d9;
  font:
    12px/1.5 system-ui,
    sans-serif;
}
@keyframes invitation-control-bounce {
  0%,
  20%,
  40%,
  100% {
    translate: 0 0;
  }
  10% {
    translate: 0 var(--bounce-height);
  }
  30% {
    translate: 0 calc(var(--bounce-height) * 0.45);
  }
}
@keyframes glass-signal-wave {
  from {
    transform: scaleY(0.35);
  }
  to {
    transform: scaleY(1);
  }
}
@media (hover: hover) {
  .floating-actions .floating-action:hover {
    animation-play-state: paused;
  }
  .floating-actions .floating-action:not(.floating-action--music):hover,
  .floating-actions .floating-action--music:hover::before {
    background: #393939ab;
  }
}
@media (prefers-reduced-motion: reduce) {
  .floating-actions .floating-action,
  .floating-actions .sound-signal i {
    animation: none !important;
    transition: none;
  }
}
@supports not (
  (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))
) {
  .floating-actions .floating-action:not(.floating-action--music),
  .floating-actions .floating-action--music::before {
    background: #686868e6;
  }
}
</style>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
const props = defineProps<{ musicSrc: string | null; mapUrl: string }>()
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
  <aside class="floating-actions" aria-label="Nhạc và chỉ đường">
    <p v-if="status" class="floating-actions-status" role="status">
      {{ status }}
    </p>
    <button
      class="floating-action"
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
      <span>{{ musicLabel }}</span>
    </button>
    <a
      v-if="mapUrl"
      class="floating-action"
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
      <span>Chỉ đường</span>
    </a>
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
  position: fixed;
  right: max(16px, env(safe-area-inset-right));
  bottom: calc(18px + env(safe-area-inset-bottom));
  z-index: 1000001;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  width: max-content;
  max-width: calc(100vw - 32px);
  isolation: isolate;
}
.floating-actions .floating-action {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  min-width: 124px;
  min-height: 48px;
  margin: 0;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.88),
    rgba(239, 245, 239, 0.72)
  );
  color: #283b30;
  box-shadow:
    0 5px 22px #253c2c1a,
    inset 0 1px 0 #ffffffed,
    inset 0 -1px 0 #50634c16;
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  backdrop-filter: blur(22px) saturate(160%);
  font:
    500 12px/1.2 -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  letter-spacing: 0.01em;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
  -webkit-tap-highlight-color: transparent;
}
.floating-actions .floating-action::before {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: inherit;
  border-top: 1px solid #ffffffa6;
  pointer-events: none;
}
.floating-actions .floating-action:active {
  transform: scale(0.96);
}
.floating-actions .floating-action:focus-visible {
  outline: 2px solid #48614e;
  outline-offset: 4px;
}
.floating-actions .floating-action:disabled {
  cursor: wait;
  opacity: 0.8;
}
.floating-actions .sound-signal {
  display: flex;
  flex-shrink: 0;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  width: 20px;
  height: 20px;
  padding: 2px 0;
}
.floating-actions .sound-signal i {
  display: block;
  width: 2px;
  height: calc(4px + var(--signal-bar) * 3px);
  border-radius: 2px;
  background: currentColor;
  transform-origin: center bottom;
}
.floating-actions .is-playing .sound-signal i {
  animation: glass-signal-wave 750ms calc(var(--signal-bar) * -170ms)
    ease-in-out infinite alternate;
}
.floating-actions .direction-icon {
  flex-shrink: 0;
}
.floating-actions-status {
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  width: 240px;
  max-width: calc(100vw - 32px);
  margin: 0;
  padding: 12px 15px;
  border: 1px solid #ffffffb8;
  border-radius: 18px;
  color: #283b30;
  background: #f9fcf8f0;
  box-shadow: 0 5px 22px #253c2c1a;
  font:
    12px/1.5 system-ui,
    sans-serif;
}
@keyframes glass-signal-wave {
  from {
    transform: scaleY(0.3);
  }
  to {
    transform: scaleY(1);
  }
}
@media (hover: hover) {
  .floating-actions .floating-action:hover {
    background: linear-gradient(135deg, #fffffff0, #f0f6efde);
    box-shadow:
      0 7px 26px #253c2c24,
      inset 0 1px 0 #fff;
  }
}
@media (max-width: 479px) {
  .floating-actions {
    right: max(12px, env(safe-area-inset-right));
    bottom: calc(16px + env(safe-area-inset-bottom));
    gap: 8px;
  }
  .floating-actions .floating-action {
    min-width: 108px;
    min-height: 46px;
    padding: 11px 13px;
    gap: 8px;
    font-size: 11px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .floating-actions .floating-action {
    transition: none;
  }
  .floating-actions .sound-signal i {
    animation: none !important;
  }
}
@supports not (
  (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))
) {
  .floating-actions .floating-action {
    background: #f4f8f3f5;
  }
}
</style>

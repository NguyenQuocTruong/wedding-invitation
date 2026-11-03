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
      <span class="action-label">{{ playing ? 'Tắt nhạc' : 'Nhạc' }}</span>
    </button>
    <button
      class="floating-action"
      type="button"
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
      <span class="action-label">Chỉ đường</span>
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
  position: relative;
  z-index: 1000001;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
  height: var(--actions-height);
  padding: 7px max(14px, env(safe-area-inset-right))
    calc(7px + env(safe-area-inset-bottom));
  border-top: 1px solid #dce2d780;
  background: linear-gradient(120deg, #f5f7f2eb, #e4eadee6);
  -webkit-backdrop-filter: blur(36px) saturate(150%);
  backdrop-filter: blur(36px) saturate(150%);
  box-shadow: 0 -4px 20px #26352309;
  isolation: isolate;
}
.floating-actions .floating-action {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-shrink: 0;
  width: 64px;
  height: 56px;
  margin: 0;
  padding: 7px 4px;
  border: 1px solid #ffffffb8;
  border-radius: 21px;
  background: linear-gradient(145deg, #ffffff9e, #c8d2c188);
  color: #34452f;
  box-shadow:
    0 2px 7px #30422a0c,
    inset 0 1px 0 #ffffffcc;
  -webkit-backdrop-filter: blur(30px) saturate(140%);
  backdrop-filter: blur(30px) saturate(140%);
  font:
    500 10px/1.2 -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 160ms ease,
    transform 160ms ease;
  -webkit-tap-highlight-color: transparent;
}
.floating-actions .floating-action::before {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: inherit;
  border-top: 1px solid #ffffff99;
  pointer-events: none;
}
.floating-actions .floating-action:active {
  transform: scale(0.96);
}
.floating-actions .floating-action:focus-visible {
  outline: 2px solid #48613e;
  outline-offset: 2px;
}
.floating-actions .floating-action:disabled {
  cursor: wait;
  opacity: 0.75;
}
.floating-actions .sound-signal {
  display: flex;
  flex-shrink: 0;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  box-sizing: border-box;
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
  right: 14px;
  bottom: calc(100% + 8px);
  width: 220px;
  max-width: calc(100vw - 32px);
  margin: 0;
  padding: 12px 15px;
  border: 1px solid #ffffffb8;
  border-radius: 18px;
  color: #34452f;
  background: #f4f8eff5;
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
    background: linear-gradient(145deg, #ffffffd9, #d4decae6);
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
  .floating-actions {
    background: #edf1e8;
  }
  .floating-actions .floating-action {
    background: #dfe7d7;
  }
}
</style>

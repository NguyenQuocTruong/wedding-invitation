<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { previewEvent as event } from '../../config/preview'
const playing = ref(false)
const audio = ref<HTMLAudioElement | null>(null)
const status = ref('')
async function toggle() {
  if (!event.musicSrc) {
    status.value = 'Nhạc demo chưa có tệp âm thanh. Không phát hoặc tải nhạc.'
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
    status.value = ''
  } catch {
    status.value = 'Trình duyệt chưa cho phép phát nhạc. Bạn có thể thử lại.'
  }
}
onUnmounted(() => audio.value?.pause())
</script>
<template>
  <div class="music-control">
    <audio
      v-if="event.musicSrc"
      ref="audio"
      :src="event.musicSrc"
      preload="none"
      loop
      @pause="playing = false"
      @error="status = 'Chưa tải được nhạc.'"
    />
    <button type="button" :aria-pressed="playing" @click="toggle">
      <span aria-hidden="true">♫</span>
      {{ event.musicSrc ? (playing ? 'Tắt nhạc' : 'Bật nhạc') : 'Nhạc · Demo' }}
    </button>
    <p v-if="status" class="music-status" role="status">{{ status }}</p>
  </div>
</template>

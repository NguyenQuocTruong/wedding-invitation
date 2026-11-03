<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { countdownParts } from '../../utils/preview'
const props = defineProps<{
  dateTime: string
  dateLabel?: string
  timeLabel?: string
  compact?: boolean
  sample?: boolean
}>()
const now = ref(Date.now())
const parts = computed(() => countdownParts(props.dateTime, now.value))
const labels = ['Ngày', 'Giờ', 'Phút', 'Giây']
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>
<template>
  <section
    class="wedding-countdown"
    :class="{ 'wedding-countdown--compact': compact }"
    aria-label="Đếm ngược đến ngày cưới"
  >
    <template v-if="!compact">
      <p class="countdown-eyebrow">ĐẾM TỪNG KHOẢNH KHẮC</p>
      <h2>Ngày mình có nhau</h2>
      <p v-if="dateLabel" class="countdown-date">
        {{ dateLabel }}<span v-if="timeLabel"> · {{ timeLabel }}</span>
      </p>
    </template>
    <div
      v-if="parts?.some(Boolean)"
      class="countdown-grid"
      role="timer"
      aria-label="Thời gian còn lại đến ngày cưới"
    >
      <div v-for="(value, index) in parts" :key="index" class="countdown-cell">
        <strong class="countdown-value">{{
          String(value).padStart(2, '0')
        }}</strong>
        <span class="countdown-unit">{{ labels[index] }}</span>
      </div>
    </div>
    <p v-else class="countdown-message">
      {{
        parts
          ? 'Ngày vui đã đến. Cảm ơn bạn đã ở đây!'
          : 'Ngày cưới sẽ được cập nhật.'
      }}
    </p>
    <p v-if="sample" class="countdown-note">
      Ngày và giờ hiển thị chỉ là dữ liệu mẫu.
    </p>
  </section>
</template>
<style scoped>
.wedding-countdown {
  padding: 64px 24px;
  background: #f0f3ec;
  color: #465640;
  text-align: center;
}
.wedding-countdown .countdown-eyebrow {
  margin: 0 0 14px;
  font:
    10px/1.5 system-ui,
    sans-serif;
  letter-spacing: 0.22em;
  color: #78866f;
}
.wedding-countdown h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(26px, 6vw, 38px);
  font-weight: 400;
}
.wedding-countdown .countdown-date {
  margin: 18px 0 0;
  font:
    12px/1.8 system-ui,
    sans-serif;
  color: #687660;
}
.countdown-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  width: min(100%, 460px);
  margin: 36px auto 0;
}
.countdown-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
}
.countdown-value {
  font:
    400 clamp(28px, 7vw, 44px)/1.2 Georgia,
    'Times New Roman',
    serif;
  font-variant-numeric: tabular-nums;
}
.countdown-unit {
  color: #7b8773;
  font:
    10px/1.4 system-ui,
    sans-serif;
  letter-spacing: 0.1em;
}
.countdown-message,
.countdown-note {
  margin: 28px 0 0;
  font-size: 13px;
  line-height: 1.7;
}
.countdown-note {
  color: #7b8773;
  font-size: 11px;
}
.wedding-countdown--compact {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  background: transparent;
}
.wedding-countdown--compact .countdown-grid {
  width: 100%;
  margin: 0;
  gap: 6px;
}
.wedding-countdown--compact .countdown-cell {
  height: 66px;
  border-radius: 3px;
  gap: 6px;
  background: var(--countdown-cell-bg, #424f33);
  color: var(--countdown-cell-color, #fff);
}
.wedding-countdown--compact .countdown-value {
  font:
    20px/1.2 Georgia,
    serif;
}
.wedding-countdown--compact .countdown-unit {
  color: #fff;
  /* Compensate for the template canvas scale so labels stay ~12.5px on phones. */
  font-size: calc(12.5px / var(--canvas-scale, 1));
  letter-spacing: 0.04em;
}
.wedding-countdown--compact .countdown-message {
  margin: 0;
  color: #424f33;
}
</style>

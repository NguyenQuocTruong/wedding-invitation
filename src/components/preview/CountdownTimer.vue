<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { previewEvent as event } from '../../config/preview'
import { countdownParts } from '../../utils/preview'
const now = ref(Date.now())
const parts = computed(() => countdownParts(event.dateTime, now.value))
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
    class="countdown-section"
    aria-labelledby="countdown-title"
    data-reveal
  >
    <p class="eyebrow">ĐẾM TỪNG KHOẢNH KHẮC</p>
    <h2 id="countdown-title">Ngày mình có nhau</h2>
    <div
      v-if="parts?.some(Boolean)"
      class="countdown"
      aria-label="Thời gian còn lại đến ngày minh họa"
    >
      <div v-for="(value, index) in parts" :key="index">
        <span>{{ String(value).padStart(2, '0') }}</span
        ><small>{{ labels[index] }}</small>
      </div>
    </div>
    <p v-else>
      {{
        parts
          ? 'Ngày vui đã đến. Cảm ơn bạn đã ở đây!'
          : 'Ngày cưới sẽ được cập nhật.'
      }}
    </p>
    <p class="subtle">Ngày và giờ trong bản xem trước chỉ là dữ liệu mẫu.</p>
  </section>
</template>

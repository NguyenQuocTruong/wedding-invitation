<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { previewEvent as event } from '../../config/preview'
import { previewMotion } from '../../config/theme'
const emit = defineEmits<{ opened: [] }>()
const opening = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
function finish() {
  clearTimeout(timer)
  emit('opened')
}
function open() {
  if (opening.value) return
  opening.value = true
  if (
    !previewMotion.enabled ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
    finish()
  else timer = setTimeout(finish, previewMotion.openingMs)
}
onUnmounted(() => clearTimeout(timer))
</script>
<template>
  <section
    class="envelope-intro"
    :class="{ opening }"
    aria-labelledby="intro-title"
  >
    <div class="intro-top">
      <span class="monogram">c<span>&amp;</span>c</span
      ><span class="eyebrow">THE WEDDING · {{ event.year }}</span>
    </div>
    <p class="eyebrow">MỘT NGÀY THẬT ĐẸP ĐANG ĐỢI</p>
    <h1 id="intro-title" tabindex="-1">
      Gửi bạn một<br /><em>lời mời thương.</em>
    </h1>
    <p class="intro-copy">
      Có những khoảnh khắc chỉ trọn vẹn<br />khi có bạn ở bên.
    </p>
    <div class="envelope" aria-hidden="true">
      <div class="letter">
        <span class="eyebrow">TRÂN TRỌNG KÍNH MỜI</span>
        <p>{{ event.brideName }} <i>&amp;</i> {{ event.groomName }}</p>
        <small>{{ event.dateLabel }}</small>
      </div>
      <div class="envelope-back"></div>
      <div class="envelope-front"></div>
      <div class="envelope-flap"></div>
      <span class="seal">c&amp;c</span>
    </div>
    <button class="button" type="button" :disabled="opening" @click="open">
      {{ opening ? 'Đang mở lời mời…' : 'Mở thiệp' }}
      <span aria-hidden="true">↗</span>
    </button>
    <button class="text-button" type="button" @click="finish">
      Bỏ qua hiệu ứng
    </button>
    <p class="intro-note">DÀNH MỘT CHÚT THỜI GIAN, CÙNG CHÚNG MÌNH NHÉ.</p>
  </section>
</template>

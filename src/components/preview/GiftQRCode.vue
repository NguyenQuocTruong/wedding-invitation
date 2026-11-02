<script setup lang="ts">
import type { GuestSide } from '../../types/rsvp'
import { useInvitation } from '../../composables/useInvitation'
const { event, preview } = useInvitation()
defineProps<{ side: GuestSide }>()
</script>
<template>
  <article class="gift-card">
    <span class="eyebrow">GỬI MỘT CHÚT YÊU THƯƠNG</span>
    <h3>{{ event.gifts[side].label }}</h3>
    <template v-if="event.gifts[side].image">
      <img
        :src="event.gifts[side].image"
        :alt="
          (preview ? 'QR minh họa, không thể chuyển khoản: ' : 'Mã QR: ') +
          event.gifts[side].label
        "
        width="220"
        height="220"
        loading="lazy"
      />
      <p>{{ event.gifts[side].bank }}</p>
      <strong>{{ event.gifts[side].recipient }}</strong
      ><small v-if="preview">Hình minh họa · Không dùng chuyển khoản</small>
      <a
        class="text-link"
        :href="event.gifts[side].image"
        :download="side.toLowerCase() + (preview ? '-demo.svg' : '-qr')"
        >{{ preview ? 'Lưu ảnh mẫu ↓' : 'Lưu mã QR ↓' }}</a
      >
      <a
        class="qr-fallback"
        :href="event.gifts[side].image"
        target="_blank"
        rel="noopener noreferrer"
        >Mở ảnh để nhấn giữ lưu trên iPhone ↗</a
      >
    </template>
    <p v-else class="subtle">Thông tin mừng cưới sẽ được cập nhật.</p>
  </article>
</template>

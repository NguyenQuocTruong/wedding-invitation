<script setup lang="ts">
import type { GuestSide } from '../../types/rsvp'
import { previewEvent as event } from '../../config/preview'
defineProps<{ side: GuestSide }>()
</script>
<template>
  <article class="gift-card">
    <span class="eyebrow">GỬI MỘT CHÚT YÊU THƯƠNG</span>
    <h3>{{ event.gifts[side].label }}</h3>
    <img
      :src="event.gifts[side].image"
      :alt="
        'QR minh họa cho ' +
        event.gifts[side].label +
        ', không thể chuyển khoản'
      "
      width="220"
      height="220"
      loading="lazy"
    />
    <p>{{ event.gifts[side].bank }}</p>
    <strong>{{ event.gifts[side].recipient }}</strong
    ><small>Hình minh họa · Không dùng chuyển khoản</small>
    <a
      class="text-link"
      :href="event.gifts[side].image"
      :download="side.toLowerCase() + '-demo.svg'"
      >Lưu ảnh mẫu ↓</a
    >
    <a
      class="qr-fallback"
      :href="event.gifts[side].image"
      target="_blank"
      rel="noopener noreferrer"
      >Mở ảnh để nhấn giữ lưu trên iPhone ↗</a
    >
  </article>
</template>

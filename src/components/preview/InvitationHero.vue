<script setup lang="ts">
import { useInvitation } from '../../composables/useInvitation'
const { event, preview } = useInvitation()
</script>
<template>
  <header id="invitation" class="preview-hero">
    <div class="hero-copy">
      <p class="eyebrow">CÙNG VIẾT TIẾP MỘT CÂU CHUYỆN</p>
      <h1 tabindex="-1">
        <span class="couple-name">{{ event.brideName }}</span
        ><span class="hero-amp">&amp;</span
        ><span class="couple-name">{{ event.groomName }}</span>
      </h1>
      <p class="hero-invitation">{{ event.invitation }}</p>
      <div class="hero-date">
        <span>{{ event.day }}</span>
        <div>
          {{ event.monthLabel }}<br /><strong>{{ event.year }}</strong>
        </div>
      </div>
      <a class="button" href="#event"
        >Hẹn bạn ngày chung đôi <span aria-hidden="true">↓</span></a
      >
    </div>
    <figure class="hero-art">
      <img
        :src="event.hero"
        width="800"
        height="1000"
        fetchpriority="high"
        :alt="
          event.photos[0]?.alt ||
          'Minh họa đôi uyên ương — ảnh cưới sẽ được cập nhật'
        "
      />
      <figcaption>
        {{
          !preview && !event.photos.length
            ? 'HÌNH MINH HỌA · ẢNH CƯỚI SẼ ĐƯỢC CẬP NHẬT'
            : '01 / CHÚNG MÌNH, TỪ ĐÂY VỀ SAU'
        }}
      </figcaption>
      <span class="hero-stamp" aria-hidden="true"
        >a little love<br /><em>a lifetime together</em></span
      >
    </figure>
    <p class="hero-bottom">
      TRÂN TRỌNG MỜI BẠN ĐẾN CHUNG VUI <span aria-hidden="true">✳︎</span>
      {{ event.dateLabel }}
    </p>
  </header>
</template>

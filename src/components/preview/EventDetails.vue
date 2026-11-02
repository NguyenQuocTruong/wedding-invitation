<script setup lang="ts">
import { previewEvent as event } from '../../config/preview'
</script>
<template>
  <section
    id="event"
    class="preview-section event-section"
    data-reveal
    aria-labelledby="event-title"
  >
    <div>
      <p class="eyebrow">THE DAY WE SAY “I DO”</p>
      <h2 id="event-title">
        Một ngày chung đôi.<br /><em>Một đời bên nhau.</em>
      </h2>
      <p>
        Chúng mình mong được đón bạn,<br />cùng nâng ly và lưu lại những điều
        thật đẹp.
      </p>
    </div>
    <div class="event-card">
      <span class="small-flower" aria-hidden="true">✳︎</span>
      <p class="eyebrow">LỄ THÀNH HÔN · THÔNG TIN MẪU</p>
      <h3>{{ event.dateLabel }}</h3>
      <p>{{ event.timeLabel }} <span class="subtle">· Giờ Việt Nam</span></p>
      <hr />
      <h3>{{ event.venue }}</h3>
      <p>{{ event.address }}</p>
      <a
        class="text-link"
        :href="event.mapUrl"
        target="_blank"
        rel="noopener noreferrer"
        >Xem khu vực minh họa trên bản đồ ↗</a
      >
    </div>
  </section>
</template>

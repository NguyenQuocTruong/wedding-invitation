<script setup lang="ts">
import { useInvitation } from '../../composables/useInvitation'
const { event } = useInvitation()
</script>
<template>
  <section
    v-if="event.families"
    id="families"
    class="preview-section family-section"
    aria-labelledby="family-title"
  >
    <div class="section-heading" data-reveal>
      <p class="eyebrow">HAI GIA ĐÌNH · MỘT NIỀM VUI</p>
      <h2 id="family-title">Từ hai mái nhà,<br /><em>về chung một lối.</em></h2>
      <p>Trân trọng báo tin vui và kính mời bạn đến chung vui cùng gia đình.</p>
    </div>
    <div class="family-grid">
      <article
        v-for="side in ['BRIDE', 'GROOM'] as const"
        :key="side"
        class="family-card"
        data-reveal
      >
        <p class="eyebrow">{{ event.families[side].label }}</p>
        <span class="family-flower" aria-hidden="true">✳︎</span>
        <p
          v-for="parent in event.families[side].parents"
          :key="parent"
          class="parent-name"
        >
          {{ parent }}
        </p>
        <p class="family-address">{{ event.families[side].address }}</p>
        <p class="eyebrow">{{ side === 'BRIDE' ? 'CÔ DÂU' : 'CHÚ RỂ' }}</p>
        <h3>{{ event.families[side].fullName }}</h3>
      </article>
    </div>
    <p v-if="event.sampleContent" class="sample-note">
      Tên, quan hệ gia đình và địa chỉ trên là thông tin giả định để xem bố cục.
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ disabled?: boolean }>()
const viewport = ref<HTMLElement | null>(null)
function scrollToTop() {
  const target = viewport.value || window
  target.scrollTo({ top: 0, behavior: 'instant' })
}
defineExpose({ scrollToTop })
</script>
<template>
  <template v-if="disabled"><slot /></template>
  <div v-else class="invitation-frame">
    <div ref="viewport" class="invitation-viewport"><slot /></div>
    <slot name="actions" />
  </div>
</template>
<style>
.invitation-frame {
  --actions-height: calc(72px + env(safe-area-inset-bottom, 0px));
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  isolation: isolate;
  background: #faf9f6;
}
.invitation-viewport {
  min-height: 0;
  overflow: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
}
.invitation-viewport > .clone-page {
  min-height: calc(100dvh - var(--actions-height));
}
.invitation-viewport .envelope-intro {
  min-height: calc(100dvh - var(--actions-height));
}
@media (max-height: 640px) {
  .invitation-frame {
    --opening-alignment: flex-start;
    --opening-padding: 20px 0;
  }
}
</style>

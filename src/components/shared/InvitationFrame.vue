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
  --actions-height: 0px;
  position: relative;
  display: grid;
  grid-template-rows: minmax(0, 1fr);
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
  scroll-padding-block: 64px calc(84px + env(safe-area-inset-bottom));
  -webkit-overflow-scrolling: touch;
}
.invitation-viewport .opened-invitation {
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}
.invitation-viewport > .clone-page {
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
  min-height: calc(100dvh - var(--actions-height));
}
.invitation-viewport .envelope-intro {
  min-height: calc(100dvh - var(--actions-height));
}
.invitation-viewport .intro-top {
  padding-right: 58px;
}
.invitation-viewport .preview-nav {
  padding-right: calc(72px + env(safe-area-inset-right));
}
.invitation-viewport .preview-nav > div {
  min-width: 0;
  flex-wrap: wrap;
}
@media (max-height: 640px) {
  .invitation-frame {
    --opening-alignment: flex-start;
    --opening-padding: 20px 0;
  }
}
</style>

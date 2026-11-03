<script setup lang="ts">
import { useInvitation } from '../../composables/useInvitation'
import WeddingCountdown from '../shared/WeddingCountdown.vue'
const { event, preview } = useInvitation()
</script>
<template>
  <WeddingCountdown
    :date-time="event.dateTime"
    :date-label="event.dateLabel"
    :time-label="event.timeLabel"
    :sample="preview || event.sampleContent"
    data-reveal
  />
</template>

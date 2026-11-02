<script setup lang="ts">
import { event } from '../../config/event'
</script>

<template>
  <section aria-label="Thông tin lễ cưới">
    <h2>Thông tin lễ cưới</h2>
    <p>{{ event.venue || 'Địa điểm và thời gian sẽ được cập nhật.' }}</p>
  </section>
</template>

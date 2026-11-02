<script setup lang="ts">
import type { GuestSide } from '../../types/rsvp'
defineProps<{ side: GuestSide }>()
</script>

<template>
  <section
    :aria-label="side === 'BRIDE' ? 'Quà mừng cô dâu' : 'Quà mừng chú rể'"
  >
    <h2>{{ side === 'BRIDE' ? 'Quà mừng cô dâu' : 'Quà mừng chú rể' }}</h2>
    <p>Mã QR riêng sẽ được bổ sung ở Phase 4.</p>
  </section>
</template>

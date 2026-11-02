<script setup lang="ts">
import { event } from '../../config/event'
</script>

<template>
  <header>
    <h1 class="text-3xl font-semibold">
      {{ event.brideName }} &amp; {{ event.groomName }}
    </h1>
    <p>{{ event.invitation }}</p>
  </header>
</template>

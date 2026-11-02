<script setup lang="ts">
import EnvelopeIntro from '../components/invitation/EnvelopeIntro.vue'
import InvitationHero from '../components/invitation/InvitationHero.vue'
import PhotoGallery from '../components/invitation/PhotoGallery.vue'
import EventDetails from '../components/invitation/EventDetails.vue'
import RSVPForm from '../components/invitation/RSVPForm.vue'
import GiftQRCode from '../components/invitation/GiftQRCode.vue'
import { theme } from '../config/theme'
</script>

<template>
  <main
    class="mx-auto max-w-3xl space-y-8 p-6"
    :style="{
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontFamily: theme.fontFamily,
    }"
  >
    <p>Phase 1 — nền tảng kỹ thuật, nội dung đang được chuẩn bị.</p>
    <EnvelopeIntro />
    <InvitationHero />
    <PhotoGallery />
    <EventDetails />
    <RSVPForm />
    <GiftQRCode side="BRIDE" />
    <GiftQRCode side="GROOM" />
    <footer>
      Thông tin RSVP chỉ phục vụ tổ chức sự kiện và được người chủ trì xem. Bản
      nền tảng này chưa thu thập thông tin.
    </footer>
  </main>
</template>

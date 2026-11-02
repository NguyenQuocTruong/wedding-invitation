<script setup lang="ts">
import { nextTick, ref } from 'vue'
import EnvelopeIntro from '../components/preview/EnvelopeIntro.vue'
import InvitationHero from '../components/preview/InvitationHero.vue'
import EventDetails from '../components/preview/EventDetails.vue'
import PhotoGallery from '../components/preview/PhotoGallery.vue'
import CountdownTimer from '../components/preview/CountdownTimer.vue'
import RSVPForm from '../components/preview/RSVPForm.vue'
import GiftQRCode from '../components/preview/GiftQRCode.vue'
import MusicControl from '../components/preview/MusicControl.vue'
import { useReveal } from '../composables/useReveal'
import { previewTheme, previewMotion } from '../config/theme'
import '../styles/preview.css'
const opened = ref(false)
const root = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)
useReveal(content)
async function replay() {
  opened.value = false
  await nextTick()
  root.value
    ?.querySelector<HTMLElement>('#intro-title')
    ?.focus({ preventScroll: true })
  window.scrollTo({ top: 0, behavior: 'instant' })
}
async function open() {
  opened.value = true
  await nextTick()
  content.value
    ?.querySelector<HTMLElement>('h1')
    ?.focus({ preventScroll: true })
  window.scrollTo({ top: 0, behavior: 'instant' })
}
</script>
<template>
  <div
    ref="root"
    class="design-preview"
    :style="{
      ...previewTheme,
      '--reveal-duration': previewMotion.revealMs + 'ms',
    }"
    :class="{ 'motion-disabled': !previewMotion.enabled }"
  >
    <div class="preview-banner">
      MẪU THIỆP 01 <span>·</span> Bản xem trước tương tác — thông tin &amp; hình
      minh họa
    </div>
    <EnvelopeIntro v-if="!opened" @opened="open" />
    <div v-else ref="content" class="opened-invitation">
      <a class="skip-link" href="#rsvp">Đến phần xác nhận demo</a>
      <nav class="preview-nav" aria-label="Điều hướng thiệp">
        <a class="monogram" href="#invitation" aria-label="Về đầu thiệp"
          >c<span>&amp;</span>c</a
        >
        <div>
          <a href="#event">Ngày chung đôi</a><a href="#gallery">Album</a
          ><a href="#rsvp">Lời hẹn</a>
        </div>
        <MusicControl />
      </nav>
      <main>
        <InvitationHero /><EventDetails /><PhotoGallery /><CountdownTimer /><RSVPForm />
        <section
          id="gifts"
          class="preview-section gift-section"
          aria-labelledby="gift-title"
        >
          <div class="section-heading">
            <p class="eyebrow">TỪ TRÁI TIM ĐẾN TRÁI TIM</p>
            <h2 id="gift-title">Một chút yêu thương.</h2>
            <p>Sự hiện diện của bạn đã là món quà thật đẹp với chúng mình.</p>
          </div>
          <div class="gift-grid">
            <GiftQRCode side="BRIDE" /><GiftQRCode side="GROOM" />
          </div>
        </section>
      </main>
      <footer class="preview-footer">
        <span class="monogram">c<span>&amp;</span>c</span>
        <h2>Hẹn bạn,<br /><em>ngày hạnh phúc.</em></h2>
        <p>Cảm ơn vì đã là một phần trong câu chuyện của chúng mình.</p>
        <small>MẪU THIỆP 01 · DEMO · KHÔNG THU THẬP RSVP</small
        ><button class="text-button" type="button" @click="replay">
          Xem lại phong bì ↗
        </button>
      </footer>
    </div>
  </div>
</template>

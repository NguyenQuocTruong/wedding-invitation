<script setup lang="ts">
import { nextTick, provide, ref } from 'vue'
import { invitationKey } from '../composables/useInvitation'
import { event as productionEvent } from '../config/event'
import { previewEvent } from '../config/preview'
const props = defineProps<{ preview?: boolean }>()
const preview = props.preview === true
const event = preview ? previewEvent : productionEvent
provide(invitationKey, {
  event,
  preview,
})
import FloatingActions from '../components/shared/FloatingActions.vue'
import InvitationFrame from '../components/shared/InvitationFrame.vue'
import GiftDialog from '../components/shared/GiftDialog.vue'
import WeddingTimeline from '../components/shared/WeddingTimeline.vue'
import PetalField from '../components/effects/PetalField.vue'
import FamilyDetails from '../components/preview/FamilyDetails.vue'
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
const frame = ref<InstanceType<typeof InvitationFrame> | null>(null)
const giftDialog = ref<InstanceType<typeof GiftDialog> | null>(null)
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
  frame.value?.scrollToTop()
}
async function open() {
  opened.value = true
  await nextTick()
  content.value
    ?.querySelector<HTMLElement>('h1')
    ?.focus({ preventScroll: true })
  frame.value?.scrollToTop()
}
</script>
<template>
  <InvitationFrame ref="frame" :disabled="preview">
    <div
      ref="root"
      class="design-preview"
      :style="{
        ...previewTheme,
        '--reveal-duration': previewMotion.revealMs + 'ms',
      }"
      :class="{ 'motion-disabled': !previewMotion.enabled }"
    >
      <div v-if="preview" class="preview-banner">
        MẪU THIỆP 01 <span>·</span> Bản xem trước tương tác — thông tin &amp;
        hình minh họa
      </div>
      <div v-if="!preview && event.sampleContent" class="sample-banner">
        BẢN NỘI DUNG MẪU · Tên, gia đình, địa chỉ và ngày cưới đều là thông tin
        minh họa.
      </div>
      <PetalField v-if="!preview" />
      <div v-else class="ambient-leaves" aria-hidden="true">
        <span v-for="n in 8" :key="n" :style="{ '--leaf-index': n }"></span>
      </div>
      <EnvelopeIntro
        v-if="!opened"
        :motion-disabled="!previewMotion.enabled"
        @opened="open"
      />
      <div v-else ref="content" class="opened-invitation">
        <a class="skip-link" href="#rsvp">{{
          preview ? 'Đến phần xác nhận demo' : 'Đến phần xác nhận tham dự'
        }}</a>
        <nav class="preview-nav" aria-label="Điều hướng thiệp">
          <a class="monogram" href="#invitation" aria-label="Về đầu thiệp"
            >c<span>&amp;</span>c</a
          >
          <div>
            <a href="/thiep-2">Thiệp 2</a><a href="#event">Ngày chung đôi</a
            ><a href="#gallery">Album</a><a href="#rsvp">Lời hẹn</a>
          </div>
          <MusicControl v-if="preview" />
        </nav>
        <main>
          <InvitationHero /><FamilyDetails /><EventDetails /><PhotoGallery />
          <WeddingTimeline
            v-if="!preview && event.events"
            :events="event.events"
          />
          <CountdownTimer /><RSVPForm />
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
          <small>{{
            preview
              ? 'MẪU THIỆP 01 · DEMO · KHÔNG THU THẬP RSVP'
              : event.sampleContent
                ? 'THÔNG TIN MẪU · CHƯA PHẢI THIỆP MỜI CHÍNH THỨC'
                : 'TRÂN TRỌNG KÍNH MỜI'
          }}</small
          ><button class="text-button" type="button" @click="replay">
            Xem lại phong bì ↗
          </button>
        </footer>
      </div>
    </div>
    <template #actions>
      <FloatingActions
        v-if="!preview"
        :music-src="event.musicSrc"
        :map-url="event.mapUrl"
        @gifts="giftDialog?.open()"
      />
    </template>
  </InvitationFrame>
  <GiftDialog v-if="!preview" ref="giftDialog" :gifts="event.gifts" />
</template>

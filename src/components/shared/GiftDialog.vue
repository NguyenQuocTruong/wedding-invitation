<script setup lang="ts">
import { ref } from 'vue'
import type { PreviewEvent } from '../../config/preview'
defineProps<{ gifts: PreviewEvent['gifts'] }>()
const dialog = ref<HTMLDialogElement | null>(null)
function open() {
  if (!dialog.value?.open) dialog.value?.showModal()
}
defineExpose({ open })
</script>
<template>
  <dialog
    ref="dialog"
    class="wedding-gift-dialog"
    aria-labelledby="gift-dialog-title"
    @click="$event.target === dialog && dialog?.close()"
  >
    <button
      class="gift-dialog-close"
      type="button"
      autofocus
      aria-label="Đóng hộp quà"
      @click="dialog?.close()"
    >
      ×
    </button>
    <p class="gift-dialog-eyebrow">GỬI MỘT CHÚT YÊU THƯƠNG</p>
    <h2 id="gift-dialog-title">Hộp quà yêu thương</h2>
    <p class="gift-dialog-intro">
      Sự hiện diện của bạn là món quà quý giá với chúng mình.
    </p>
    <div class="gift-dialog-grid">
      <article v-for="(gift, side) in gifts" :key="side">
        <h3>{{ gift.label }}</h3>
        <template v-if="gift.image">
          <img
            :src="gift.image"
            :alt="'Mã QR mừng cưới ' + gift.label"
            width="180"
            height="180"
          />
          <p>{{ gift.bank }}</p>
          <p>{{ gift.recipient }}</p>
          <a :href="gift.image" target="_blank" rel="noopener noreferrer"
            >Mở mã QR để lưu ↗</a
          >
        </template>
        <p v-else>Thông tin mừng cưới sẽ được cập nhật.</p>
      </article>
    </div>
  </dialog>
</template>
<style>
.wedding-gift-dialog {
  position: fixed;
  box-sizing: border-box;
  width: min(540px, calc(100vw - 32px));
  max-height: calc(100dvh - 40px);
  overflow: auto;
  margin: auto;
  padding: 48px 24px 28px;
  border: 1px solid #fff9;
  border-radius: 24px;
  background: #fbfcf8;
  color: #465640;
  text-align: center;
  box-shadow: 0 24px 100px #16231340;
  font:
    14px/1.7 system-ui,
    sans-serif;
}
.wedding-gift-dialog::backdrop {
  background: #1d281f80;
  backdrop-filter: blur(8px);
}
.wedding-gift-dialog .gift-dialog-close {
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #e9eee5;
  color: #465640;
  font:
    26px/1 system-ui,
    sans-serif;
  cursor: pointer;
}
.wedding-gift-dialog .gift-dialog-eyebrow {
  margin: 0 0 12px;
  color: #7a8b70;
  font-size: 9px;
  letter-spacing: 0.18em;
}
.wedding-gift-dialog h2 {
  margin: 0;
  font:
    400 28px/1.3 Georgia,
    serif;
}
.wedding-gift-dialog .gift-dialog-intro {
  margin: 18px 0 24px;
  font-size: 13px;
}
.gift-dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.gift-dialog-grid article {
  padding: 20px 12px;
  border: 1px solid #dce4d7;
  border-radius: 16px;
}
.gift-dialog-grid h3 {
  margin: 0 0 12px;
  font:
    400 21px/1.4 Georgia,
    serif;
}
.gift-dialog-grid p {
  margin: 0;
  font-size: 12px;
  color: #707a69;
}
.gift-dialog-grid img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto 12px;
}
.gift-dialog-grid a {
  display: inline-block;
  padding: 12px 0;
  color: #465640;
  font-size: 12px;
}
.wedding-gift-dialog :focus-visible {
  outline: 2px solid #607653;
  outline-offset: 3px;
}
@media (max-width: 359px) {
  .gift-dialog-grid {
    grid-template-columns: 1fr;
  }
}
</style>

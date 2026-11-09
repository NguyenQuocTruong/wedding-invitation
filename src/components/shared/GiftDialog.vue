<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PreviewEvent } from '../../config/preview'
import type { GuestSide } from '../../types/rsvp'

const props = withDefaults(
  defineProps<{
    gifts: PreviewEvent['gifts']
    side?: GuestSide
  }>(),
  {
    side: undefined,
  },
)

const dialog = ref<HTMLDialogElement | null>(null)
const copiedSide = ref<string | null>(null)

const displayedGifts = computed(() => {
  if (props.side && props.gifts[props.side]) {
    return { [props.side]: props.gifts[props.side] }
  }
  return props.gifts
})

const isSingle = computed(() => Object.keys(displayedGifts.value).length === 1)

function hasAccountDigits(bankInfo: string): boolean {
  return bankInfo.replace(/\D/g, '').length >= 6
}

function open() {
  if (!dialog.value?.open) dialog.value?.showModal()
}

async function copyAccount(bankInfo: string, side: string) {
  const digits = bankInfo.replace(/\D/g, '')
  const cleanNumber = digits.length >= 6 ? digits : bankInfo
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(cleanNumber)
    } else {
      throw new Error('Clipboard API unavailable')
    }
    copiedSide.value = side
    setTimeout(() => {
      if (copiedSide.value === side) copiedSide.value = null
    }, 2000)
  } catch {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = cleanNumber
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      copiedSide.value = side
      setTimeout(() => {
        if (copiedSide.value === side) copiedSide.value = null
      }, 2000)
    } catch {
      // ignore
    }
  }
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
    <div class="gift-dialog-grid" :class="{ 'is-single': isSingle }">
      <article v-for="(gift, giftSide) in displayedGifts" :key="giftSide">
        <h3>{{ gift.label }}</h3>
        <template v-if="gift.image">
          <img
            :src="gift.image"
            :alt="'Mã QR mừng cưới ' + gift.label"
            width="180"
            height="180"
          />
          <p class="gift-dialog-bank">{{ gift.bank }}</p>
          <p class="gift-dialog-recipient">{{ gift.recipient }}</p>
          <div class="gift-dialog-actions">
            <button
              v-if="hasAccountDigits(gift.bank)"
              type="button"
              class="gift-copy-btn"
              :class="{ 'is-copied': copiedSide === giftSide }"
              @click="copyAccount(gift.bank, String(giftSide))"
            >
              {{
                copiedSide === giftSide ? '✓ Đã sao chép STK' : 'Sao chép STK'
              }}
            </button>
            <a :href="gift.image" target="_blank" rel="noopener noreferrer"
              >Mở mã QR để lưu ↗</a
            >
          </div>
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
  background: var(--theme-canvas-bg, #fbfcf8);
  color: var(--theme-accent, #465640);
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
  background: var(--theme-outer-bg, #e9eee5);
  color: var(--theme-primary, #465640);
  font:
    26px/1 system-ui,
    sans-serif;
  cursor: pointer;
}
.wedding-gift-dialog .gift-dialog-eyebrow {
  margin: 0 0 12px;
  color: var(--theme-primary, #7a8b70);
  font-size: 11px;
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
  font-size: 13.5px;
}
.gift-dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.gift-dialog-grid.is-single {
  grid-template-columns: minmax(0, 290px);
  justify-content: center;
}
.wedding-gift-dialog:has(.is-single) {
  width: min(390px, calc(100vw - 32px));
}
.gift-dialog-grid article {
  padding: 20px 12px;
  border: 1px solid var(--timeline-card-border, #dce4d7);
  background: #fff;
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
  font-size: 13px;
  color: var(--theme-accent, #707a69);
}
.gift-dialog-bank {
  font-weight: 600;
  color: var(--theme-accent, #35432f) !important;
  margin-top: 4px !important;
  font-size: 13px !important;
}
.gift-dialog-recipient {
  color: var(--theme-accent, #55664d) !important;
  margin: 2px 0 8px !important;
  font-size: 13px !important;
  font-weight: 500;
  letter-spacing: 0.04em;
}
.gift-dialog-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-top: 8px;
}
.gift-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 16px;
  border: 1px solid var(--theme-primary, #4a7c59);
  border-radius: 9999px;
  background: var(--theme-outer-bg, #edf3e7);
  color: var(--theme-primary, #4a7c59);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.gift-copy-btn:hover {
  background: var(--theme-primary, #4a7c59);
  color: #fff;
}
.gift-copy-btn.is-copied {
  background: #2e7d32 !important;
  border-color: #2e7d32 !important;
  color: #fff !important;
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
  color: var(--theme-primary, #465640);
  font-size: 13px;
  font-weight: 500;
}
.wedding-gift-dialog :focus-visible {
  outline: 2px solid var(--theme-primary, #607653);
  outline-offset: 3px;
}
@media (max-width: 359px) {
  .gift-dialog-grid {
    grid-template-columns: 1fr;
  }
}
</style>

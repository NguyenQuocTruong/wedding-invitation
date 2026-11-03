<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { Attendance, GuestSide } from '../../types/rsvp'

const dialog = ref<HTMLDialogElement | null>(null)
const form = reactive({
  guestName: '',
  guestSide: '' as GuestSide | '',
  attendance: '' as Attendance | '',
  message: '',
})
function open() {
  if (!dialog.value?.open) dialog.value?.showModal()
}
defineExpose({ open })
</script>

<template>
  <dialog
    ref="dialog"
    class="rsvp-dialog"
    aria-labelledby="rsvp-dialog-title"
    aria-describedby="rsvp-dialog-intro"
    @click="$event.target === dialog && dialog?.close()"
  >
    <header class="rsvp-dialog-header">
      <button
        type="button"
        class="rsvp-dialog-close"
        aria-label="Đóng xác nhận"
        @click="dialog?.close()"
      >
        ×
      </button>
      <p class="rsvp-dialog-eyebrow">HẸN GẶP BẠN NGÀY CHUNG ĐÔI</p>
      <h2 id="rsvp-dialog-title">Xác nhận tham dự</h2>
      <p id="rsvp-dialog-intro">Có bạn, niềm vui thêm trọn vẹn.</p>
    </header>
    <form class="rsvp-dialog-form" @submit.prevent>
      <div class="rsvp-input-group">
        <label for="rsvp-popup-name"
          >Họ và tên <span aria-hidden="true">*</span></label
        >
        <input
          id="rsvp-popup-name"
          v-model="form.guestName"
          name="guestName"
          type="text"
          autocomplete="name"
          minlength="2"
          maxlength="100"
          required
          autofocus
          placeholder="Tên thân thương của bạn"
        />
      </div>
      <fieldset class="rsvp-options">
        <legend>Bạn là khách của <span aria-hidden="true">*</span></legend>
        <div>
          <label :class="{ selected: form.guestSide === 'BRIDE' }"
            ><input
              v-model="form.guestSide"
              type="radio"
              name="guestSide"
              value="BRIDE"
              required
            />Nhà gái</label
          >
          <label :class="{ selected: form.guestSide === 'GROOM' }"
            ><input
              v-model="form.guestSide"
              type="radio"
              name="guestSide"
              value="GROOM"
              required
            />Nhà trai</label
          >
        </div>
      </fieldset>
      <fieldset class="rsvp-options">
        <legend>
          Bạn sẽ đến chung vui chứ? <span aria-hidden="true">*</span>
        </legend>
        <div>
          <label :class="{ selected: form.attendance === 'YES' }"
            ><input
              v-model="form.attendance"
              type="radio"
              name="attendance"
              value="YES"
              required
            />Mình sẽ đến</label
          >
          <label :class="{ selected: form.attendance === 'NO' }"
            ><input
              v-model="form.attendance"
              type="radio"
              name="attendance"
              value="NO"
              required
            />Tiếc là không thể</label
          >
        </div>
      </fieldset>
      <div class="rsvp-input-group">
        <label for="rsvp-popup-message"
          >Lời nhắn <small>(không bắt buộc)</small></label
        >
        <textarea
          id="rsvp-popup-message"
          v-model="form.message"
          name="message"
          maxlength="500"
          rows="3"
          placeholder="Gửi đôi lời thương đến chúng mình…"
        ></textarea>
      </div>
      <p id="rsvp-availability" class="rsvp-availability" role="status">
        Xác nhận trực tuyến chưa mở. Bạn vui lòng liên hệ trực tiếp cô dâu hoặc
        chú rể. Thông tin bạn điền chưa được gửi hoặc lưu.
      </p>
      <button
        class="rsvp-submit"
        type="submit"
        disabled
        aria-describedby="rsvp-availability"
      >
        Gửi xác nhận
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M7 17 17 7M7 7h10v10" />
        </svg>
      </button>
    </form>
  </dialog>
</template>

<style scoped>
.rsvp-dialog {
  position: fixed;
  box-sizing: border-box;
  width: min(520px, calc(100vw - 28px));
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  overscroll-behavior: contain;
  margin: auto;
  padding: 0;
  border: 1px solid #ffffffb8;
  border-radius: 24px;
  background: #fbfcf8;
  color: #465640;
  box-shadow: 0 24px 100px #16231340;
  font:
    13px/1.6 system-ui,
    sans-serif;
}
.rsvp-dialog::backdrop {
  background: #1d281f80;
  backdrop-filter: blur(8px);
}
.rsvp-dialog-header {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 28px 44px 20px;
  background: #fbfcf8f5;
  text-align: center;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}
.rsvp-dialog .rsvp-dialog-close {
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
  background: transparent;
  color: #465640;
  font:
    26px/1 system-ui,
    sans-serif;
  cursor: pointer;
}
.rsvp-dialog-eyebrow {
  margin: 0 0 10px;
  color: #627058;
  font-size: 8px;
  letter-spacing: 0.17em;
}
.rsvp-dialog h2 {
  margin: 0;
  font:
    400 clamp(24px, 6vw, 30px)/1.3 Georgia,
    serif;
}
.rsvp-dialog-header > p:last-child {
  margin: 10px 0 0;
  color: #627058;
  font-size: 12px;
}
.rsvp-dialog-form {
  display: grid;
  gap: 20px;
  padding: 0 24px 24px;
}
.rsvp-input-group {
  display: grid;
  gap: 8px;
}
.rsvp-input-group > label,
.rsvp-options legend {
  font-size: 12px;
  font-weight: 500;
}
.rsvp-input-group small {
  font-size: 10px;
  font-weight: 400;
  color: #627058;
}
.rsvp-dialog input[type='text'],
.rsvp-dialog textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 46px;
  padding: 12px 14px;
  border: 1px solid #d9e1d3;
  border-radius: 12px;
  background: #fff;
  color: #35432f;
  font:
    16px/1.5 system-ui,
    sans-serif;
}
.rsvp-dialog textarea {
  resize: vertical;
  min-height: 88px;
}
.rsvp-dialog input::placeholder,
.rsvp-dialog textarea::placeholder {
  color: #68765e;
  font-size: 12px;
}
.rsvp-options {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.rsvp-options legend {
  margin: 0 0 8px;
  padding: 0;
}
.rsvp-options > div {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.rsvp-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 10px;
  border: 1px solid #d9e1d3;
  border-radius: 12px;
  background: #fff;
  color: #66745b;
  font-size: 11px;
  cursor: pointer;
}
.rsvp-options label.selected {
  border-color: #7c916c;
  background: #edf3e7;
  color: #405737;
}
.rsvp-options input {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: #667f54;
}
.rsvp-availability {
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: #eef1e9;
  color: #627058;
  font-size: 11px;
  line-height: 1.7;
}
.rsvp-dialog .rsvp-submit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 12px 18px;
  border: 0;
  border-radius: 999px;
  background: #66735b;
  color: #fff;
  font:
    13px/1.4 system-ui,
    sans-serif;
}
.rsvp-dialog .rsvp-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.rsvp-dialog :focus-visible {
  outline: 2px solid #627c50;
  outline-offset: 3px;
}
@media (max-width: 359px) {
  .rsvp-dialog-form {
    padding-inline: 16px;
  }
  .rsvp-options > div {
    gap: 6px;
  }
  .rsvp-options label {
    padding: 8px;
    font-size: 10px;
  }
}
</style>

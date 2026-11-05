<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import {
  getRsvpAvailability,
  RsvpApiError,
  sendRsvp,
} from '../../services/rsvpApi'
import type { Attendance, GuestSide } from '../../types/rsvp'

const props = withDefaults(
  defineProps<{
    side?: GuestSide
  }>(),
  {
    side: undefined,
  },
)

const dialog = ref<HTMLDialogElement | null>(null)
const formElement = ref<HTMLFormElement | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)
const successNotice = ref<HTMLParagraphElement | null>(null)
const form = reactive({
  guestName: '',
  guestSide: (props.side || '') as GuestSide | '',
  attendance: '' as Attendance | '',
  message: '',
  website: '',
})
const availability = ref<'checking' | 'ready' | 'unavailable'>('unavailable')
const checking = ref(false)
const submission = ref<'idle' | 'sending' | 'success' | 'error'>('idle')
const attemptedSubmission = ref(false)
const errorMessage = ref('')
const locked = computed(
  () => submission.value === 'sending' || submission.value === 'success',
)
let submissionId: string | undefined
let memoryClientId: string | undefined

function createUuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function getClientId(): string {
  if (memoryClientId) return memoryClientId
  try {
    const stored = localStorage.getItem('wedding-rsvp-client-id')
    if (
      stored &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        stored,
      )
    ) {
      memoryClientId = stored
      return stored
    }
  } catch {
    // Private browsing may block local storage. Keep only the device ID in memory.
  }
  memoryClientId = createUuid()
  try {
    localStorage.setItem('wedding-rsvp-client-id', memoryClientId)
  } catch {
    // The form and all guest data remain in page memory.
  }
  return memoryClientId
}

watch(
  form,
  () => {
    nameInput.value?.setCustomValidity('')
    if (submission.value === 'error') {
      submissionId = undefined
      submission.value = 'idle'
      errorMessage.value = ''
    }
  },
  { flush: 'sync' },
)

async function checkAvailability() {
  if (checking.value) return
  checking.value = true
  availability.value = 'checking'
  try {
    availability.value = (await getRsvpAvailability()) ? 'ready' : 'unavailable'
  } catch {
    availability.value = 'unavailable'
  } finally {
    checking.value = false
  }
}

watch(
  () => props.side,
  (newSide) => {
    if (newSide) {
      form.guestSide = newSide
    }
  },
  { immediate: true },
)

function open() {
  if (!dialog.value || dialog.value.open) return
  if (props.side) {
    form.guestSide = props.side
  }
  dialog.value.showModal()
  void checkAvailability()
}

async function submit() {
  if (locked.value || availability.value !== 'ready') return
  const guestName = form.guestName.trim()
  nameInput.value?.setCustomValidity(
    guestName.length < 2 || guestName.length > 100
      ? 'Bạn vui lòng nhập họ tên từ 2 đến 100 ký tự.'
      : '',
  )
  if (!formElement.value?.reportValidity()) return
  if (!form.guestSide || !form.attendance || form.message.length > 500) return

  submission.value = 'sending'
  errorMessage.value = ''
  try {
    submissionId ??= createUuid()
    const input = {
      submissionId,
      clientId: getClientId(),
      guestName,
      guestSide: form.guestSide,
      attendance: form.attendance,
      message: form.message,
      website: form.website,
    }
    attemptedSubmission.value = true
    await sendRsvp(input)
    submission.value = 'success'
    await nextTick()
    if (dialog.value?.open) successNotice.value?.focus()
  } catch (error) {
    submission.value = 'error'
    if (error instanceof RsvpApiError && error.code === 'RSVP_NOT_CONFIGURED') {
      availability.value = 'unavailable'
    }
    errorMessage.value =
      error instanceof RsvpApiError &&
      ['INVALID_RSVP', 'INVALID_JSON', 'PAYLOAD_TOO_LARGE'].includes(error.code)
        ? 'Thông tin chưa hợp lệ. Bạn vui lòng kiểm tra họ tên và lời nhắn rồi gửi lại.'
        : 'Chưa xác nhận được kết quả gửi. Bạn vui lòng thử lại. Thông tin đã điền vẫn được giữ.'
  }
}

async function newResponse() {
  submission.value = 'idle'
  submissionId = undefined
  attemptedSubmission.value = false
  errorMessage.value = ''
  Object.assign(form, {
    guestName: '',
    guestSide: props.side || '',
    attendance: '',
    message: '',
    website: '',
  })
  await nextTick()
  if (dialog.value?.open) nameInput.value?.focus()
}
defineExpose({ open })
</script>

<template>
  <dialog
    ref="dialog"
    class="rsvp-dialog"
    aria-labelledby="rsvp-dialog-title"
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
      <h2 id="rsvp-dialog-title">Xác nhận tham dự</h2>
    </header>
    <form
      ref="formElement"
      class="rsvp-dialog-form"
      :aria-busy="submission === 'sending'"
      @submit.prevent="submit"
    >
      <div v-if="props.side" class="rsvp-side-indicator">
        <span class="rsvp-side-tag">
          {{ props.side === 'BRIDE' ? 'Nhà gái' : 'Nhà trai' }}
        </span>
      </div>
      <div class="rsvp-input-group">
        <label for="rsvp-popup-name"
          >Họ và tên <span aria-hidden="true">*</span></label
        >
        <input
          id="rsvp-popup-name"
          ref="nameInput"
          v-model="form.guestName"
          name="guestName"
          type="text"
          autocomplete="name"
          minlength="2"
          maxlength="100"
          required
          autofocus
          :disabled="locked"
          placeholder="Tên của bạn"
        />
      </div>
      <fieldset v-if="!props.side" class="rsvp-options" :disabled="locked">
        <legend>Khách của <span aria-hidden="true">*</span></legend>
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
      <fieldset class="rsvp-options" :disabled="locked">
        <legend>
          Tham dự <span aria-hidden="true">*</span>
        </legend>
        <div>
          <label :class="{ selected: form.attendance === 'YES' }"
            ><input
              v-model="form.attendance"
              type="radio"
              name="attendance"
              value="YES"
              required
            />Sẽ tham dự</label
          >
          <label :class="{ selected: form.attendance === 'NO' }"
            ><input
              v-model="form.attendance"
              type="radio"
              name="attendance"
              value="NO"
              required
            />Không thể đến</label
          >
        </div>
      </fieldset>
      <input
        v-model="form.website"
        type="text"
        name="website"
        tabindex="-1"
        autocomplete="off"
        aria-hidden="true"
        hidden
        :disabled="locked"
      />
      <p
        v-if="submission === 'success'"
        id="rsvp-availability"
        ref="successNotice"
        class="rsvp-availability"
        role="status"
        tabindex="-1"
      >
        Đã gửi xác nhận thành công. Cảm ơn bạn!
      </p>
      <p
        v-else-if="submission === 'sending'"
        id="rsvp-availability"
        class="rsvp-availability"
        role="status"
      >
        Đang gửi xác nhận…
      </p>
      <p
        v-else-if="availability === 'checking'"
        id="rsvp-availability"
        class="rsvp-availability"
        role="status"
      >
        Đang kiểm tra kết nối…
      </p>
      <p
        v-else-if="availability !== 'ready'"
        id="rsvp-availability"
        class="rsvp-availability"
        role="status"
      >
        Xác nhận trực tuyến chưa mở. Bạn vui lòng liên hệ trực tiếp gia đình.
      </p>
      <p v-if="errorMessage" class="rsvp-availability rsvp-error" role="alert">
        {{ errorMessage }}
      </p>
      <button
        v-if="availability === 'unavailable' && !locked"
        class="rsvp-retry"
        type="button"
        @click="checkAvailability"
      >
        Kiểm tra lại
      </button>
      <button
        class="rsvp-submit"
        type="submit"
        :disabled="availability !== 'ready' || locked"
        :aria-describedby="
          availability !== 'ready' || locked ? 'rsvp-availability' : undefined
        "
      >
        <span>
          {{
            submission === 'sending'
              ? 'Đang gửi…'
              : submission === 'success'
                ? 'Đã gửi xác nhận'
                : submission === 'error'
                  ? 'Thử gửi lại'
                  : 'Gửi xác nhận'
          }}
        </span>
        <svg
          class="rsvp-submit-icon"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      </button>
      <button
        v-if="submission === 'success'"
        class="rsvp-retry"
        type="button"
        @click="newResponse"
      >
        Gửi xác nhận mới
      </button>
    </form>
  </dialog>
</template>

<style scoped>
.rsvp-dialog {
  position: fixed;
  box-sizing: border-box;
  top: max(20px, env(safe-area-inset-top, 20px));
  bottom: auto;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: min(340px, calc(100vw - 48px));
  max-height: calc(100dvh - 36px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0;
  border: 1px solid #ffffffb8;
  border-radius: 20px;
  background: var(--theme-canvas-bg, #fbfcf8);
  color: var(--theme-accent, #465640);
  box-shadow: 0 20px 60px #16231340;
  font:
    13px/1.4 system-ui,
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
  padding: 14px 44px 10px;
  background: var(--theme-canvas-bg, #fbfcf8f5);
  text-align: center;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}
.rsvp-dialog .rsvp-dialog-close {
  position: absolute;
  top: 4px;
  right: 6px;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--theme-primary, #465640);
  font:
    24px/1 system-ui,
    sans-serif;
  cursor: pointer;
}
.rsvp-dialog h2 {
  margin: 0;
  font:
    600 clamp(18px, 4.5vw, 22px)/1.2 Georgia,
    serif;
}
.rsvp-dialog-form {
  display: grid;
  gap: 12px;
  padding: 0 16px 16px;
}
.rsvp-input-group {
  display: grid;
  gap: 4px;
}
.rsvp-input-group > label,
.rsvp-options legend {
  font-size: 13px;
  font-weight: 500;
}
.rsvp-dialog input[type='text'] {
  box-sizing: border-box;
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid #d9e1d3;
  border-radius: 10px;
  background: #fff;
  color: #35432f;
  font:
    15px/1.4 system-ui,
    sans-serif;
}
.rsvp-dialog input::placeholder {
  color: #68765e;
  font-size: 13px;
}
.rsvp-options {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.rsvp-options legend {
  margin: 0 0 4px;
  padding: 0;
}
.rsvp-options > div {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.rsvp-options label {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 6px 10px;
  border: 1px solid #d9e1d3;
  border-radius: 10px;
  background: #fff;
  color: #66745b;
  font-size: 13px;
  cursor: pointer;
}
.rsvp-options label.selected {
  border-color: var(--theme-primary, #7c916c);
  background: var(--theme-outer-bg, #edf3e7);
  color: var(--theme-accent, #405737);
  font-weight: 500;
}
.rsvp-options input {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--theme-primary, #667f54);
}
.rsvp-side-indicator {
  display: flex;
  align-items: center;
  margin: 2px 0 0;
}
.rsvp-side-tag {
  display: inline-flex;
  align-items: center;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--theme-outer-bg, #edf3e7);
  color: var(--theme-accent, #334d2c);
  border: 1px solid var(--theme-primary, #7c916c);
}
.rsvp-availability {
  margin: 0;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--theme-outer-bg, #eef1e9);
  color: var(--theme-accent, #627058);
  font-size: 12px;
  line-height: 1.5;
}
.rsvp-error {
  background: #f8ece8;
  color: #7a3d2d;
}
.rsvp-retry {
  justify-self: center;
  min-height: 38px;
  padding: 6px 12px;
  border: 1px solid var(--theme-primary, #aebba3);
  border-radius: 999px;
  background: transparent;
  color: var(--theme-accent, #405737);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.rsvp-dialog input:disabled {
  opacity: 0.8;
}
.rsvp-dialog .rsvp-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 10px 16px;
  border: 0;
  border-radius: 999px;
  background: var(--theme-primary, #66735b);
  color: #fff;
  font:
    500 13px/1.4 system-ui,
    sans-serif;
  cursor: pointer;
}
.rsvp-submit-icon {
  flex-shrink: 0;
  transition: transform 0.15s ease;
}
.rsvp-dialog .rsvp-submit:hover:not(:disabled) .rsvp-submit-icon {
  transform: translate(2px, -2px);
}
.rsvp-dialog .rsvp-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.rsvp-dialog :focus-visible {
  outline: 2px solid var(--theme-primary, #627c50);
  outline-offset: 2px;
}
@media (max-width: 359px) {
  .rsvp-dialog-form {
    padding-inline: 12px;
  }
  .rsvp-options > div {
    gap: 6px;
  }
  .rsvp-options label {
    padding: 6px 8px;
    font-size: 12px;
  }
}
</style>

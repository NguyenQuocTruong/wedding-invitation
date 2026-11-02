<script setup lang="ts">
import { onUnmounted, reactive, ref } from 'vue'
import type { Attendance, GuestSide } from '../../types/rsvp'
const form = reactive({
  guestName: '',
  guestSide: '' as GuestSide | '',
  attendance: '' as Attendance | '',
  message: '',
})
const state = ref<'idle' | 'sending' | 'success'>('idle')
const error = ref('')
let timer: ReturnType<typeof setTimeout> | undefined
function submit() {
  if (!form.guestName.trim() || !form.guestSide || !form.attendance) {
    error.value =
      'Bạn vui lòng điền tên, chọn nhà gái/nhà trai và phản hồi tham dự.'
    return
  }
  error.value = ''
  state.value = 'sending'
  timer = setTimeout(() => {
    state.value = 'success'
  }, 600)
}
onUnmounted(() => clearTimeout(timer))
</script>
<template>
  <section
    id="rsvp"
    class="preview-section rsvp-section"
    data-reveal
    aria-labelledby="rsvp-title"
  >
    <div class="rsvp-copy">
      <p class="eyebrow">HẸN GẶP BẠN NHÉ</p>
      <h2 id="rsvp-title">Có bạn,<br /><em>niềm vui trọn vẹn.</em></h2>
      <p>
        Cho chúng mình biết lời hẹn của bạn.<br />Một dòng nhắn cũng đủ làm ngày
        vui thêm ấm.
      </p>
      <span class="rsvp-flower" aria-hidden="true">✳︎</span>
      <p class="demo-label">DEMO · Không ghi nhận đăng ký thật</p>
    </div>
    <form class="rsvp-form" @submit.prevent="submit">
      <p v-if="state === 'success'" class="mock-success" role="status">
        Đã hoàn tất mô phỏng! Đây là demo; bạn chưa đăng ký tham dự thật và
        không có dữ liệu được gửi hoặc lưu.
      </p>
      <fieldset
        :disabled="state === 'sending' || state === 'success'"
        class="form-fields"
      >
        <legend class="sr-only">Thông tin phản hồi demo</legend>
        <label for="guest-name"
          >Họ và tên <span aria-hidden="true">*</span></label
        ><input
          id="guest-name"
          v-model="form.guestName"
          name="guestName"
          autocomplete="name"
          minlength="2"
          maxlength="100"
          required
          placeholder="Tên thân thương của bạn"
        />
        <fieldset class="radio-group">
          <legend>Bạn là khách của <span aria-hidden="true">*</span></legend>
          <div>
            <label
              ><input
                v-model="form.guestSide"
                type="radio"
                name="guestSide"
                value="BRIDE"
                required
              />
              Nhà gái</label
            ><label
              ><input
                v-model="form.guestSide"
                type="radio"
                name="guestSide"
                value="GROOM"
                required
              />
              Nhà trai</label
            >
          </div>
        </fieldset>
        <fieldset class="radio-group">
          <legend>
            Bạn sẽ đến chung vui chứ? <span aria-hidden="true">*</span>
          </legend>
          <div>
            <label
              ><input
                v-model="form.attendance"
                type="radio"
                name="attendance"
                value="YES"
                required
              />
              Mình sẽ đến</label
            ><label
              ><input
                v-model="form.attendance"
                type="radio"
                name="attendance"
                value="NO"
                required
              />
              Tiếc là không thể</label
            >
          </div>
        </fieldset>
        <label for="guest-message"
          >Gửi một lời thương <small>(không bắt buộc)</small></label
        ><textarea
          id="guest-message"
          v-model="form.message"
          name="message"
          maxlength="500"
          rows="3"
          placeholder="Lời chúc của bạn…"
        />
        <p class="privacy-copy">
          Bản demo chỉ xử lý trong bộ nhớ trang, không gửi backend và không lưu
          thông tin. Bản chính thức sẽ chỉ dùng RSVP cho việc tổ chức lễ cưới.
        </p>
        <p v-if="error" role="alert">{{ error }}</p>
        <button class="button" type="submit">
          {{ state === 'sending' ? 'Đang mô phỏng…' : 'Gửi phản hồi demo' }}
          <span aria-hidden="true">↗</span>
        </button>
      </fieldset>
      <button
        v-if="state === 'success'"
        class="text-link"
        type="button"
        @click="state = 'idle'"
      >
        Thử lại bản demo
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useInvitation } from '../../composables/useInvitation'
const { event, preview } = useInvitation()
const selected = ref(0)
const dialog = ref<HTMLDialogElement | null>(null)
function open(index: number) {
  selected.value = index
  dialog.value?.showModal()
}
function move(delta: number) {
  selected.value =
    (selected.value + delta + event.photos.length) % event.photos.length
}
async function close() {
  dialog.value?.close()
  await nextTick()
}
</script>
<template>
  <section
    id="gallery"
    class="preview-section gallery-section"
    aria-labelledby="gallery-title"
  >
    <div class="section-heading" data-reveal>
      <p class="eyebrow">NHỮNG ĐIỀU MÌNH MUỐN GIỮ</p>
      <h2 id="gallery-title">
        Thương nhau,<br /><em>qua từng khung hình.</em>
      </h2>
      <p>Một chút dịu dàng. Một chút rạng rỡ. Và thật nhiều thương.</p>
      <small
        v-if="
          preview ||
          event.sampleContent ||
          event.photos.some((photo) => photo.src.startsWith('/design-preview/'))
        "
        class="subtle"
        >Minh họa gốc cho ba nhóm ảnh · Sẽ thay bằng ảnh của hai bạn</small
      >
    </div>
    <p v-if="!event.photos.length" class="section-heading subtle" role="status">
      Album ảnh cưới đang được chuẩn bị. Hẹn bạn những khoảnh khắc thật đẹp.
    </p>
    <div v-else class="gallery-grid">
      <figure
        v-for="(photo, index) in event.photos"
        :key="photo.src"
        :class="[
          'gallery-item',
          photo.group === 'red' ? 'gallery-red' : '',
          'gallery-item-' + index,
        ]"
        data-reveal
      >
        <div v-if="photo.group === 'red'" class="red-heading">
          <p class="eyebrow">MỘT NÉT VIỆT</p>
          <h3>Sắc son, lời hẹn.</h3>
          <p>Giữ nét truyền thống trong câu chuyện của chúng mình.</p>
        </div>
        <button
          type="button"
          :aria-label="'Xem ảnh: ' + photo.label"
          @click="open(index)"
        >
          <img
            :src="photo.src"
            :alt="photo.alt"
            width="800"
            height="1000"
            loading="lazy"
            decoding="async"
          /><span class="image-expand" aria-hidden="true">↗</span>
        </button>
        <figcaption>
          <span>0{{ index + 1 }}</span
          >{{ photo.label }}
        </figcaption>
      </figure>
    </div>
    <dialog
      v-if="event.photos.length"
      ref="dialog"
      class="photo-dialog"
      aria-label="Xem ảnh lớn"
      @click="$event.target === dialog && close()"
      @keydown.left="move(-1)"
      @keydown.right="move(1)"
    >
      <div class="dialog-content">
        <button
          class="dialog-close"
          type="button"
          autofocus
          aria-label="Đóng ảnh"
          @click="close"
        >
          ×</button
        ><img
          :src="event.photos[selected]!.src"
          :alt="event.photos[selected]!.alt"
          width="800"
          height="1000"
        />
        <div class="dialog-controls">
          <button type="button" aria-label="Ảnh trước" @click="move(-1)">
            ←</button
          ><span>{{ selected + 1 }} / {{ event.photos.length }}</span
          ><button type="button" aria-label="Ảnh sau" @click="move(1)">
            →
          </button>
        </div>
      </div>
    </dialog>
  </section>
</template>

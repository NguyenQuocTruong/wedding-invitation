import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import { previewMotion } from '../config/theme'
export function useReveal(root: Ref<HTMLElement | null>) {
  let observer: IntersectionObserver | undefined
  onMounted(() => {
    if (
      !previewMotion.enabled ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    )
      return
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-wait')
            observer?.unobserve(entry.target)
          }
      },
      { threshold: 0.08 },
    )
    watch(
      root,
      (elementRoot) => {
        observer?.disconnect()
        elementRoot
          ?.querySelectorAll<HTMLElement>('[data-reveal]')
          .forEach((element, index) => {
            element.style.setProperty('--reveal-delay', `${(index % 3) * 80}ms`)
            element.classList.add('reveal-wait')
            observer?.observe(element)
          })
      },
      { immediate: true, flush: 'post' },
    )
  })
  onUnmounted(() => observer?.disconnect())
}

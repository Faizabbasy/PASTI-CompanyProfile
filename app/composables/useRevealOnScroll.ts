import type { Ref } from 'vue'

/**
 * Toggles `.is-visible` on a template ref once it enters the viewport,
 * pairing with the `.reveal-up` utility in main.css.
 */
export function useRevealOnScroll(target: Ref<HTMLElement | null>, options?: IntersectionObserverInit) {
  onMounted(() => {
    if (!target.value) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.2, ...options }
    )

    observer.observe(target.value)

    onBeforeUnmount(() => observer.disconnect())
  })
}

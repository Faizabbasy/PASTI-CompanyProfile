import gsap from 'gsap'
import type { Ref } from 'vue'

/**
 * Shared entrance for /matrix sections — "fill-up": every `[data-fr]`
 * rises into view like a stock level filling its bin (clip from the bottom
 * edge up, expo-out). Deliberately different from FAST / DORA's left →
 * right "schedule-in" (useFastReveal) so MATRIX reads as its own product.
 * `[data-fr="fade"]` (small text) just fades. Fires once; clip-path is
 * cleared afterwards. IntersectionObserver, no scroll handler. Lite devices
 * (`html[data-lite]`) get opacity only. Reduced motion: nothing hidden.
 *
 * No translate is applied, so the clipped start state never leaves its
 * container (the zero-size-rect IntersectionObserver trap that hit
 * useFastReveal on items flush with an overflow-hidden edge).
 */
export function useMatrixReveal(root: Ref<HTMLElement | null>) {
  useGsapContext(() => {
    const el = root.value
    if (!el || window.matchMedia(reducedMotionQuery.reduce).matches) return
    const items = [...el.querySelectorAll<HTMLElement>('[data-fr]')]
    if (!items.length) return
    const lite = document.documentElement.dataset.lite === 'true'
    const isFade = (e: HTMLElement) => lite || e.dataset.fr === 'fade'
    gsap.set(items.filter(isFade), { autoAlpha: 0 })
    gsap.set(items.filter((e) => !isFade(e)), { clipPath: 'inset(100% 0% 0% 0%)' })

    let queue: HTMLElement[] = []
    let scheduled = false
    const flush = () => {
      scheduled = false
      const group = queue
      queue = []
      const blocks = group.filter((e) => !isFade(e))
      const fades = group.filter(isFade)
      if (blocks.length) gsap.to(blocks, { clipPath: 'inset(0% 0% 0% 0%)', duration: motionTier.cinematicMin, ease: approvedEase.gsapCinematic, stagger: 0.07, overwrite: 'auto', clearProps: 'clipPath' })
      if (fades.length) gsap.to(fades, { autoAlpha: 1, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.05, overwrite: 'auto' })
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          io.unobserve(entry.target)
          queue.push(entry.target as HTMLElement)
        }
        if (queue.length && !scheduled) {
          scheduled = true
          requestAnimationFrame(flush)
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    )
    items.forEach((i) => io.observe(i))
    return () => io.disconnect()
  })
}

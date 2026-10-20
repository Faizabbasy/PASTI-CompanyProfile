import gsap from 'gsap'
import type { Ref } from 'vue'

/**
 * Shared entrance for /fast sections — "schedule-in": every `[data-fr]` is
 * placed like an operation block on a timeline, unclipping left → right
 * with a short slide (expo-out), instead of a generic fade-up.
 * `[data-fr="fade"]` (small text) just fades. Fires once; clip-path is
 * cleared afterwards so nothing keeps a paint cost.
 *
 * Performance (2026-10-19): driven by IntersectionObserver, not
 * ScrollTrigger — the browser computes visibility off the scroll path, so
 * there is no per-scroll JavaScript for these ~100 elements. Elements that
 * enter together are staggered as one group. Lite devices (phones, low-end
 * machines — `html[data-lite]`) get an opacity-only entrance: no clip-path,
 * so no per-frame repaint. Reduced motion: nothing hidden.
 */
export function useFastReveal(root: Ref<HTMLElement | null>) {
  useGsapContext(() => {
    const el = root.value
    if (!el || window.matchMedia(reducedMotionQuery.reduce).matches) return
    const items = [...el.querySelectorAll<HTMLElement>('[data-fr]')]
    if (!items.length) return
    const lite = document.documentElement.dataset.lite === 'true'
    const isFade = (e: HTMLElement) => lite || e.dataset.fr === 'fade'
    gsap.set(items.filter(isFade), { autoAlpha: 0 })
    gsap.set(items.filter((e) => !isFade(e)), { clipPath: 'inset(0% 100% 0% 0%)', x: -16 })

    let queue: HTMLElement[] = []
    let scheduled = false
    const flush = () => {
      scheduled = false
      const group = queue
      queue = []
      const blocks = group.filter((e) => !isFade(e))
      const fades = group.filter(isFade)
      if (blocks.length) gsap.to(blocks, { clipPath: 'inset(0% 0% 0% 0%)', x: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapCinematic, stagger: 0.06, overwrite: 'auto', clearProps: 'clipPath,transform' })
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

/** One-shot "in view" callback via IntersectionObserver (no scroll handler). */
export function onceInView(el: Element, fn: () => void, rootMargin = '0px 0px -15% 0px') {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect()
        fn()
      }
    },
    { rootMargin }
  )
  io.observe(el)
  return () => io.disconnect()
}

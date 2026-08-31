import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Ref } from 'vue'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

interface CountUpOptions {
  /** Numeric target to count up to (the non-numeric suffix, e.g. "+"/"M+", is handled separately by the caller). */
  value: number
  duration?: number
  /** Formats the tweened number for display each frame (e.g. to add thousands separators). Defaults to Math.round. */
  format?: (n: number) => string
}

/**
 * Animates a counter element's text content from 0 up to `value` as it enters
 * the viewport, replaying each time per the same toggleActions pattern as
 * useScrollReveal/useMaskedReveal (see those files for why: replay on repeated
 * scroll in/out, not just once).
 */
export function useCountUp(target: Ref<HTMLElement | null>, options: CountUpOptions) {
  if (!import.meta.client) return

  const { value, duration = 3.2, format = (n: number) => Math.round(n).toString() } = options

  onMounted(() => {
    const el = target.value
    if (!el) return

    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const counter = { n: 0 }
      el.textContent = format(0)

      const anim = gsap.to(counter, {
        n: value,
        duration,
        ease: 'sine.out',
        onUpdate: () => {
          el.textContent = format(counter.n)
        },
        onReverseComplete: () => {
          el.textContent = format(0)
        },
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'restart none restart reverse' }
      })

      return () => anim.kill()
    })

    mm.add('(prefers-reduced-motion: reduce)', () => {
      el.textContent = format(value)
    })

    onBeforeUnmount(() => mm.revert())
  })
}

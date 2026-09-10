import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Ref } from 'vue'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

export type DepthTier = 'foreground' | 'mid' | 'back'

/** Parallax rate relative to natural scroll — 1.0 moves with scroll, lower
 * values lag behind it, reading as "further away". Centralized here so no
 * call site hardcodes its own ratio (see LARGE_SCALE_MOTION_PLAN.md). */
const TIER_RATE: Record<DepthTier, number> = {
  foreground: 1,
  mid: 0.875,
  back: 0.675
}

interface DepthParallaxOptions {
  /** Scroll distance (px) the tier's full-strength offset is reached over.
   *  Defaults to one viewport height. */
  distance?: number
}

/**
 * Scrubs `el` at a depth-tier parallax rate relative to natural scroll,
 * via a translateY offset proportional to (1 - rate) — a `back` element
 * lags behind scroll, reading as sitting further away. `foreground` is a
 * no-op (rate 1.0 is identical to unparallaxed scroll).
 *
 * Mobile gets reveal-on-enter instead of continuous parallax (per the
 * global mobile-adaptation rule — art-directed, not merely disabled), and
 * reduced-motion freezes the layer in its resting position.
 */
export function useDepthParallax(el: Ref<HTMLElement | null>, tier: DepthTier, options: DepthParallaxOptions = {}) {
  if (!import.meta.client || tier === 'foreground') return

  useGsapContext(() => {
    const target = el.value
    if (!target) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const rate = tier === 'back' ? tabletScaled(TIER_RATE.back, 0.85) : tabletScaled(TIER_RATE.mid, 0.9)

    if (isMobile) {
      gsap.set(target, { opacity: 0, y: 24, scale: 0.97 })
      const trigger = ScrollTrigger.create({
        trigger: target,
        start: 'top 85%',
        once: true,
        onEnter: () => gsap.to(target, { opacity: 1, y: 0, scale: 1, duration: motionDuration.editorial, ease: motionEase.standard })
      })
      return () => trigger.kill()
    }

    const distance = options.distance ?? window.innerHeight
    const lagPx = distance * (1 - rate)

    const trigger = ScrollTrigger.create({
      trigger: target,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        gsap.set(target, { y: -lagPx * (self.progress - 0.5) })
      }
    })

    return () => trigger.kill()
  })
}

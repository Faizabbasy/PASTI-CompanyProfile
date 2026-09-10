import gsap from 'gsap'
import type { ScrollCallback } from 'lenis'
import type { Ref } from 'vue'

interface ScrollVelocitySkewOptions {
  /** Max skew in degrees at top scroll speed. Clamped, per the "restrained
   *  0.5-2deg" ceiling — this is a texture, not a distortion effect. */
  maxSkew?: number
}

/**
 * Reads Lenis's own per-frame scroll velocity (exposed on its 'scroll'
 * event, already running via useLenis at the app root — this does not
 * start a second instance or a second RAF loop) and applies a tiny,
 * clamped skew to `target` that eases back to 0 the moment scrolling
 * slows or stops. Media-only effect: never wire this to text or layout-
 * bearing elements, only decorative/media transforms.
 *
 * No-op under prefers-reduced-motion, and a no-op if Lenis never started
 * (reduced-motion also disables useLenis itself).
 */
export function useScrollVelocitySkew(target: Ref<HTMLElement | null>, options: ScrollVelocitySkewOptions = {}) {
  if (!import.meta.client) return

  const { maxSkew = 1.5 } = options

  onMounted(() => {
    const el = target.value
    if (!el) return
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return

    const lenis = getLenisInstance()
    if (!lenis) return

    const skewTo = gsap.quickTo(el, 'skewY', { duration: motionDuration.medium, ease: motionEase.standard })
    let resetTimer: ReturnType<typeof setTimeout> | undefined

    const handleScroll: ScrollCallback = (instance) => {
      // Lenis velocity is roughly px/frame; normalize and clamp rather than
      // chase its raw scale, which varies with wheel/trackpad input.
      const normalized = gsap.utils.clamp(-1, 1, instance.velocity / 12)
      skewTo(normalized * maxSkew)

      clearTimeout(resetTimer)
      resetTimer = setTimeout(() => skewTo(0), 120)
    }

    lenis.on('scroll', handleScroll)

    onBeforeUnmount(() => {
      clearTimeout(resetTimer)
      lenis.off('scroll', handleScroll)
    })
  })
}

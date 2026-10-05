import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

let lenis: Lenis | undefined
let started = false

/**
 * Starts a single shared Lenis instance synced to GSAP's ticker, matching
 * Cuberto's own <html class="lenis"> smooth-scroll setup (confirmed via
 * live-site DOM probe). Module-level singleton: calling this from multiple
 * components only starts the loop once. Disabled under
 * prefers-reduced-motion so reduced-motion users get native instant scroll.
 */
export function useLenis() {
  if (!import.meta.client || started) return
  started = true

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  lenis = new Lenis({
    autoRaf: false,
    duration: 0.9,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    wheelMultiplier: 1,
    // Touch stays 100% native (owner request 2026-10-05): with syncTouch the
    // finger's scroll was eased and fought the horizontal snap rails on
    // phones. Wheel/trackpad smoothing on desktop is unchanged.
    syncTouch: false
  })

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  document.documentElement.classList.add('lenis')
}

/**
 * Read-only access to the shared Lenis instance, for composables that need
 * to subscribe to its 'scroll' event (e.g. useScrollVelocitySkew) without
 * starting a second instance. Returns undefined if Lenis hasn't started
 * (prefers-reduced-motion, or called before useLenis()).
 */
export function getLenisInstance() {
  return lenis
}

/**
 * Jumps to a target with no scroll animation — used by useSectionCurtain to
 * reposition the page while a full-screen panel hides the viewport, so the
 * jump itself is never seen. Falls back to native scrollIntoView when Lenis
 * hasn't started (prefers-reduced-motion, or called before useLenis()).
 */
export function scrollToImmediate(target: string) {
  if (!import.meta.client) return

  // `y:<px>` targets an absolute scroll position — used when the
  // destination lives inside a pinned stage (Hero's project gallery), where
  // no element has a meaningful document offset of its own.
  if (target.startsWith('y:')) {
    const y = Number(target.slice(2))
    if (lenis) lenis.scrollTo(y, { immediate: true })
    else window.scrollTo({ top: y, behavior: 'auto' })
    return
  }

  if (lenis) {
    lenis.scrollTo(target, { immediate: true })
    return
  }

  document.querySelector(target)?.scrollIntoView({ behavior: 'auto', block: 'start' })
}

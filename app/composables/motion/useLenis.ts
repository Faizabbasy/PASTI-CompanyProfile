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
    duration: 1.3,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    smoothWheel: true,
    wheelMultiplier: 1
  })

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  document.documentElement.classList.add('lenis')
}

/**
 * Jumps to a target with no scroll animation — used by useSectionCurtain to
 * reposition the page while a full-screen panel hides the viewport, so the
 * jump itself is never seen. Falls back to native scrollIntoView when Lenis
 * hasn't started (prefers-reduced-motion, or called before useLenis()).
 */
export function scrollToImmediate(target: string) {
  if (!import.meta.client) return

  if (lenis) {
    lenis.scrollTo(target, { immediate: true })
    return
  }

  document.querySelector(target)?.scrollIntoView({ behavior: 'auto', block: 'start' })
}

import gsap from 'gsap'

/**
 * Runs a short "un-reveal" tween on every reveal-tagged element currently
 * in the viewport (data-reveal-el, set by useMaskedReveal/useScrollReveal)
 * before a route change — the reverse motion of how they entered, so a page
 * never just vanishes/snaps when you navigate away. Resolves once the tween
 * finishes so the caller can await it before letting navigation proceed.
 */
export function useLeaveTransition() {
  function playLeave(): Promise<void> {
    if (!import.meta.client) return Promise.resolve()

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return Promise.resolve()
    }

    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal-el]')).filter((el) => {
      const rect = el.getBoundingClientRect()
      const inViewport = rect.bottom > 0 && rect.top < window.innerHeight
      if (!inViewport) return false

      // Elements whose entrance ScrollTrigger hasn't fired yet are already
      // sitting at their hidden from-state — nothing to reverse, so skip
      // them rather than tweening a no-op. Scroll-kind hides via opacity;
      // mask-kind hides via a translateY still present in the transform.
      if (el.dataset.revealKind === 'mask') {
        return gsap.getProperty(el, 'yPercent') === 0
      }
      return getComputedStyle(el).opacity !== '0'
    })

    if (!elements.length) return Promise.resolve()

    const maskEls = elements.filter((el) => el.dataset.revealKind === 'mask')
    const scrollEls = elements.filter((el) => el.dataset.revealKind === 'scroll')

    return new Promise((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve })

      if (maskEls.length) {
        tl.to(maskEls, { yPercent: 120, duration: 0.35, ease: 'power2.in', stagger: 0.015 }, 0)
      }
      if (scrollEls.length) {
        tl.to(scrollEls, { opacity: 0, y: 24, duration: 0.35, ease: 'power2.in', stagger: 0.02 }, 0)
      }
    })
  }

  return { playLeave }
}

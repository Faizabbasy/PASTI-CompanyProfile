import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Ref } from 'vue'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollRevealOptions {
  y?: number
  scale?: number
  stagger?: number
  children?: string
}

/**
 * GSAP/ScrollTrigger equivalent of the CSS-only useRevealOnScroll: fades +
 * rises (and optionally scales) an element, or a group of its children, in
 * once as it enters the viewport. Used for non-text elements (images,
 * cards, logo grids) where useMaskedReveal doesn't apply.
 */
export function useScrollReveal(target: Ref<HTMLElement | null>, options: ScrollRevealOptions = {}) {
  if (!import.meta.client) return

  const { y = 32, scale, stagger = motionStagger.loose, children } = options

  onMounted(() => {
    const el = target.value
    if (!el) return

    const items = children ? Array.from(el.querySelectorAll<HTMLElement>(children)) : [el]
    if (!items.length) return

    for (const item of items) {
      item.dataset.revealEl = ''
      item.dataset.revealKind = 'scroll'
    }

    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const fromVars: gsap.TweenVars = { opacity: 0, y }
      const toVars: gsap.TweenVars = { opacity: 1, y: 0, duration: motionDuration.editorial, ease: motionEase.standard, stagger }

      if (scale) {
        fromVars.scale = scale
        toVars.scale = 1
      }

      gsap.set(items, fromVars)

      const anim = gsap.to(items, {
        ...toVars,
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'restart none restart reverse' }
      })

      return () => anim.kill()
    })

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(items, { opacity: 1, y: 0, scale: 1 })
    })

    onBeforeUnmount(() => mm.revert())
  })
}

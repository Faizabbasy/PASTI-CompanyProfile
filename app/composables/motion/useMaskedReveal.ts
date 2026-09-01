import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Ref } from 'vue'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

interface MaskedRevealOptions {
  by?: 'word' | 'line'
  stagger?: number
  trigger?: boolean
  delay?: number
  /** Adds a blur-to-focus touch on top of the slide-up reveal: each unit starts
   *  softly blurred and sharpens as it settles, instead of just sliding in crisp. */
  blur?: boolean
}

/**
 * Wraps text in the double-span mask structure observed on Cuberto's live
 * site (outer span clips overflow, inner span carries the translateY
 * reveal) and animates each unit in with a stagger. Replaces the
 * line-level clip-path `.animate-reveal` utility as the primary text
 * entrance technique.
 */
export function useMaskedReveal(target: Ref<HTMLElement | null>, options: MaskedRevealOptions = {}) {
  if (!import.meta.client) return

  const { by = 'word', stagger = 0.05, trigger = true, delay = 0, blur = false } = options

  onMounted(() => {
    const el = target.value
    if (!el) return

    const text = el.textContent ?? ''
    const units = by === 'word' ? text.split(/(\s+)/).filter((u) => u.length) : [text]

    el.textContent = ''
    const innerSpans: HTMLSpanElement[] = []

    for (const unit of units) {
      if (/^\s+$/.test(unit)) {
        el.appendChild(document.createTextNode(unit))
        continue
      }
      const outer = document.createElement('span')
      outer.style.overflow = 'clip'
      outer.style.display = 'inline-block'
      outer.style.verticalAlign = 'top'

      const inner = document.createElement('span')
      inner.style.display = 'inline-block'
      inner.textContent = unit
      inner.dataset.revealEl = ''
      inner.dataset.revealKind = 'mask'

      if (blur) {
        // The blur filter's halo extends past the glyphs' sharp edges — a
        // tight clip on `outer` would hard-cut that halo mid-blur and look
        // like a visible seam. Compensating margin/padding (same trick as
        // Hero's wrapWord for descenders) gives the halo room without
        // shifting the settled, unblurred layout.
        outer.style.margin = '-0.15em'
        inner.style.padding = '0.15em'
      }

      outer.appendChild(inner)
      el.appendChild(outer)
      innerSpans.push(inner)
    }

    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(innerSpans, blur ? { yPercent: 120, filter: 'blur(8px)' } : { yPercent: 120 })

      const anim = gsap.to(innerSpans, {
        yPercent: 0,
        ...(blur ? { filter: 'blur(0px)' } : {}),
        duration: 0.8,
        ease: 'power3.out',
        stagger,
        delay,
        scrollTrigger: trigger
          ? { trigger: el, start: 'top 85%', toggleActions: 'restart none restart reverse' }
          : undefined
      })

      return () => anim.kill()
    })

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(innerSpans, blur ? { yPercent: 0, filter: 'blur(0px)' } : { yPercent: 0 })
    })

    onBeforeUnmount(() => mm.revert())
  })
}

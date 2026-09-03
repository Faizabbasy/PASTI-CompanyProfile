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

      // Compensating negative margin on `outer` / positive padding on
      // `inner` (same trick as Hero.vue's wrapWord) — always applied, not
      // just under `blur`. The site's editorial type scale (see
      // tailwind.config.ts `text-display-*`) uses deliberately tight
      // line-heights (1.02-1.15) for headline density; a descender (g, y,
      // p, q, j) on the last word of any masked heading extends past that
      // tight line box and was getting hard-clipped by `outer`'s
      // `overflow: clip` — normal text lets a descender overflow its line
      // box harmlessly, but a clipped inline-block doesn't. Reproduced on
      // /insights' "Ideas worth reading" (the g in "reading" cut off) and
      // is the same underlying bug on every masked-reveal heading site-wide
      // whose last rendered word ends in a descender.
      outer.style.margin = blur ? '-0.15em' : '-0.2em'

      const inner = document.createElement('span')
      inner.style.display = 'inline-block'
      inner.style.padding = blur ? '0.15em' : '0.2em'
      inner.textContent = unit
      inner.dataset.revealEl = ''
      inner.dataset.revealKind = 'mask'

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

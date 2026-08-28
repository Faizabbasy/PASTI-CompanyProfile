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

  const { by = 'word', stagger = 0.05, trigger = true, delay = 0 } = options

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

      outer.appendChild(inner)
      el.appendChild(outer)
      innerSpans.push(inner)
    }

    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(innerSpans, { yPercent: 120 })

      const anim = gsap.to(innerSpans, {
        yPercent: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger,
        delay,
        scrollTrigger: trigger
          ? { trigger: el, start: 'top 85%', once: true }
          : undefined
      })

      return () => anim.kill()
    })

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(innerSpans, { yPercent: 0 })
    })

    onBeforeUnmount(() => mm.revert())
  })
}

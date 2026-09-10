<script setup lang="ts">
import gsap from 'gsap'

// Editorial — Inspired by Mat Voyce's Awwwards Site of the Day: "type-in-
// motion — letters stretch, snap, and recombine, all timeline-driven".
// Unlike this category's ambient 2D loop (HeroBgTwoTypeStretchSnap, a
// uniform per-letter stagger), this is a genuine choreographed performance:
// a single master GSAP timeline scripted letter-by-letter with distinct
// eases, hold lengths and stretch axes per glyph — some snap fast on
// scaleY, one lags and skews, the last two recombine as a pair — so it
// reads as a directed sequence, not a repeating pattern. A faint navy
// paper-grain texture sits behind it to ground the type as print, not UI.
const rootRef = ref<HTMLElement | null>(null)
const word = ['I', 'M', 'P', 'A', 'C', 'T']

useGsapContext(() => {
  if (!rootRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const els = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-glyph]'))
  if (!els.length) return

  gsap.set(els, { transformOrigin: '50% 100%' })

  if (prefersReducedMotion) return

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4 })

  // I — quick vertical snap, sharp overshoot
  tl.to(els[0]!, { scaleY: 2.1, duration: 0.3, ease: 'power4.out' }, 0)
  tl.to(els[0]!, { scaleY: 1, duration: 0.7, ease: 'elastic.out(1, 0.35)' }, 0.3)

  // M — wide horizontal stretch, slow deliberate release
  tl.to(els[1]!, { scaleX: 1.8, skewX: -6, duration: 0.55, ease: 'power2.inOut' }, 0.5)
  tl.to(els[1]!, { scaleX: 1, skewX: 0, duration: 1.1, ease: 'power3.out' }, 1.05)

  // P — held compression, long pause, sudden release
  tl.to(els[2]!, { scaleY: 0.35, duration: 0.4, ease: 'power2.in' }, 1.1)
  tl.to(els[2]!, { scaleY: 1, duration: 0.9, ease: 'back.out(2.4)' }, 2.0)

  // A — lagging skew drift, no overshoot, settles late
  tl.to(els[3]!, { skewX: 14, y: -10, duration: 1.3, ease: 'sine.inOut' }, 1.6)
  tl.to(els[3]!, { skewX: 0, y: 0, duration: 1.0, ease: 'power2.out' }, 2.9)

  // C + T recombine as a pair — stretch toward each other, snap apart
  tl.to([els[4]!, els[5]!], {
    scaleX: 1.4,
    duration: 0.5,
    ease: 'power3.in',
    stagger: 0.08
  }, 2.4)
  tl.to([els[4]!, els[5]!], {
    scaleX: 1,
    duration: 0.85,
    ease: 'elastic.out(1, 0.4)',
    stagger: 0.05
  }, 2.9)

  return () => {
    tl.kill()
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg class="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
      <filter id="editorial-type-stretch-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.043  0 0 0 0 0.165  0 0 0 0 0.239  0 0 0 0.6 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#editorial-type-stretch-grain)" />
    </svg>

    <div class="absolute inset-0 flex items-center justify-center">
      <div class="flex select-none font-display font-extrabold leading-none text-navy-900 opacity-[0.08]" style="font-size: 18vw">
        <span
          v-for="(letter, i) in word"
          :key="i"
          data-glyph=""
          class="inline-block"
        >{{ letter }}</span>
      </div>
    </div>
  </div>
</template>

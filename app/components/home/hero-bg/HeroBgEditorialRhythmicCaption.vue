<script setup lang="ts">
import gsap from 'gsap'

// Editorial — Inspired by Uncommon Studio's Awwwards Site of the Day /
// Developer Award technique: "what wins here is rhythm — a confident grid
// that breaks at exactly the right moment". This category's canvas version
// (HeroBgTwoRhythmicGridBreak) displaces grid LINES; this instead applies
// the same disciplined-rhythm idea to actual editorial furniture — a set of
// small uppercase tracked caption labels pinned at fixed magazine-spread
// positions (like photo credits/captions in a print layout). A single GSAP
// timeline moves through them in a fixed, deterministic order — one label
// briefly scales up and brightens to full contrast, holds a beat, settles
// back — like an editor's eye scanning a spread, never simultaneous, never
// randomised.
const rootRef = ref<HTMLElement | null>(null)

const captions = [
  { text: 'FIG. 01 — TECHNOLOGY', x: 6, y: 12 },
  { text: 'N° 24', x: 90, y: 8, align: 'right' },
  { text: 'CREATIVITY / SPREAD', x: 8, y: 88 },
  { text: 'IMPACT — SECTION B', x: 88, y: 92, align: 'right' },
  { text: 'CONT. P. 42', x: 50, y: 6, align: 'center' },
  { text: 'PASTI EDITORIAL', x: 92, y: 50, align: 'right' }
]

useGsapContext(() => {
  if (!rootRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const els = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-caption]'))
  if (!els.length) return

  gsap.set(els, { opacity: 0.18, scale: 1 })

  if (prefersReducedMotion) return

  const tl = gsap.timeline({ repeat: -1 })
  const order = [0, 3, 1, 5, 2, 4] // fixed editorial scan order, not visual order

  order.forEach((idx) => {
    const el = els[idx]!
    tl.to(el, { opacity: 0.9, scale: 1.08, duration: 0.4, ease: 'power2.out' })
    tl.to(el, { opacity: 0.18, scale: 1, duration: 0.6, ease: 'power2.inOut' }, '+=0.5')
  })

  return () => {
    tl.kill()
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <span
      v-for="(c, i) in captions"
      :key="i"
      data-caption=""
      class="absolute select-none whitespace-nowrap font-display text-eyebrow font-semibold uppercase tracking-[0.32em] text-navy-700"
      :class="{
        'text-right': c.align === 'right',
        'text-center': c.align === 'center'
      }"
      :style="{
        left: c.align === 'right' ? 'auto' : `${c.x}%`,
        right: c.align === 'right' ? `${100 - c.x}%` : 'auto',
        top: `${c.y}%`,
        transform: c.align === 'center' ? 'translateX(-50%)' : 'none'
      }"
    >
      {{ c.text }}
    </span>
  </div>
</template>

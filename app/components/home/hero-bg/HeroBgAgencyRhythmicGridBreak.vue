<script setup lang="ts">
import gsap from 'gsap'

// Agency — Inspired by Uncommon Studio's Awwwards-winning discipline: a
// confident structural grid that breaks at exactly the right moment, cut
// like a camera move rather than decorated like a texture. A column/row
// overlay sits still and precise, then on a deliberate GSAP rhythm one
// line snaps to a highlighted offset — hard linear-to-power easing, zero
// elastic/bounce — holds a beat, then snaps back before the next cut.
const rootRef = ref<HTMLElement | null>(null)

const COLS = 7
const ROWS = 5

useGsapContext(() => {
  if (!rootRef.value) return
  const vlines = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-vline]'))
  const hlines = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-hline]'))
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    gsap.set([...vlines, ...hlines], { opacity: 0.14 })
    return
  }

  gsap.set([...vlines, ...hlines], { opacity: 0.1 })

  const allLines = [
    ...vlines.map((el) => ({ el, axis: 'x' as const })),
    ...hlines.map((el) => ({ el, axis: 'y' as const }))
  ]

  const tl = gsap.timeline({ repeat: -1 })

  function cut() {
    const pick = allLines[Math.floor(Math.random() * allLines.length)]!
    const offset = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 8)
    tl.to(pick.el, {
      [pick.axis]: offset,
      opacity: 0.6,
      backgroundColor: '#FBBA00',
      duration: 0.22,
      ease: 'power4.out'
    })
    tl.to(pick.el, {
      [pick.axis]: 0,
      opacity: 0.1,
      backgroundColor: '#0B3954',
      duration: 0.4,
      ease: 'power2.inOut',
      delay: 0.5
    })
    tl.to({}, { duration: 0.9 + Math.random() * 1.2 })
  }

  for (let i = 0; i < 40; i++) cut()

  return () => {
    tl.kill()
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      v-for="i in COLS - 1"
      :key="`v${i}`"
      data-vline=""
      class="absolute top-0 h-full w-px bg-navy-700 will-change-transform"
      :style="{ left: `${(i / COLS) * 100}%` }"
    />
    <div
      v-for="i in ROWS - 1"
      :key="`h${i}`"
      data-hline=""
      class="absolute left-0 w-full h-px bg-navy-700 will-change-transform"
      :style="{ top: `${(i / ROWS) * 100}%` }"
    />
  </div>
</template>

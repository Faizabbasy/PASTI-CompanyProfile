<script setup lang="ts">
import gsap from 'gsap'

// Explore — Lite take on Uncommon Studio's "grid breaks on rhythm". A
// sparse dot grid where dots pulse in a slow, calm left-to-right stagger
// wave — simpler than the flagship pieces (no randomized single-beat
// metronome, no line displacement, just one gentle sweeping wave that
// loops).
const rootRef = ref<HTMLElement | null>(null)
const COLS = 6
const ROWS = 4
const dots = Array.from({ length: COLS * ROWS }, (_, i) => ({
  x: 10 + (i % COLS) * (80 / (COLS - 1)),
  y: 15 + Math.floor(i / COLS) * (70 / (ROWS - 1))
}))

useGsapContext(() => {
  if (!rootRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const dotEls = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-dot]'))
  if (prefersReducedMotion || dotEls.length === 0) return

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 })
  tl.to(dotEls, {
    scale: 1.8,
    opacity: 0.85,
    duration: 0.6,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: 1,
    stagger: { each: 0.08, from: 'start' }
  })

  return () => tl.kill()
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      v-for="(dot, i) in dots"
      :key="i"
      data-dot=""
      class="grid-dot"
      :style="{ left: `${dot.x}%`, top: `${dot.y}%` }"
    />
  </div>
</template>

<style scoped>
.grid-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  border-radius: 9999px;
  opacity: 0.32;
  background: theme(colors.navy.400 / 70%);
  will-change: transform, opacity;
}
</style>

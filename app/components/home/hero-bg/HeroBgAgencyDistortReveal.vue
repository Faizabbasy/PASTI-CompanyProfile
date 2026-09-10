<script setup lang="ts">
import gsap from 'gsap'

// Agency — Distorted grid reveal. A grid of small squares, each starting
// scaled/skewed/rotated randomly (as if "shattered"), animates into a
// perfect aligned grid on load with a long stagger and elastic ease — a
// signature "assembling from chaos" load-in seen on many awarded agency
// sites (usually done to an image; here applied to plain color tiles so
// no image asset is needed). Settles into a very subtle idle shimmer
// where tiles occasionally flicker opacity, like a CRT/pixel-grid texture.
const rootRef = ref<HTMLElement | null>(null)
const COLS = 12
const ROWS = 7

useGsapContext(() => {
  if (!rootRef.value) return
  const tiles = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-tile]'))
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    gsap.set(tiles, { opacity: 0.08, scale: 1, rotate: 0, x: 0, y: 0 })
    return
  }

  gsap.set(tiles, {
    opacity: 0,
    scale: () => 0.3 + Math.random() * 0.5,
    rotate: () => (Math.random() - 0.5) * 90,
    x: () => (Math.random() - 0.5) * 200,
    y: () => (Math.random() - 0.5) * 200
  })

  const tl = gsap.timeline()
  tl.to(tiles, {
    opacity: () => 0.03 + Math.random() * 0.08,
    scale: 1,
    rotate: 0,
    x: 0,
    y: 0,
    duration: 1.4,
    ease: 'elastic.out(1, 0.65)',
    stagger: { each: 0.012, from: 'random' }
  })

  tiles.forEach((tile) => {
    gsap.delayedCall(1.6 + Math.random() * 2, function shimmer() {
      gsap.to(tile, {
        opacity: 0.02 + Math.random() * 0.1,
        duration: 1.5 + Math.random() * 2,
        ease: 'sine.inOut',
        onComplete: () => gsap.delayedCall(1 + Math.random() * 3, shimmer)
      })
    })
  })

  return () => tl.kill()
})
</script>

<template>
  <div
    ref="rootRef"
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 grid overflow-hidden"
    :style="{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }"
  >
    <div
      v-for="i in COLS * ROWS"
      :key="i"
      data-tile=""
      class="m-[2px]"
      :style="{ backgroundColor: i % 7 === 0 ? '#FBBA00' : '#0B3954' }"
    />
  </div>
</template>

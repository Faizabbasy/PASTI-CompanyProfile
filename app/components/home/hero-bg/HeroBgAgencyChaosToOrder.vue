<script setup lang="ts">
import gsap from 'gsap'

// Agency — Chaos-to-order dash field. A scattered field of short line/dash
// marks (like tally strokes) starts at random positions/rotations/scales,
// then animates into a precise radial pattern with a longer, more dramatic
// elastic settle than the boxier grid-tile version elsewhere in this set —
// a more elegant, less rigid take on the "assembling from chaos" load-in.
// Idles afterward with an extremely subtle per-mark shimmer.
const rootRef = ref<HTMLElement | null>(null)
const COUNT = 48
const RADIUS = 34 // vmin, radial resting distance from center

const marks = Array.from({ length: COUNT }, (_, i) => {
  const angle = (i / COUNT) * 360
  return { angle }
})

useGsapContext(() => {
  if (!rootRef.value) return
  const dashes = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-dash]'))
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    gsap.set(dashes, {
      opacity: 0.16,
      x: (i) => Math.cos((marks[i]!.angle * Math.PI) / 180) * RADIUS * 3,
      y: (i) => Math.sin((marks[i]!.angle * Math.PI) / 180) * RADIUS * 3,
      rotate: (i) => marks[i]!.angle,
      scale: 1
    })
    return
  }

  gsap.set(dashes, {
    opacity: 0,
    x: () => (Math.random() - 0.5) * 900,
    y: () => (Math.random() - 0.5) * 600,
    rotate: () => Math.random() * 360,
    scale: () => 0.4 + Math.random() * 1.4
  })

  const tl = gsap.timeline()
  tl.to(dashes, {
    opacity: () => 0.08 + Math.random() * 0.14,
    x: (i) => Math.cos((marks[i]!.angle * Math.PI) / 180) * RADIUS * 3,
    y: (i) => Math.sin((marks[i]!.angle * Math.PI) / 180) * RADIUS * 3,
    rotate: (i) => marks[i]!.angle,
    scale: 1,
    duration: 2.2,
    ease: 'elastic.out(1, 0.55)',
    stagger: { each: 0.02, from: 'random' }
  })

  const shimmerTweens = dashes.map((dash) =>
    gsap.delayedCall(2.4 + Math.random() * 3, function shimmer() {
      gsap.to(dash, {
        opacity: 0.05 + Math.random() * 0.15,
        duration: 2 + Math.random() * 2.5,
        ease: 'sine.inOut',
        onComplete: () => gsap.delayedCall(1.5 + Math.random() * 3, shimmer)
      })
    })
  )

  return () => {
    tl.kill()
    shimmerTweens.forEach((t) => t.kill())
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="absolute left-1/2 top-1/2 h-0 w-0">
      <span
        v-for="(mark, i) in marks"
        :key="i"
        data-dash=""
        class="absolute left-0 top-0 h-px w-6 -translate-x-1/2 -translate-y-1/2 bg-navy-900"
        :style="{ transform: `rotate(${mark.angle}deg)` }"
      />
    </div>
  </div>
</template>

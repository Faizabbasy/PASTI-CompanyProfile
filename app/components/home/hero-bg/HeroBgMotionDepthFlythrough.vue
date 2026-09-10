<script setup lang="ts">
import gsap from 'gsap'

// Motion — Depth flythrough. Inspired by Lusion / Immersive Garden's
// scroll-through-Z-depth camera work, translated to ambient CSS: instead
// of a real camera dolly, three large soft-blurred circles at different
// simulated depths continuously scale up and fade out on staggered,
// independent loops — as if drifting past camera in slow motion. Cycles
// run 15-20s and stagger-start so no two shapes are ever in sync,
// reading as ambient depth rather than an obvious repeating animation.
const rootRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value) return
  const el = rootRef.value
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const layers = Array.from(el.querySelectorAll<HTMLElement>('[data-depth]'))

  if (prefersReducedMotion) {
    layers.forEach((layer) => gsap.set(layer, { scale: 1.15, opacity: 0.3 }))
    return
  }

  layers.forEach((layer, i) => {
    const duration = 15 + i * 2.5
    gsap.fromTo(
      layer,
      { scale: 0.4, opacity: 0 },
      {
        scale: 1.6,
        opacity: 0,
        keyframes: {
          '0%': { scale: 0.4, opacity: 0 },
          '15%': { opacity: 0.4 },
          '70%': { opacity: 0.28 },
          '100%': { scale: 1.6, opacity: 0 }
        },
        duration,
        ease: 'sine.inOut',
        repeat: -1,
        delay: i * (duration / 3)
      }
    )
  })
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div data-depth="" class="depth-shape depth-1" />
    <div data-depth="" class="depth-shape depth-2" />
    <div data-depth="" class="depth-shape depth-3" />
  </div>
</template>

<style scoped>
.depth-shape {
  position: absolute;
  border-radius: 9999px;
  will-change: transform, opacity;
  transform-origin: center;
}

.depth-1 {
  left: 20%;
  top: 20%;
  width: 46vw;
  height: 46vw;
  max-width: 640px;
  max-height: 640px;
  margin: -23vw 0 0 -23vw;
  filter: blur(100px);
  background: radial-gradient(circle at 45% 45%, theme(colors.navy.300 / 55%), transparent 70%);
}

.depth-2 {
  left: 65%;
  top: 45%;
  width: 38vw;
  height: 38vw;
  max-width: 540px;
  max-height: 540px;
  margin: -19vw 0 0 -19vw;
  filter: blur(90px);
  background: radial-gradient(circle at 45% 45%, theme(colors.yellow.200 / 55%), transparent 70%);
}

.depth-3 {
  left: 40%;
  top: 70%;
  width: 30vw;
  height: 30vw;
  max-width: 420px;
  max-height: 420px;
  margin: -15vw 0 0 -15vw;
  filter: blur(80px);
  background: radial-gradient(circle at 45% 45%, theme(colors.navy.500 / 50%), transparent 70%);
}
</style>

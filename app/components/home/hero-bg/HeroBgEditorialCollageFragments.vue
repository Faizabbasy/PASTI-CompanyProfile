<script setup lang="ts">
import gsap from 'gsap'

// Editorial — Collage/moodboard cutout texture. Short brand words and
// abstract marks scattered at varying sizes, rotations and opacities like
// clippings pinned to an editor's moodboard, each drifting on its own slow
// independent path so the layers never fall into sync. Low-opacity navy
// on paper keeps it as background texture rather than competing copy.
const rootRef = ref<HTMLElement | null>(null)

const fragments = [
  { text: 'Technology', x: 10, y: 16, size: 4.4, rotate: -6, opacity: 0.07 },
  { text: 'N°', x: 82, y: 12, size: 6.2, rotate: 4, opacity: 0.06 },
  { text: 'Creativity', x: 62, y: 30, size: 3.6, rotate: 3, opacity: 0.06 },
  { text: '2026', x: 20, y: 58, size: 5, rotate: -3, opacity: 0.05 },
  { text: 'Impact', x: 74, y: 66, size: 4.8, rotate: 5, opacity: 0.07 },
  { text: 'PASTI', x: 42, y: 82, size: 3.2, rotate: -4, opacity: 0.05 }
]

useGsapContext(() => {
  if (!rootRef.value) return
  const els = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-fragment]'))
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) return

  const tweens = els.map((el, i) =>
    gsap.to(el, {
      x: (i % 2 === 0 ? 1 : -1) * (10 + i * 3),
      y: (i % 3 === 0 ? -1 : 1) * (8 + i * 2),
      rotate: `+=${i % 2 === 0 ? 3 : -3}`,
      duration: 16 + i * 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    })
  )

  return () => {
    tweens.forEach((tw) => tw.kill())
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <span
      v-for="(f, i) in fragments"
      :key="i"
      data-fragment=""
      class="absolute select-none whitespace-nowrap font-display font-extrabold leading-none text-navy-900"
      :style="{
        left: `${f.x}%`,
        top: `${f.y}%`,
        fontSize: `${f.size}vw`,
        opacity: f.opacity,
        transform: `rotate(${f.rotate}deg)`
      }"
    >
      {{ f.text }}
    </span>
  </div>
</template>

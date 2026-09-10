<script setup lang="ts">
import gsap from 'gsap'

// Agency — Scroll-driven reveal choreography. A small set of geometric
// shapes/lines stagger-reveal on load (like a title-card wipe), then stay
// tied to scroll progress through the Hero section — each shape shifts
// position/rotation slightly along its own axis as the user scrolls,
// restrained and structural rather than a heavy parallax effect. Common
// on 2026 Awwwards agency sites as the "background quietly choreographs
// itself to the scroll" signature.
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const rootRef = ref<HTMLElement | null>(null)

const shapes = [
  { type: 'line' as const, style: { left: '12%', top: '20%', width: '18%' }, rotate: -8, shift: 40 },
  { type: 'line' as const, style: { left: '65%', top: '30%', width: '22%' }, rotate: 4, shift: -60 },
  { type: 'square' as const, style: { left: '20%', top: '60%', width: '4%' }, rotate: 12, shift: 30 },
  { type: 'square' as const, style: { left: '78%', top: '68%', width: '3%' }, rotate: -6, shift: -35 },
  { type: 'line' as const, style: { left: '45%', top: '80%', width: '14%' }, rotate: 2, shift: 50 }
]

useGsapContext(() => {
  if (!rootRef.value) return
  const els = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-shape]'))
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    gsap.set(els, { opacity: 0.12, x: 0, y: 0, rotate: (i) => shapes[i]!.rotate })
    return
  }

  gsap.set(els, { opacity: 0, y: 24, rotate: 0 })

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.to(els, {
    opacity: 0.12,
    y: 0,
    rotate: (i) => shapes[i]!.rotate,
    duration: 1,
    stagger: 0.12
  })

  const scrollTrigger = ScrollTrigger.create({
    trigger: rootRef.value,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
    onUpdate: (self) => {
      els.forEach((el, i) => {
        const shape = shapes[i]!
        gsap.set(el, { y: 24 + self.progress * shape.shift * -1 + (self.progress - 0.5) * shape.shift })
      })
    }
  })

  return () => {
    tl.kill()
    scrollTrigger.kill()
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      v-for="(shape, i) in shapes"
      :key="i"
      data-shape=""
      class="absolute"
      :style="{
        ...shape.style,
        aspectRatio: shape.type === 'square' ? '1 / 1' : undefined,
        height: shape.type === 'line' ? '1px' : undefined,
        backgroundColor: shape.type === 'line' ? '#0B3954' : 'transparent',
        border: shape.type === 'square' ? '1px solid #0B3954' : undefined
      }"
    />
  </div>
</template>

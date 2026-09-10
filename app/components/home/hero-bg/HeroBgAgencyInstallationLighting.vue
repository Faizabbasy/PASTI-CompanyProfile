<script setup lang="ts">
import gsap from 'gsap'

// Agency — Inspired by Iventions' award-winning "each project treated like
// a spotlit installation" craft, rebuilt in pure CSS (no Three.js): a row
// of gallery-placard rectangles sits dim/low-contrast, and a warm light
// gradient sweeps across them on a slow deliberate GSAP timeline — not
// cursor-driven — bringing each placard into sharp full-contrast focus one
// at a time before dimming again, like a curated reveal sequence.
const rootRef = ref<HTMLElement | null>(null)

const placards = [
  { left: '10%', top: '22%', width: '16%', height: '30%' },
  { left: '32%', top: '55%', width: '11%', height: '20%' },
  { left: '50%', top: '15%', width: '20%', height: '38%' },
  { left: '76%', top: '48%', width: '13%', height: '26%' }
]

useGsapContext(() => {
  if (!rootRef.value) return
  const cards = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-placard]'))
  const sweep = rootRef.value.querySelector<HTMLElement>('[data-sweep]')
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    gsap.set(cards, { opacity: 0.22, borderColor: '#0B3954' })
    if (sweep) gsap.set(sweep, { opacity: 0 })
    return
  }

  gsap.set(cards, { opacity: 0.08, borderColor: '#0B3954' })
  if (sweep) gsap.set(sweep, { xPercent: -30, opacity: 0 })

  const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } })

  cards.forEach((card, i) => {
    const cx = placards[i]!.left
    if (sweep) {
      tl.to(sweep, { xPercent: parseFloat(cx) - 15, opacity: 0.9, duration: 0.9 }, `card${i}`)
    }
    tl.to(card, { opacity: 0.85, borderColor: '#FBBA00', duration: 0.7 }, `card${i}+=0.15`)
    tl.to(card, { opacity: 0.08, borderColor: '#0B3954', duration: 1, delay: 1.1 })
    if (sweep && i === cards.length - 1) {
      tl.to(sweep, { opacity: 0, duration: 0.6 }, '-=0.4')
    }
    tl.to({}, { duration: 0.5 })
  })

  return () => {
    tl.kill()
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      data-sweep=""
      class="absolute top-0 h-full w-[22%] will-change-transform"
      style="background: linear-gradient(90deg, transparent, rgba(251, 186, 0, 0.14), transparent)"
    />
    <div
      v-for="(p, i) in placards"
      :key="i"
      data-placard=""
      class="absolute border will-change-[opacity,border-color]"
      :style="{ left: p.left, top: p.top, width: p.width, height: p.height }"
    />
  </div>
</template>

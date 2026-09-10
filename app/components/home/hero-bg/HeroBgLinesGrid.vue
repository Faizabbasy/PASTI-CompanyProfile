<script setup lang="ts">
import gsap from 'gsap'

// Line-art variant: technical blueprint grid — a faint full-bleed grid plus a
// few emphasized cross-hairs and a bounding rect that draws itself in. Reads
// as precise/engineered, more "spec sheet" than "sketch".
const rootRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value) return
  const drawn = rootRef.value.querySelectorAll<SVGPathElement | SVGRectElement>('[data-draw]')
  const grid = rootRef.value.querySelector<SVGGElement>('[data-grid]')

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    gsap.set(drawn, { opacity: 1 })
    gsap.set(grid, { opacity: 0.25 })
    return
  }

  drawn.forEach((el) => {
    const length = (el as SVGGeometryElement).getTotalLength()
    gsap.set(el, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 })
  })
  gsap.set(grid, { opacity: 0 })

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
  tl.to(grid, { opacity: 0.25, duration: 1.2 })
  tl.to(drawn, { strokeDashoffset: 0, duration: 1.8, stagger: 0.12 }, 0.3)
  tl.to(
    rootRef.value,
    { x: -12, duration: 16, ease: 'sine.inOut', yoyo: true, repeat: -1 },
    0
  )

  return () => tl.kill()
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg
      ref="rootRef"
      class="absolute inset-0 h-full w-full opacity-80"
      viewBox="0 0 1200 800"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <g data-grid="" stroke="#0B3954" stroke-width="0.5">
        <path v-for="i in 11" :key="`v${i}`" :d="`M${i * 100} 0 L${i * 100} 800`" />
        <path v-for="i in 7" :key="`h${i}`" :d="`M0 ${i * 100} L1200 ${i * 100}`" />
      </g>

      <rect data-draw="" x="240" y="180" width="360" height="360" stroke="#0B3954" stroke-width="1.5" />
      <path data-draw="" d="M240 180 L 240 130 M600 540 L 650 540" stroke="#0B3954" stroke-width="1" opacity="0.6" />
      <path data-draw="" d="M700 260 L 1000 260 L 1000 460" stroke="#FBBA00" stroke-width="1.5" />
      <circle data-draw="" cx="1000" cy="460" r="6" fill="#FBBA00" stroke="none" />
      <path data-draw="" d="M150 620 L 350 620" stroke="#0B3954" stroke-width="1" opacity="0.5" />
    </svg>
  </div>
</template>

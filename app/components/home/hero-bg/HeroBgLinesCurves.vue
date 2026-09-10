<script setup lang="ts">
import gsap from 'gsap'

// Line-art: a handful of geometric SVG strokes that draw themselves in on
// mount, then drift very slowly. Reads as "technical/precise" — leans into
// the "Technology" side of the brand. Uses stroke-dashoffset for the draw-in
// (no DrawSVGPlugin dependency, that's a paid GSAP plugin PASTI doesn't have).
const rootRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value) return
  const paths = rootRef.value.querySelectorAll<SVGPathElement>('path')

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    gsap.set(paths, { opacity: 0.5 })
    return
  }

  paths.forEach((path) => {
    const length = path.getTotalLength()
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 })
  })

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
  tl.to(paths, { strokeDashoffset: 0, duration: 2.4, stagger: 0.15 })
  tl.to(
    rootRef.value,
    { rotate: 1.5, duration: 14, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%' },
    0
  )

  return () => tl.kill()
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg
      ref="rootRef"
      class="absolute inset-0 h-full w-full opacity-70"
      viewBox="0 0 1200 800"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <path d="M100 650 C 300 500, 500 750, 750 550 S 1100 350, 1150 200" stroke="#0B3954" stroke-width="1.5" />
      <path d="M-50 200 C 200 100, 400 300, 650 150 S 1000 50, 1250 180" stroke="#0B3954" stroke-width="1" opacity="0.6" />
      <path d="M150 100 L 350 100 L 350 300 L 150 300 Z" stroke="#FBBA00" stroke-width="1.5" opacity="0.8" />
      <circle cx="950" cy="550" r="90" stroke="#0B3954" stroke-width="1" opacity="0.5" />
      <path d="M850 650 L 1050 450" stroke="#FBBA00" stroke-width="1.5" />
      <path d="M50 450 L 250 450 M150 350 L 150 550" stroke="#0B3954" stroke-width="1" opacity="0.4" />
    </svg>
  </div>
</template>

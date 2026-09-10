<script setup lang="ts">
import gsap from 'gsap'

// Noise/grain + parallax dots: a subtle animated film-grain layer plus a
// sparse dot grid that parallaxes gently with the cursor. Editorial/textural
// feel — understated at a glance, detailed up close. Grain uses an inline
// SVG turbulence filter (no image asset needed); dots parallax via CSS
// custom properties updated on pointermove, animated with a spring-like ease.
const rootRef = ref<HTMLElement | null>(null)
const dotsRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!dotsRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion || !rootRef.value) return

  const el = rootRef.value
  const dots = dotsRef.value

  function onPointerMove(e: PointerEvent) {
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    gsap.to(dots, { x: x * -24, y: y * -24, duration: 1.2, ease: 'power3.out' })
  }

  el.addEventListener('pointermove', onPointerMove)
  return () => el.removeEventListener('pointermove', onPointerMove)
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg class="absolute inset-0 h-full w-full opacity-[0.35] mix-blend-multiply">
      <filter id="hero-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#hero-grain)" />
    </svg>

    <div ref="dotsRef" class="hero-dots absolute -inset-10" />
  </div>
</template>

<style scoped>
.hero-dots {
  background-image: radial-gradient(theme(colors.navy.500) 2px, transparent 2px);
  background-size: 40px 40px;
  opacity: 0.5;
}
</style>

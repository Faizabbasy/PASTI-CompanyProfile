<script setup lang="ts">
import gsap from 'gsap'

// Motion — Breathing light rays. A handful of long, thin, heavily-blurred
// gradient wedges radiating from an off-canvas source point, opacity
// "breathing" out of phase with each other (not synchronized — that
// reads as mechanical) via individually-seeded sine offsets, evoking
// soft god-rays/light-through-glass without any texture asset.
const rootRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value) return
  const rays = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-ray]'))
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    gsap.set(rays, { opacity: 0.5 })
    return
  }

  rays.forEach((ray, i) => {
    gsap.fromTo(
      ray,
      { opacity: 0.15 + (i % 3) * 0.05 },
      {
        opacity: 0.35 + (i % 3) * 0.08,
        duration: 5 + i * 0.7,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.35
      }
    )
    gsap.to(ray, {
      rotate: `+=${1.5 + (i % 2) * 1}`,
      duration: 24 + i * 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      transformOrigin: '0% 100%'
    })
  })
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="ray-source">
      <div
        v-for="i in 6"
        :key="i"
        data-ray=""
        class="ray"
        :style="{ transform: `rotate(${-30 + i * 12}deg)` }"
      />
    </div>
  </div>
</template>

<style scoped>
.ray-source {
  position: absolute;
  left: 50%;
  top: -20%;
  width: 1px;
  height: 1px;
}

.ray {
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 130vh;
  background: linear-gradient(to bottom, theme(colors.yellow.200 / 60%), transparent 70%);
  filter: blur(18px);
  transform-origin: 0% 0%;
}
</style>

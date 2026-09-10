<script setup lang="ts">
import gsap from 'gsap'

// Motion — Cinematic "Ken Burns" backdrop. A soft gradient-mesh layer
// continuously scales from 1.0 to 1.08 over ~20s, ease-in-out, looping
// (never resets visibly since the delta is tiny and it's always mid-ease),
// layered under a vignette whose edge darkness breathes on its own slower,
// out-of-phase cycle — the combination reads as a slow film move rather
// than a background "animating".
const zoomRef = ref<HTMLElement | null>(null)
const vignetteRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!zoomRef.value || !vignetteRef.value) return
  const zoom = zoomRef.value
  const vignette = vignetteRef.value
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    gsap.set(zoom, { scale: 1.04 })
    gsap.set(vignette, { opacity: 0.55 })
    return
  }

  gsap.fromTo(
    zoom,
    { scale: 1 },
    { scale: 1.08, duration: 20, ease: 'sine.inOut', yoyo: true, repeat: -1 }
  )

  gsap.to(vignette, {
    opacity: 0.7,
    duration: 9,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    delay: 1.5
  })
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div ref="zoomRef" class="zoom-layer">
      <div class="mesh mesh-1" />
      <div class="mesh mesh-2" />
      <div class="mesh mesh-3" />
    </div>
    <div ref="vignetteRef" class="vignette" />
  </div>
</template>

<style scoped>
.zoom-layer {
  position: absolute;
  inset: -4%;
  will-change: transform;
}

.mesh {
  position: absolute;
  border-radius: 9999px;
  filter: blur(100px);
}

.mesh-1 {
  left: -10%;
  top: -10%;
  width: 55vw;
  height: 55vw;
  max-width: 760px;
  max-height: 760px;
  opacity: 0.4;
  background: radial-gradient(circle at 40% 40%, theme(colors.navy.600 / 80%), transparent 70%);
}

.mesh-2 {
  right: -12%;
  top: 10%;
  width: 45vw;
  height: 45vw;
  max-width: 620px;
  max-height: 620px;
  opacity: 0.3;
  background: radial-gradient(circle at 40% 40%, theme(colors.yellow.300 / 55%), transparent 70%);
}

.mesh-3 {
  left: 20%;
  bottom: -18%;
  width: 40vw;
  height: 40vw;
  max-width: 540px;
  max-height: 540px;
  opacity: 0.35;
  background: radial-gradient(circle at 40% 40%, theme(colors.navy.300 / 60%), transparent 70%);
}

.vignette {
  position: absolute;
  inset: 0;
  opacity: 0.5;
  background: radial-gradient(
    ellipse at 50% 50%,
    transparent 45%,
    theme(colors.navy.900 / 55%) 100%
  );
  will-change: opacity;
}
</style>

<script setup lang="ts">
import gsap from 'gsap'

// Interactive — Spotlight rig. Inspired by Iventions' spotlit-installation
// craft, made explicitly interactive: the cursor IS the spotlight operator.
// A soft-edged light follows the pointer with spring-lag easing (not
// instant 1:1 tracking) via CSS mask-image, revealing detail only within
// its throw. Two differences from the existing SpotlightMesh/Magnifier
// pieces: (1) the light itself subtly flickers/breathes each frame like a
// physical bulb — small sine-driven radius + opacity jitter layered on top
// of the eased position, never fully stable; (2) the revealed content is
// two overlapping fine line patterns at slightly different angles/scales,
// which is visually richer where they overlap.
const rootRef = ref<HTMLElement | null>(null)
const maskRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value || !maskRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const el = rootRef.value
  const mask = maskRef.value

  if (prefersReducedMotion) {
    // Pointer-reactivity stays (user-initiated); the ambient bulb-flicker
    // breathing is ambient autoplay, so it's dropped entirely here.
    gsap.set(mask, { opacity: 0.22 })
    const pos = { x: 50, y: 45 }
    function onPointerMoveStatic(e: PointerEvent) {
      const rect = el.getBoundingClientRect()
      pos.x = ((e.clientX - rect.left) / rect.width) * 100
      pos.y = ((e.clientY - rect.top) / rect.height) * 100
      mask.style.setProperty('--spot-x', `${pos.x}%`)
      mask.style.setProperty('--spot-y', `${pos.y}%`)
    }
    el.addEventListener('pointermove', onPointerMoveStatic)
    return () => el.removeEventListener('pointermove', onPointerMoveStatic)
  }

  const pos = { x: 50, y: 45 }
  const target = { x: 50, y: 45 }

  function onPointerMove(e: PointerEvent) {
    const rect = el.getBoundingClientRect()
    target.x = ((e.clientX - rect.left) / rect.width) * 100
    target.y = ((e.clientY - rect.top) / rect.height) * 100
  }
  function onPointerLeave() {
    target.x = 50
    target.y = 45
  }
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerleave', onPointerLeave)

  const clockStart = performance.now() / 1000

  const ticker = gsap.ticker.add(() => {
    const t = performance.now() / 1000 - clockStart

    // Spring-lag toward the raw pointer target.
    pos.x += (target.x - pos.x) * 0.08
    pos.y += (target.y - pos.y) * 0.08

    // Physical-bulb flicker: layered low-frequency breathing + a faster,
    // smaller jitter so the radius/opacity never sit perfectly still.
    const breathe = Math.sin(t * 0.9) * 6 + Math.sin(t * 3.1 + 1.4) * 1.6
    const flickerOpacity = 0.9 + Math.sin(t * 5.3) * 0.04 + Math.sin(t * 11.7 + 0.6) * 0.02

    mask.style.setProperty('--spot-x', `${pos.x}%`)
    mask.style.setProperty('--spot-y', `${pos.y}%`)
    mask.style.setProperty('--spot-radius', `${230 + breathe}px`)
    mask.style.opacity = String(flickerOpacity)
  })

  return () => {
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerleave', onPointerLeave)
    gsap.ticker.remove(ticker)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="ambient-base absolute inset-0" />
    <div ref="maskRef" class="spotlight-reveal absolute inset-0" />
  </div>
</template>

<style scoped>
.ambient-base {
  opacity: 0.05;
  background-image: radial-gradient(theme(colors.navy.700 / 60%) 1px, transparent 1.4px);
  background-size: 26px 26px;
}

.spotlight-reveal {
  --spot-x: 50%;
  --spot-y: 45%;
  --spot-radius: 230px;
  /* Two overlapping fine patterns at different angles/scales create a
     moiré-like richness only where both are revealed together. */
  background-image:
    repeating-linear-gradient(18deg, theme(colors.navy.700 / 75%) 0 1px, transparent 1px 9px),
    repeating-linear-gradient(-72deg, theme(colors.yellow.500 / 55%) 0 1px, transparent 1px 11px),
    radial-gradient(theme(colors.paper / 65%) 1px, transparent 1.6px);
  background-size:
    9px 9px,
    11px 11px,
    17px 17px;
  -webkit-mask-image: radial-gradient(circle var(--spot-radius) at var(--spot-x) var(--spot-y), black 0%, black 45%, transparent 85%);
  mask-image: radial-gradient(circle var(--spot-radius) at var(--spot-x) var(--spot-y), black 0%, black 45%, transparent 85%);
}
</style>

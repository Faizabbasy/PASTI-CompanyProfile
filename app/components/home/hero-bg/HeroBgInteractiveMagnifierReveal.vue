<script setup lang="ts">
import gsap from 'gsap'

// Interactive — Magnifier reveal. A richer evolution of the SpotlightMesh
// idea: two independent CSS pattern layers stacked — a coarse diagonal
// grid always visible at low opacity, and a much finer technical grid +
// dot pattern layered underneath it, hidden until a circular "magnifier"
// mask (CSS radial-gradient mask-image, GPU-cheap) sweeps over it. The
// mask position follows the cursor with spring-lag easing via gsap.ticker,
// so the reveal feels weighted rather than snapping straight to the pointer.
const rootRef = ref<HTMLElement | null>(null)
const maskRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value || !maskRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    gsap.set(maskRef.value, { opacity: 0.2 })
    return
  }

  const el = rootRef.value
  const mask = maskRef.value
  const pos = { x: 50, y: 45 }
  const target = { x: 50, y: 45 }

  function onPointerMove(e: PointerEvent) {
    const rect = el.getBoundingClientRect()
    target.x = ((e.clientX - rect.left) / rect.width) * 100
    target.y = ((e.clientY - rect.top) / rect.height) * 100
  }
  function onPointerLeave() {
    // Drift the magnifier back toward center when the cursor leaves so it
    // doesn't sit frozen at the last edge position.
    target.x = 50
    target.y = 45
  }
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerleave', onPointerLeave)

  const ticker = gsap.ticker.add(() => {
    pos.x += (target.x - pos.x) * 0.1
    pos.y += (target.y - pos.y) * 0.1
    mask.style.setProperty('--mag-x', `${pos.x}%`)
    mask.style.setProperty('--mag-y', `${pos.y}%`)
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
    <div class="coarse-pattern absolute inset-0" />
    <div ref="maskRef" class="fine-pattern absolute inset-0" />
  </div>
</template>

<style scoped>
.coarse-pattern {
  opacity: 0.12;
  background-image: repeating-linear-gradient(45deg, theme(colors.navy.700 / 60%) 0 1px, transparent 1px 40px),
    repeating-linear-gradient(-45deg, theme(colors.navy.700 / 60%) 0 1px, transparent 1px 40px);
}

.fine-pattern {
  --mag-x: 50%;
  --mag-y: 45%;
  background-image: repeating-linear-gradient(0deg, theme(colors.navy.700 / 70%) 0 1px, transparent 1px 10px),
    repeating-linear-gradient(90deg, theme(colors.navy.700 / 70%) 0 1px, transparent 1px 10px),
    radial-gradient(theme(colors.yellow.500 / 55%) 1px, transparent 1.4px);
  background-size:
    10px 10px,
    10px 10px,
    22px 22px;
  -webkit-mask-image: radial-gradient(circle 190px at var(--mag-x) var(--mag-y), black 0%, black 55%, transparent 85%);
  mask-image: radial-gradient(circle 190px at var(--mag-x) var(--mag-y), black 0%, black 55%, transparent 85%);
}
</style>

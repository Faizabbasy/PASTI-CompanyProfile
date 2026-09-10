<script setup lang="ts">
import gsap from 'gsap'

// Agency — Cursor-follow spotlight over a hidden line mesh. A dense but
// very faint grid of diagonal lines sits invisible under a radial mask
// that follows the cursor with lag — only the area near the pointer
// "reveals" the mesh detail (via CSS mask-image, GPU-cheap), like shining
// a flashlight over a technical drawing. Distinct from a plain spotlight
// glow because there's real structure to discover underneath.
const rootRef = ref<HTMLElement | null>(null)
const maskRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value || !maskRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    gsap.set(maskRef.value, { opacity: 0.15 })
    return
  }

  const el = rootRef.value
  const mask = maskRef.value
  const pos = { x: 50, y: 50 }
  const target = { x: 50, y: 50 }

  function onPointerMove(e: PointerEvent) {
    const rect = el.getBoundingClientRect()
    target.x = ((e.clientX - rect.left) / rect.width) * 100
    target.y = ((e.clientY - rect.top) / rect.height) * 100
  }
  el.addEventListener('pointermove', onPointerMove)

  const ticker = gsap.ticker.add(() => {
    pos.x += (target.x - pos.x) * 0.08
    pos.y += (target.y - pos.y) * 0.08
    mask.style.setProperty('--spot-x', `${pos.x}%`)
    mask.style.setProperty('--spot-y', `${pos.y}%`)
  })

  return () => {
    el.removeEventListener('pointermove', onPointerMove)
    gsap.ticker.remove(ticker)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div ref="maskRef" class="spotlight-mesh absolute inset-0" />
  </div>
</template>

<style scoped>
.spotlight-mesh {
  --spot-x: 50%;
  --spot-y: 40%;
  background-image: repeating-linear-gradient(45deg, theme(colors.navy.700 / 55%) 0 1px, transparent 1px 26px),
    repeating-linear-gradient(-45deg, theme(colors.navy.700 / 40%) 0 1px, transparent 1px 26px);
  -webkit-mask-image: radial-gradient(circle 260px at var(--spot-x) var(--spot-y), black 0%, transparent 75%);
  mask-image: radial-gradient(circle 260px at var(--spot-x) var(--spot-y), black 0%, transparent 75%);
}
</style>

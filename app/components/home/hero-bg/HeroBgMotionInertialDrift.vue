<script setup lang="ts">
import gsap from 'gsap'

// Motion — Inertial drift. Inspired by Lusion's award-winning hero-object
// technique (Site of the Month, Developer Award): a single object rendered
// with genuine simulated mass rather than a scene full of things, easing
// that mimics physics rather than a tween. Here the "object" is a soft
// blurred blob (no Three.js needed for the principle to read): pointer
// position sets a target, and a spring-damper integrates position each
// frame — fast cursor moves make it overshoot and settle back with a
// slight pendulum-like correction, so it reads as weighted, not attached.
const rootRef = ref<HTMLElement | null>(null)
const blobRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value || !blobRef.value) return
  const el = rootRef.value
  const blob = blobRef.value
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    gsap.set(blob, { x: 0, y: 0 })
    return
  }

  // Spring-damper state: current position/velocity, driven toward a
  // pointer-derived target with a stiffness (spring force) and damping
  // coefficient — the physical-mass illusion comes entirely from this.
  const pos = { x: 0, y: 0 }
  const vel = { x: 0, y: 0 }
  const target = { x: 0, y: 0 }
  const stiffness = 0.045
  const damping = 0.9
  const range = 46

  function onPointerMove(e: PointerEvent) {
    const rect = el.getBoundingClientRect()
    target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2 * range
    target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2 * range
  }
  function onPointerLeave() {
    target.x = 0
    target.y = 0
  }
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerleave', onPointerLeave)

  const ticker = gsap.ticker.add(() => {
    const accelX = (target.x - pos.x) * stiffness
    const accelY = (target.y - pos.y) * stiffness
    vel.x = (vel.x + accelX) * damping
    vel.y = (vel.y + accelY) * damping
    pos.x += vel.x
    pos.y += vel.y
    blob.style.transform = `translate(${pos.x}px, ${pos.y}px)`
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
    <div ref="blobRef" class="drift-blob" />
  </div>
</template>

<style scoped>
.drift-blob {
  position: absolute;
  left: 50%;
  top: 45%;
  width: 32vw;
  height: 32vw;
  max-width: 460px;
  max-height: 460px;
  margin: -16vw 0 0 -16vw;
  border-radius: 9999px;
  opacity: 0.4;
  filter: blur(80px);
  will-change: transform;
  background: radial-gradient(circle at 42% 42%, theme(colors.yellow.300 / 65%), theme(colors.navy.400 / 20%) 60%, transparent 75%);
}
</style>

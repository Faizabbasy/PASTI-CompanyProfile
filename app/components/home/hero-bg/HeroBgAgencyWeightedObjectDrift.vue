<script setup lang="ts">
import gsap from 'gsap'

// Agency — Inspired by Lusion's award-winning principle: one hero object
// with real weight, not a scene full of things. A single bold circular
// outline drifts on a slow idle path and reacts to cursor proximity with a
// spring-damper (angular target → velocity → position, damped each frame)
// so fast pointer moves make it overshoot and settle — simulated inertia
// via rAF + CSS transform, no Three.js. Deliberately minimal: one mark.
const rootRef = ref<HTMLElement | null>(null)
const shapeRef = ref<HTMLElement | null>(null)
let raf = 0

useGsapContext(() => {
  if (!rootRef.value || !shapeRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const root = rootRef.value
  const shape = shapeRef.value

  if (prefersReducedMotion) {
    gsap.set(shape, { x: 0, y: 0, opacity: 0.16 })
    return
  }

  gsap.set(shape, { opacity: 0.16 })

  const pos = { x: 0, y: 0 }
  const vel = { x: 0, y: 0 }
  const target = { x: 0, y: 0 }
  const stiffness = 3.4
  const damping = 2.4

  let pointerActive = false
  function onPointerMove(e: PointerEvent) {
    const rect = root.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const dx = px - cx
    const dy = py - cy
    const dist = Math.hypot(dx, dy)
    const maxPull = Math.min(rect.width, rect.height) * 0.22
    const proximity = Math.max(0, 1 - dist / (Math.min(rect.width, rect.height) * 0.6))
    pointerActive = proximity > 0.02
    target.x = pointerActive ? (dx / (dist || 1)) * maxPull * proximity : 0
    target.y = pointerActive ? (dy / (dist || 1)) * maxPull * proximity : 0
  }
  root.addEventListener('pointermove', onPointerMove)
  root.addEventListener('pointerleave', () => {
    pointerActive = false
    target.x = 0
    target.y = 0
  })

  let last = performance.now()
  function tick(now: number) {
    const dt = Math.min((now - last) / 1000, 1 / 30)
    last = now
    const t = now / 1000

    const idleX = Math.sin(t * 0.15) * 18
    const idleY = Math.cos(t * 0.11) * 14
    const finalTargetX = target.x + (pointerActive ? 0 : idleX)
    const finalTargetY = target.y + (pointerActive ? 0 : idleY)

    const accelX = (finalTargetX - pos.x) * stiffness - vel.x * damping
    const accelY = (finalTargetY - pos.y) * stiffness - vel.y * damping
    vel.x += accelX * dt
    vel.y += accelY * dt
    pos.x += vel.x * dt
    pos.y += vel.y * dt

    shape.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    root.removeEventListener('pointermove', onPointerMove)
    cancelAnimationFrame(raf)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div
        ref="shapeRef"
        class="h-[34vmin] w-[34vmin] rounded-full border-[3px] border-navy-900 will-change-transform"
      />
    </div>
  </div>
</template>

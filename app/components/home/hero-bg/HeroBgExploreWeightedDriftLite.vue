<script setup lang="ts">
// Explore — Lite take on Lusion's "single object with real weight/inertia".
// One soft blob drifts on an idle path and eases toward the cursor with a
// basic spring-damper — simpler than the flagship version (no proximity
// falloff curve, fixed stiffness/damping, single shape only).
const rootRef = ref<HTMLElement | null>(null)
const blobRef = ref<HTMLElement | null>(null)
let raf = 0

useGsapContext(() => {
  if (!rootRef.value || !blobRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const root = rootRef.value
  const blob = blobRef.value

  if (prefersReducedMotion) return

  const pos = { x: 0, y: 0 }
  const vel = { x: 0, y: 0 }
  const target = { x: 0, y: 0 }
  const stiffness = 2.2
  const damping = 2

  function onPointerMove(e: PointerEvent) {
    const rect = root.getBoundingClientRect()
    target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 60
    target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 60
  }
  root.addEventListener('pointermove', onPointerMove)

  let last = performance.now()
  function tick(now: number) {
    const dt = Math.min((now - last) / 1000, 1 / 30)
    last = now
    const t = now / 1000

    const idleX = Math.sin(t * 0.2) * 14
    const idleY = Math.cos(t * 0.16) * 10

    const accelX = (target.x + idleX - pos.x) * stiffness - vel.x * damping
    const accelY = (target.y + idleY - pos.y) * stiffness - vel.y * damping
    vel.x += accelX * dt
    vel.y += accelY * dt
    pos.x += vel.x * dt
    pos.y += vel.y * dt

    blob.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
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
      <div ref="blobRef" class="drift-blob will-change-transform" />
    </div>
  </div>
</template>

<style scoped>
.drift-blob {
  width: 26vmin;
  height: 26vmin;
  border-radius: 9999px;
  filter: blur(40px);
  opacity: 0.4;
  background: radial-gradient(circle at 40% 40%, theme(colors.yellow.300), theme(colors.navy.400) 75%);
}
</style>

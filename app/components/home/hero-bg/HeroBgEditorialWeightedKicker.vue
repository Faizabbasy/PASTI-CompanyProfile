<script setup lang="ts">
import gsap from 'gsap'

// Editorial — Inspired by Lusion's award-winning approach of rendering ONE
// hero object with genuine simulated mass rather than a busy composition
// (see HeroBgThreeInertialHeroObject, which applies this to a 3D torus-
// knot via an angular spring-damper). Here the same physical-weight idea is
// applied to a single confident piece of editorial furniture: a small bold
// magazine-style kicker tag ("N° 01 — FEATURED"). The kicker does not
// follow the cursor directly — pointer proximity sets a target offset, and
// a 2D spring-damper integrates position each frame, so quick cursor moves
// make it overshoot and settle back with real inertia, like a weighted
// object on a desk being nudged rather than dragged.
const rootRef = ref<HTMLElement | null>(null)
const kickerRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value || !kickerRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const parent = rootRef.value
  const kicker = kickerRef.value

  if (prefersReducedMotion) return

  const pointer = { x: 0, y: 0, active: false }
  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1
    pointer.active = true
  }
  function onPointerLeave() {
    pointer.active = false
  }
  parent.addEventListener('pointermove', onPointerMove)
  parent.addEventListener('pointerleave', onPointerLeave)

  // 2D spring-damper: position eases toward a pointer-proximity target with
  // stiffness (pull force) and damping (energy loss), integrated per frame
  // — overshoot + settle reads as real weight, unlike a direct 1:1 follow.
  const position = { x: 0, y: 0 }
  const velocity = { x: 0, y: 0 }
  const stiffness = 3.6
  const damping = 2.2
  const maxOffset = 46 // px — kicker has a "leash", never drifts far

  let raf = 0
  let lastTime = performance.now()

  function tick(now: number) {
    const dt = Math.min((now - lastTime) / 1000, 1 / 30)
    lastTime = now

    const targetX = pointer.active ? pointer.x * maxOffset : 0
    const targetY = pointer.active ? pointer.y * maxOffset : 0

    const accelX = (targetX - position.x) * stiffness - velocity.x * damping
    const accelY = (targetY - position.y) * stiffness - velocity.y * damping
    velocity.x += accelX * dt
    velocity.y += accelY * dt
    position.x += velocity.x * dt
    position.y += velocity.y * dt

    kicker.style.transform = `translate(${position.x}px, ${position.y}px)`
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  // Slow idle rotation-in on load, independent of the pointer spring.
  gsap.from(kicker, { opacity: 0, y: 20, duration: 1.1, ease: 'power3.out' })

  return () => {
    cancelAnimationFrame(raf)
    parent.removeEventListener('pointermove', onPointerMove)
    parent.removeEventListener('pointerleave', onPointerLeave)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="absolute right-[10%] top-[16%]">
      <div ref="kickerRef" class="inline-flex items-center gap-3 will-change-transform">
        <span class="h-2 w-2 rounded-full bg-yellow-500 opacity-40" />
        <span class="select-none font-display text-eyebrow font-semibold uppercase tracking-[0.28em] text-navy-700 opacity-[0.14]">
          N&deg; 01 &mdash; Featured
        </span>
      </div>
    </div>
  </div>
</template>

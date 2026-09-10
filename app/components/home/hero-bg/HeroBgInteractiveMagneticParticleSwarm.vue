<script setup lang="ts">
import gsap from 'gsap'

// Interactive — Magnetic particle swarm. ~50 particles each carry their own
// slow idle wander (small seeded velocity noise) plus a shared force field:
// inside the cursor's radius, particles are repelled outward with strength
// proportional to proximity, integrated as real velocity/acceleration (not
// a direct position snap) so motion has inertia and springs back smoothly
// once the cursor moves on. Rendered as absolutely-positioned divs driven by
// one shared GSAP ticker — cheap even at this particle count.
const rootRef = ref<HTMLElement | null>(null)
const COUNT = 52

interface ParticleState {
  el: HTMLElement
  x: number
  y: number
  vx: number
  vy: number
  wanderPhaseX: number
  wanderPhaseY: number
  wanderSpeedX: number
  wanderSpeedY: number
}

useGsapContext(() => {
  if (!rootRef.value) return
  const el = rootRef.value
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const particleEls = Array.from(el.querySelectorAll<HTMLElement>('[data-particle]'))
  const particles: ParticleState[] = particleEls.map((particleEl) => ({
    el: particleEl,
    x: Number(particleEl.dataset.hx) / 100,
    y: Number(particleEl.dataset.hy) / 100,
    vx: 0,
    vy: 0,
    wanderPhaseX: Math.random() * Math.PI * 2,
    wanderPhaseY: Math.random() * Math.PI * 2,
    wanderSpeedX: 0.12 + Math.random() * 0.18,
    wanderSpeedY: 0.12 + Math.random() * 0.18
  }))

  let width = 0
  let height = 0
  function measure() {
    const rect = el.getBoundingClientRect()
    width = rect.width
    height = rect.height
  }
  measure()
  const resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(el)

  const pointer = { x: -9999, y: -9999, active: false }
  function onPointerMove(e: PointerEvent) {
    const rect = el.getBoundingClientRect()
    pointer.x = e.clientX - rect.left
    pointer.y = e.clientY - rect.top
    pointer.active = true
  }
  function onPointerLeave() {
    pointer.active = false
  }
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerleave', onPointerLeave)

  const RADIUS = 150
  const REPEL_FORCE = 620
  const damping = 0.9
  let elapsed = 0

  const ticker = gsap.ticker.add((_time, deltaMs) => {
    const dt = Math.min(deltaMs / 1000, 0.05)
    elapsed += dt

    particles.forEach((p) => {
      const px = p.x * width
      const py = p.y * height

      let ax = 0
      let ay = 0

      // Idle wander: a gentle seeded acceleration, removed under reduced
      // motion since it's ambient autoplay rather than pointer-driven.
      if (!prefersReducedMotion) {
        ax += Math.sin(elapsed * p.wanderSpeedX + p.wanderPhaseX) * 6
        ay += Math.cos(elapsed * p.wanderSpeedY + p.wanderPhaseY) * 6
      }

      if (pointer.active) {
        const dx = px - pointer.x
        const dy = py - pointer.y
        const dist = Math.hypot(dx, dy)
        if (dist < RADIUS) {
          const falloff = 1 - dist / RADIUS
          const force = (falloff * falloff) * REPEL_FORCE
          const nx = dist > 0.001 ? dx / dist : 1
          const ny = dist > 0.001 ? dy / dist : 0
          ax += nx * force
          ay += ny * force
        }
      }

      p.vx = (p.vx + ax * dt) * damping
      p.vy = (p.vy + ay * dt) * damping

      let nextX = px + p.vx * dt
      let nextY = py + p.vy * dt

      // Soft containment: pull back toward the field once far outside bounds.
      const margin = 40
      if (nextX < -margin) p.vx += 20
      if (nextX > width + margin) p.vx -= 20
      if (nextY < -margin) p.vy += 20
      if (nextY > height + margin) p.vy -= 20

      nextX = Math.max(-margin, Math.min(width + margin, nextX))
      nextY = Math.max(-margin, Math.min(height + margin, nextY))

      p.x = width > 0 ? nextX / width : p.x
      p.y = height > 0 ? nextY / height : p.y

      p.el.style.transform = `translate(${nextX}px, ${nextY}px)`
    })
  })

  return () => {
    resizeObserver.disconnect()
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerleave', onPointerLeave)
    gsap.ticker.remove(ticker)
  }
})

// Deterministic-feeling scatter for particle starting positions.
const particlePositions = Array.from({ length: COUNT }, () => ({
  hx: 4 + Math.random() * 92,
  hy: 4 + Math.random() * 92,
  size: Math.random() > 0.82 ? 5 : 3
}))
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      v-for="(pos, i) in particlePositions"
      :key="i"
      data-particle=""
      class="swarm-particle"
      :data-hx="pos.hx"
      :data-hy="pos.hy"
      :style="{ width: `${pos.size}px`, height: `${pos.size}px` }"
    />
  </div>
</template>

<style scoped>
.swarm-particle {
  position: absolute;
  top: 0;
  left: 0;
  margin: -3px 0 0 -3px;
  border-radius: 9999px;
  background: theme(colors.yellow.400 / 60%);
  box-shadow: 0 0 10px 2px theme(colors.yellow.300 / 30%);
  will-change: transform;
}

.swarm-particle:nth-child(4n) {
  background: theme(colors.navy.300 / 55%);
  box-shadow: 0 0 10px 2px theme(colors.navy.200 / 25%);
}

.swarm-particle:nth-child(7n) {
  background: theme(colors.paper / 70%);
  box-shadow: none;
}
</style>

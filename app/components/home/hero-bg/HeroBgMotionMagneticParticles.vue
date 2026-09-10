<script setup lang="ts">
import gsap from 'gsap'

// Motion — Sparse magnetic particle field. A small set (20) of soft dots
// each independently drifts in a slow, seeded orbit around its own home
// point; particles that come near the cursor get gently pulled toward it
// and spring back once it moves away. Distinct from MagneticGrid (which is
// a dense regular grid with a shared spring loop) — here each particle
// keeps its own slow orbital phase, so the field never looks like a
// mechanical lattice, just a handful of restrained, drifting motes.
const rootRef = ref<HTMLElement | null>(null)
const COUNT = 20

interface ParticleState {
  el: HTMLElement
  homeX: number
  homeY: number
  orbitR: number
  orbitSpeed: number
  orbitPhase: number
  x: number
  y: number
  vx: number
  vy: number
}

useGsapContext(() => {
  if (!rootRef.value) return
  const el = rootRef.value
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const particleEls = Array.from(el.querySelectorAll<HTMLElement>('[data-particle]'))
  const particles: ParticleState[] = particleEls.map((particleEl) => ({
    el: particleEl,
    homeX: 0,
    homeY: 0,
    orbitR: 6 + Math.random() * 10,
    orbitSpeed: 0.08 + Math.random() * 0.1,
    orbitPhase: Math.random() * Math.PI * 2,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0
  }))

  function measure() {
    const rect = el.getBoundingClientRect()
    particles.forEach((p) => {
      const left = Number(p.el.dataset.hx) / 100 * rect.width
      const top = Number(p.el.dataset.hy) / 100 * rect.height
      p.homeX = left
      p.homeY = top
    })
  }
  measure()
  const resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(el)

  if (prefersReducedMotion) return

  const pointer = { x: -9999, y: -9999 }
  function onPointerMove(e: PointerEvent) {
    const rect = el.getBoundingClientRect()
    pointer.x = e.clientX - rect.left
    pointer.y = e.clientY - rect.top
  }
  function onPointerLeave() {
    pointer.x = -9999
    pointer.y = -9999
  }
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerleave', onPointerLeave)

  const RADIUS = 110
  const stiffness = 0.05
  const damping = 0.85
  let elapsed = 0

  const ticker = gsap.ticker.add((_time, deltaMs) => {
    elapsed += deltaMs / 1000
    particles.forEach((p) => {
      const orbitX = Math.cos(elapsed * p.orbitSpeed + p.orbitPhase) * p.orbitR
      const orbitY = Math.sin(elapsed * p.orbitSpeed * 1.3 + p.orbitPhase) * p.orbitR

      let targetX = p.homeX + orbitX
      let targetY = p.homeY + orbitY

      const dx = targetX - pointer.x
      const dy = targetY - pointer.y
      const dist = Math.hypot(dx, dy)
      if (dist < RADIUS) {
        const pull = (1 - dist / RADIUS) * 22
        targetX -= (dx / (dist || 1)) * pull
        targetY -= (dy / (dist || 1)) * pull
      }

      p.vx += (targetX - p.x) * stiffness
      p.vy += (targetY - p.y) * stiffness
      p.vx *= damping
      p.vy *= damping
      p.x += p.vx
      p.y += p.vy

      p.el.style.transform = `translate(${p.x - p.homeX}px, ${p.y - p.homeY}px)`
    })
  })

  return () => {
    resizeObserver.disconnect()
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerleave', onPointerLeave)
    gsap.ticker.remove(ticker)
  }
})

// Deterministic-feeling scatter for particle home positions, seeded once.
const particlePositions = Array.from({ length: COUNT }, () => ({
  hx: 8 + Math.random() * 84,
  hy: 8 + Math.random() * 84
}))
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      v-for="(pos, i) in particlePositions"
      :key="i"
      data-particle=""
      class="particle"
      :data-hx="pos.hx"
      :data-hy="pos.hy"
      :style="{ left: `${pos.hx}%`, top: `${pos.hy}%` }"
    />
  </div>
</template>

<style scoped>
.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  border-radius: 9999px;
  background: theme(colors.yellow.400 / 55%);
  box-shadow: 0 0 12px 2px theme(colors.yellow.300 / 35%);
  will-change: transform;
}

.particle:nth-child(3n) {
  background: theme(colors.navy.300 / 55%);
  box-shadow: 0 0 12px 2px theme(colors.navy.200 / 30%);
}
</style>

<script setup lang="ts">
// Interactive — Ripple grid. A regular grid of dots rendered on canvas; each
// pointermove injects a wave impulse (radius 0, amplitude 1) into a small
// ring-buffer of active ripples at the pointer's grid cell. Every tick, each
// dot samples its distance to each active ripple's expanding radius and
// displaces radially outward/inward with a sine falloff that decays over
// the ripple's lifetime — genuine wave propagation, not a static bulge.
// Canvas-based so hundreds of dots stay cheap on one draw pass.
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

interface Ripple {
  x: number
  y: number
  born: number
}

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const ctx = canvas.getContext('2d')!

  const SPACING = 34
  let width = 0
  let height = 0
  let cols = 0
  let rows = 0
  let dpr = 1

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = parent.clientWidth
    height = parent.clientHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    cols = Math.ceil(width / SPACING) + 1
    rows = Math.ceil(height / SPACING) + 1
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const ripples: Ripple[] = []
  const MAX_RIPPLES = 24
  const SPEED = 260 // px/sec propagation
  // Reduced motion keeps pointer-reactivity (it's user-initiated) but the
  // wave settles almost immediately instead of lingering/propagating far.
  const LIFETIME = prefersReducedMotion ? 0.35 : 1.3 // seconds

  let lastEmit = 0
  function onPointerMove(e: PointerEvent) {
    const now = performance.now() / 1000
    if (now - lastEmit < 0.035) return
    lastEmit = now
    const rect = parent.getBoundingClientRect()
    ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, born: now })
    if (ripples.length > MAX_RIPPLES) ripples.shift()
  }
  parent.addEventListener('pointermove', onPointerMove)

  const clockStart = performance.now() / 1000
  function tick() {
    const now = performance.now() / 1000 - clockStart

    for (let i = ripples.length - 1; i >= 0; i--) {
      if (now - (ripples[i]!.born - clockStart) > LIFETIME) ripples.splice(i, 1)
    }

    ctx.clearRect(0, 0, width, height)

    for (let iy = 0; iy < rows; iy++) {
      const baseY = iy * SPACING
      for (let ix = 0; ix < cols; ix++) {
        const baseX = ix * SPACING
        let dx = 0
        let dy = 0
        let glow = 0

        for (const r of ripples) {
          const rdx = baseX - r.x
          const rdy = baseY - r.y
          const dist = Math.sqrt(rdx * rdx + rdy * rdy)
          const age = performance.now() / 1000 - r.born
          if (age < 0 || age > LIFETIME) continue
          const waveRadius = age * SPEED
          const band = dist - waveRadius
          if (Math.abs(band) < 40) {
            const decay = 1 - age / LIFETIME
            const strength = Math.cos((band / 40) * Math.PI * 0.5) * decay
            const nx = dist > 0.001 ? rdx / dist : 0
            const ny = dist > 0.001 ? rdy / dist : 0
            dx += nx * strength * 7
            dy += ny * strength * 7
            glow += Math.max(0, strength) * 0.6
          }
        }

        const px = baseX + dx
        const py = baseY + dy
        const radius = 1.4 + Math.min(1.6, glow)
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fillStyle = glow > 0.05 ? `rgba(251, 186, 0, ${Math.min(0.85, 0.25 + glow)})` : 'rgba(11, 57, 84, 0.28)'
        ctx.fill()
      }
    }

    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>

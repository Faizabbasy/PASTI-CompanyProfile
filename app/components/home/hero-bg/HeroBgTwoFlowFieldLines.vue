<script setup lang="ts">
// 2D — Generative flow-field particle trails ("wind map" look). A grid-free
// swarm of particles is advected each frame by a lightweight value-noise
// vector field (a few octaves of sine/cosine standing in for Perlin noise —
// cheap enough for a full rAF loop with no library) and drawn as short
// strokes; the canvas is cleared with a low-alpha fill instead of a hard
// clear each frame, so old strokes fade into faint trailing lines rather
// than vanishing — the classic organic flow-map aesthetic. Cursor locally
// bends the field like a pressure disturbance.
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

interface Particle {
  x: number
  y: number
  age: number
  life: number
}

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const ctx = canvas.getContext('2d')!

  let width = 0
  let height = 0
  let dpr = 1

  function resize() {
    width = parent.clientWidth
    height = parent.clientHeight
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#EAF1F4'
    ctx.fillRect(0, 0, width, height)
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const pointer = { x: -1000, y: -1000, active: false }
  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    pointer.x = e.clientX - rect.left
    pointer.y = e.clientY - rect.top
    pointer.active = true
  }
  function onPointerLeave() {
    pointer.active = false
  }
  parent.addEventListener('pointermove', onPointerMove)
  parent.addEventListener('pointerleave', onPointerLeave)

  const COUNT = 240
  const particles: Particle[] = Array.from({ length: COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    age: Math.random() * 200,
    life: 120 + Math.random() * 160
  }))

  // cheap pseudo-Perlin: sum of a few phase-shifted sine waves — smooth,
  // continuous, and good enough for a decorative vector field.
  function angleAt(x: number, y: number, t: number): number {
    const nx = x * 0.0035
    const ny = y * 0.0035
    let a
      = Math.sin(nx * 1.3 + t * 0.06) * 1.0
      + Math.cos(ny * 1.7 - t * 0.05) * 0.8
      + Math.sin((nx + ny) * 0.9 + t * 0.03) * 0.6

    if (pointer.active) {
      const dx = x - pointer.x
      const dy = y - pointer.y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < 220) {
        const swirl = (1 - d / 220) * 2.2
        a += Math.atan2(dy, dx) * 0 + swirl * Math.sin(d * 0.03 + t * 0.1)
      }
    }
    return a * Math.PI
  }

  const clock = { start: performance.now() }
  function tick() {
    const t = prefersReducedMotion ? 0 : (performance.now() - clock.start) / 16.6

    ctx.fillStyle = 'rgba(234, 241, 244, 0.06)'
    ctx.fillRect(0, 0, width, height)

    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(11, 57, 84, 0.35)'

    particles.forEach((p) => {
      const angle = angleAt(p.x, p.y, t)
      const speed = prefersReducedMotion ? 0 : 1.6
      const nx = p.x + Math.cos(angle) * speed
      const ny = p.y + Math.sin(angle) * speed

      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(nx, ny)
      ctx.stroke()

      p.x = nx
      p.y = ny
      p.age += 1

      if (p.age > p.life || p.x < -10 || p.x > width + 10 || p.y < -10 || p.y > height + 10) {
        p.x = Math.random() * width
        p.y = Math.random() * height
        p.age = 0
        p.life = 120 + Math.random() * 160
      }
    })

    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    parent.removeEventListener('pointerleave', onPointerLeave)
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-80">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>

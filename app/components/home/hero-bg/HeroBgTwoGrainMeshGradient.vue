<script setup lang="ts">
// 2D — Mesh gradient + film grain, the definitive 2026 "printed poster"
// combo. A handful of organic color points are blended per-pixel on a
// low-res offscreen buffer (same mesh technique as AuroraGradient, tuned
// for fewer/larger color fields so it reads as ink pools rather than a
// flowing curtain), upscaled with a blur. A second, independently
// regenerating grain layer (MotionGrain's technique) is composited on top
// with 'overlay' blending so the smooth gradient picks up visible tooth —
// the grain is what turns a flat digital blend into something that looks
// screen-printed on paper.
const canvasRef = ref<HTMLCanvasElement | null>(null)
const grainRef = ref<HTMLCanvasElement | null>(null)
let raf = 0
let grainRaf = 0

interface Point {
  x: number
  y: number
  vx: number
  vy: number
  color: [number, number, number]
  radius: number
}

useGsapContext(() => {
  if (!canvasRef.value || !grainRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const ctx = canvas.getContext('2d')!

  const SCALE = 0.16
  let width = 0
  let height = 0
  let bufferW = 0
  let bufferH = 0
  let buf = ctx.createImageData(1, 1)
  const offscreen = document.createElement('canvas')
  const offCtx = offscreen.getContext('2d')!

  const navy: [number, number, number] = [11, 42, 61]
  const navy2: [number, number, number] = [11, 57, 84]
  const yellow: [number, number, number] = [251, 186, 0]
  const paper: [number, number, number] = [234, 241, 244]

  const points: Point[] = [
    { x: 0.18, y: 0.25, vx: 0.006, vy: 0.004, color: navy, radius: 0.42 },
    { x: 0.78, y: 0.2, vx: -0.005, vy: 0.005, color: navy2, radius: 0.38 },
    { x: 0.62, y: 0.75, vx: 0.004, vy: -0.006, color: yellow, radius: 0.3 },
    { x: 0.25, y: 0.8, vx: -0.004, vy: -0.003, color: paper, radius: 0.4 }
  ]

  function resize() {
    width = parent.clientWidth
    height = parent.clientHeight
    canvas.width = width
    canvas.height = height
    bufferW = Math.max(24, Math.floor(width * SCALE))
    bufferH = Math.max(24, Math.floor(height * SCALE))
    buf = ctx.createImageData(bufferW, bufferH)
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const pointer = { x: 0.5, y: 0.5, active: false }
  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    pointer.x = (e.clientX - rect.left) / rect.width
    pointer.y = (e.clientY - rect.top) / rect.height
    pointer.active = true
  }
  function onPointerLeave() {
    pointer.active = false
  }
  parent.addEventListener('pointermove', onPointerMove)
  parent.addEventListener('pointerleave', onPointerLeave)

  function tick() {
    if (!prefersReducedMotion) {
      points.forEach((p) => {
        p.x += p.vx * 0.016
        p.y += p.vy * 0.016
        if (p.x < 0.05 || p.x > 0.95) p.vx *= -1
        if (p.y < 0.05 || p.y > 0.95) p.vy *= -1
      })
    }

    const data = buf.data
    for (let py = 0; py < bufferH; py++) {
      const ny = py / bufferH
      for (let px = 0; px < bufferW; px++) {
        const nx = px / bufferW

        let r = 0
        let g = 0
        let b = 0
        let wSum = 0
        for (const p of points) {
          const dx = nx - p.x
          const dy = (ny - p.y) * (height / width || 1)
          const d2 = dx * dx + dy * dy
          const w = (p.radius * p.radius) / (d2 + 0.01)
          r += p.color[0] * w
          g += p.color[1] * w
          b += p.color[2] * w
          wSum += w
        }
        r /= wSum || 1
        g /= wSum || 1
        b /= wSum || 1

        if (pointer.active) {
          const dx = nx - pointer.x
          const dy = ny - pointer.y
          const d = Math.sqrt(dx * dx + dy * dy)
          const bloom = Math.max(0, 1 - d / 0.3) * 0.15
          r += (yellow[0] - r) * bloom
          g += (yellow[1] - g) * bloom
          b += (yellow[2] - b) * bloom
        }

        const idx = (py * bufferW + px) * 4
        data[idx] = Math.min(255, r)
        data[idx + 1] = Math.min(255, g)
        data[idx + 2] = Math.min(255, b)
        data[idx + 3] = 255
      }
    }

    offscreen.width = bufferW
    offscreen.height = bufferH
    offCtx.putImageData(buf, 0, 0)

    ctx.clearRect(0, 0, width, height)
    ctx.filter = 'blur(22px)'
    ctx.drawImage(offscreen, 0, 0, bufferW, bufferH, 0, 0, width, height)
    ctx.filter = 'none'

    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  // --- grain overlay: independently regenerating noise, low-res + upscaled ---
  const grainCanvas = grainRef.value
  const grainCtx = grainCanvas.getContext('2d')!
  const GRAIN_RES = 160
  grainCanvas.width = GRAIN_RES
  grainCanvas.height = GRAIN_RES
  const grainData = grainCtx.createImageData(GRAIN_RES, GRAIN_RES)

  function drawGrain() {
    const data = grainData.data
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255
      data[i] = v
      data[i + 1] = v
      data[i + 2] = v
      data[i + 3] = 20
    }
    grainCtx.putImageData(grainData, 0, 0)
  }

  let grainFrame = 0
  function grainTick() {
    grainFrame++
    if (grainFrame % 2 === 0) drawGrain()
    grainRaf = requestAnimationFrame(grainTick)
  }
  if (!prefersReducedMotion) grainRaf = requestAnimationFrame(grainTick)
  else drawGrain()

  return () => {
    cancelAnimationFrame(raf)
    cancelAnimationFrame(grainRaf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    parent.removeEventListener('pointerleave', onPointerLeave)
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
    <canvas ref="canvasRef" class="absolute inset-0 h-full w-full" />
    <canvas
      ref="grainRef"
      class="hero-grain absolute inset-0 h-full w-full opacity-[0.3] mix-blend-overlay"
    />
  </div>
</template>

<style scoped>
.hero-grain {
  image-rendering: pixelated;
}
</style>

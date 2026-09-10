<script setup lang="ts">
// 2D — Animated aurora gradient mesh via canvas (not CSS blur blobs). Uses
// layered, phase-shifted sine fields sampled per-pixel on a low-res
// offscreen buffer (like the liquid metal component's technique but tuned
// for a soft "aurora curtain" flow rather than discrete blobs) — smoother
// and more painterly than CSS radial-gradient blobs, and reacts to cursor
// as a local brightness bloom rather than a shape displacement.
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const ctx = canvas.getContext('2d')!

  const SCALE = 0.18
  let width = 0
  let height = 0
  let bufferW = 0
  let bufferH = 0
  let buf = ctx.createImageData(1, 1)
  const offscreen = document.createElement('canvas')
  const offCtx = offscreen.getContext('2d')!

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

  const pointer = { x: 0.5, y: 0.3, active: false }
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

  const navy: [number, number, number] = [11, 57, 84]
  const yellow: [number, number, number] = [251, 186, 0]
  const paper: [number, number, number] = [234, 241, 244]

  function tick() {
    const t = prefersReducedMotion ? 0 : performance.now() / 1000
    const data = buf.data

    for (let py = 0; py < bufferH; py++) {
      const ny = py / bufferH
      for (let px = 0; px < bufferW; px++) {
        const nx = px / bufferW
        const wave1 = Math.sin(nx * 3.2 + t * 0.25 + ny * 2.0) * 0.5 + 0.5
        const wave2 = Math.sin(nx * 5.5 - t * 0.18 + ny * 1.2) * 0.5 + 0.5
        const wave3 = Math.cos(ny * 4.0 + t * 0.12) * 0.5 + 0.5
        const mixT = wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2

        let r: number
        let g: number
        let b: number
        if (mixT < 0.5) {
          const localT = mixT * 2
          r = navy[0] + (paper[0] - navy[0]) * localT
          g = navy[1] + (paper[1] - navy[1]) * localT
          b = navy[2] + (paper[2] - navy[2]) * localT
        } else {
          const localT = (mixT - 0.5) * 2
          r = paper[0] + (yellow[0] - paper[0]) * localT
          g = paper[1] + (yellow[1] - paper[1]) * localT
          b = paper[2] + (yellow[2] - paper[2]) * localT
        }

        let bloom = 0
        if (pointer.active) {
          const dx = nx - pointer.x
          const dy = ny - pointer.y
          const d = Math.sqrt(dx * dx + dy * dy)
          bloom = Math.max(0, 1 - d / 0.35) * 0.35
        }

        const idx = (py * bufferW + px) * 4
        data[idx] = Math.min(255, r + bloom * 60)
        data[idx + 1] = Math.min(255, g + bloom * 60)
        data[idx + 2] = Math.min(255, b + bloom * 40)
        data[idx + 3] = 255
      }
    }

    offscreen.width = bufferW
    offscreen.height = bufferH
    offCtx.putImageData(buf, 0, 0)

    ctx.clearRect(0, 0, width, height)
    ctx.filter = 'blur(18px)'
    ctx.drawImage(offscreen, 0, 0, bufferW, bufferH, 0, 0, width, height)
    ctx.filter = 'none'

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
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-45 mix-blend-multiply">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>

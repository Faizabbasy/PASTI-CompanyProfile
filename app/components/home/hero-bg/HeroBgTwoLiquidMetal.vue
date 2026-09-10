<script setup lang="ts">
// 2D — Liquid metal gradient morph. A full-bleed canvas gradient blob whose
// shape is a metaball field (classic "liquid" look) rendered with 2D canvas
// — several circles with soft falloff, summed and thresholded per-pixel via
// an offscreen low-res buffer then upscaled (metaball technique), colored
// with a moving gradient. Cursor acts as an extra metaball, so the liquid
// visibly merges with/reacts to the pointer.
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

interface Blob {
  x: number
  y: number
  r: number
  vx: number
  vy: number
}

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const ctx = canvas.getContext('2d')!

  const SCALE = 0.22 // render at low res then upscale via CSS-sized canvas draw — cheap metaball field
  let width = 0
  let height = 0
  let bufferW = 0
  let bufferH = 0

  const blobs: Blob[] = Array.from({ length: 5 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.16 + Math.random() * 0.1,
    vx: (Math.random() - 0.5) * 0.02,
    vy: (Math.random() - 0.5) * 0.02
  }))
  const pointerBlob: Blob = { x: -1, y: -1, r: 0.14, vx: 0, vy: 0 }

  function resize() {
    width = parent.clientWidth
    height = parent.clientHeight
    canvas.width = width
    canvas.height = height
    bufferW = Math.max(32, Math.floor(width * SCALE))
    bufferH = Math.max(32, Math.floor(height * SCALE))
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const pointer = { x: -1, y: -1, active: false }
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

  const imageData = () => ctx.createImageData(bufferW, bufferH)
  let buf = imageData()

  const colorA = [11, 57, 84]
  const colorB = [251, 186, 0]

  function render(t: number) {
    if (buf.width !== bufferW || buf.height !== bufferH) buf = imageData()

    pointerBlob.x += ((pointer.active ? pointer.x : pointerBlob.x) - pointerBlob.x) * 0.15
    pointerBlob.y += ((pointer.active ? pointer.y : pointerBlob.y) - pointerBlob.y) * 0.15
    pointerBlob.r += ((pointer.active ? 0.16 : 0) - pointerBlob.r) * 0.1

    const activeBlobs = pointer.active ? [...blobs, pointerBlob] : blobs

    const data = buf.data
    for (let py = 0; py < bufferH; py++) {
      const ny = py / bufferH
      for (let px = 0; px < bufferW; px++) {
        const nx = px / bufferW
        let field = 0
        for (const b of activeBlobs) {
          const dx = nx - b.x
          const dy = (ny - b.y) * (height / width)
          const d2 = dx * dx + dy * dy
          field += (b.r * b.r) / (d2 + 0.0001)
        }
        const idx = (py * bufferW + px) * 4
        if (field > 1.1) {
          const glow = Math.min(1, (field - 1.1) / 1.5)
          const mixT = Math.min(1, ny + Math.sin(t * 0.3 + nx * 3) * 0.15)
          data[idx] = colorA[0]! + (colorB[0]! - colorA[0]!) * mixT
          data[idx + 1] = colorA[1]! + (colorB[1]! - colorA[1]!) * mixT
          data[idx + 2] = colorA[2]! + (colorB[2]! - colorA[2]!) * mixT
          data[idx + 3] = Math.min(255, glow * 200 + 40)
        } else {
          data[idx + 3] = 0
        }
      }
    }
  }

  const offscreen = document.createElement('canvas')
  const offCtx = offscreen.getContext('2d')!

  const clock = { start: performance.now() }
  function tick() {
    const t = prefersReducedMotion ? 0 : (performance.now() - clock.start) / 1000

    if (!prefersReducedMotion) {
      blobs.forEach((b) => {
        b.x += b.vx * 0.016
        b.y += b.vy * 0.016
        if (b.x < 0.05 || b.x > 0.95) b.vx *= -1
        if (b.y < 0.05 || b.y > 0.95) b.vy *= -1
      })
    }

    render(t)
    offscreen.width = bufferW
    offscreen.height = bufferH
    offCtx.putImageData(buf, 0, 0)

    ctx.clearRect(0, 0, width, height)
    ctx.imageSmoothingEnabled = true
    ctx.filter = 'blur(8px)'
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
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>

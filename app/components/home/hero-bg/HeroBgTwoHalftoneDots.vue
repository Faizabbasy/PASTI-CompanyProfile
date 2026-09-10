<script setup lang="ts">
// 2D — Classic print halftone / dot-screen. A regular grid of navy dots is
// drawn on canvas each frame with per-dot radius driven by a slow-moving
// sine noise field (stands in for the tonal value a halftone screen would
// encode from a photograph) so the field reads as light/dark regions made
// entirely of dot size, the way offset-press printing does. Dots near the
// cursor grow further, like a loupe pulling focus over the screen.
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const ctx = canvas.getContext('2d')!

  const CELL = 16 // px spacing between dot centers at 1x canvas scale
  let width = 0
  let height = 0
  let cols = 0
  let rows = 0
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
    cols = Math.ceil(width / CELL) + 1
    rows = Math.ceil(height / CELL) + 1
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

  const NAVY = '11, 57, 84'

  function tick() {
    const t = prefersReducedMotion ? 0 : performance.now() / 1000

    ctx.clearRect(0, 0, width, height)

    for (let gy = 0; gy < rows; gy++) {
      const cy = gy * CELL
      const ny = cy / height
      for (let gx = 0; gx < cols; gx++) {
        const cx = gx * CELL
        const nx = cx / width

        // slow-drifting tonal field standing in for a photographic source
        const field
          = Math.sin(nx * 4.5 + t * 0.15) * 0.5
          + Math.cos(ny * 3.8 - t * 0.1) * 0.35
          + Math.sin((nx + ny) * 5.2 + t * 0.08) * 0.25
        const tone = (field + 1) / 2 // 0..1

        let radius = tone * (CELL * 0.46)

        if (pointer.active) {
          const dx = cx - pointer.x
          const dy = cy - pointer.y
          const d = Math.sqrt(dx * dx + dy * dy)
          const proximity = Math.max(0, 1 - d / 140)
          radius += proximity * CELL * 0.32
        }

        if (radius < 0.4) continue

        ctx.beginPath()
        ctx.fillStyle = `rgba(${NAVY}, ${0.15 + tone * 0.55})`
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
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
    parent.removeEventListener('pointerleave', onPointerLeave)
  }
})
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 overflow-hidden opacity-90"
    style="background-color: #eaf1f4"
  >
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>

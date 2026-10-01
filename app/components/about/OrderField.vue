<script setup lang="ts">
// "Complexity → Certainty" field — the brand promise as an interaction.
// A grid of short strokes starts scattered (random angle + offset). Strokes
// near the pointer / finger snap into perfect alignment, and the `order`
// prop (scroll progress, 0–1) aligns the whole field. A handful of strokes
// are PASTI Yellow. 2D canvas, paused off-screen; reduced motion renders the
// ordered state once.
const props = withDefaults(defineProps<{ order?: number }>(), { order: 0 })

const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return
  const host = canvas.parentElement!
  const reduce = window.matchMedia(reducedMotionQuery.reduce).matches

  type Stroke = { x: number; y: number; a: number; dx: number; dy: number; t: number; yellow: boolean; phase: number }
  let strokes: Stroke[] = []
  let w = 0
  let h = 0
  let gap = 36
  const pointer = { x: -9999, y: -9999, active: false }

  const rand = (seed: number) => {
    const s = Math.sin(seed * 9301 + 49297) * 233280
    return s - Math.floor(s)
  }

  const layout = () => {
    const r = host.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = r.width
    h = r.height
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    gap = w < 640 ? 30 : 38
    strokes = []
    let n = 0
    const ox = (w % gap) / 2 + gap / 2
    const oy = (h % gap) / 2 + gap / 2
    for (let y = oy; y < h; y += gap) {
      for (let x = ox; x < w; x += gap) {
        n++
        strokes.push({
          x,
          y,
          a: (rand(n) - 0.5) * Math.PI * 1.6,
          dx: (rand(n + 0.31) - 0.5) * gap * 0.9,
          dy: (rand(n + 0.77) - 0.5) * gap * 0.9,
          t: 0,
          yellow: rand(n + 0.5) > 0.965,
          phase: rand(n + 0.13) * Math.PI * 2
        })
      }
    }
  }

  let time = 0
  const draw = (instant = false) => {
    ctx.clearRect(0, 0, w, h)
    const radius = Math.min(260, Math.max(150, w * 0.17))
    const len = gap * 0.42
    for (const s of strokes) {
      const d = Math.hypot(s.x - pointer.x, s.y - pointer.y)
      const near = pointer.active ? Math.max(0, 1 - d / radius) : 0
      const goal = Math.min(1, Math.max(props.order, near * 1.15))
      s.t = instant ? goal : s.t + (goal - s.t) * 0.12
      const k = s.t
      const drift = (1 - k) * Math.sin(time * 0.6 + s.phase) * 0.18
      const ang = s.a * (1 - k) + drift
      const cx = s.x + s.dx * (1 - k)
      const cy = s.y + s.dy * (1 - k)
      const hx = Math.cos(ang) * len * (0.7 + 0.3 * k)
      const hy = Math.sin(ang) * len * (0.7 + 0.3 * k)
      ctx.strokeStyle = s.yellow ? `rgba(251, 186, 0, ${0.55 + 0.45 * k})` : `rgba(3, 60, 89, ${0.16 + 0.42 * k})`
      ctx.lineWidth = s.yellow ? 2 : 1.4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(cx - hx, cy - hy)
      ctx.lineTo(cx + hx, cy + hy)
      ctx.stroke()
    }
  }

  layout()
  if (reduce) {
    strokes.forEach((s) => (s.t = 1))
    draw(true)
    return
  }
  draw()

  let raf = 0
  let running = false
  const loop = () => {
    time += 1 / 60
    draw()
    raf = requestAnimationFrame(loop)
  }
  const start = () => {
    if (!running) {
      running = true
      raf = requestAnimationFrame(loop)
    }
  }
  const stop = () => {
    running = false
    cancelAnimationFrame(raf)
  }
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    pointer.x = e.clientX - r.left
    pointer.y = e.clientY - r.top
    pointer.active = true
  }
  const onLeave = () => {
    pointer.active = false
  }

  const io = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? start() : stop()))
  io.observe(host)
  const ro = new ResizeObserver(() => layout())
  ro.observe(host)
  host.addEventListener('pointermove', onMove, { passive: true })
  host.addEventListener('pointerdown', onMove, { passive: true })
  host.addEventListener('pointerleave', onLeave)

  onBeforeUnmount(() => {
    stop()
    io.disconnect()
    ro.disconnect()
    host.removeEventListener('pointermove', onMove)
    host.removeEventListener('pointerdown', onMove)
    host.removeEventListener('pointerleave', onLeave)
  })
})
</script>

<template>
  <canvas ref="canvasRef" aria-hidden="true" class="pointer-events-none absolute inset-0 block" />
</template>

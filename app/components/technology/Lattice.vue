<script setup lang="ts">
// Signal lattice — the Technology hero's interactive field. A quiet grid of
// points (the 12-column precision grid, made granular); the pointer (or a
// finger on touch) becomes a Signal node: nearby points brighten, swell and
// ease away, and thin Cobalt lines connect them to the node like a live
// network. With no input for a moment, the node drifts on its own path so the
// field never looks dead. 2D canvas, not WebGL; paused while off-screen;
// under reduced motion it renders one static frame.
// `tone="light"` (2026-10-05): navy points + stronger yellow links for the
// light hero ground the page heroes now share with the homepage.
const props = withDefaults(defineProps<{ tone?: 'dark' | 'light' }>(), { tone: 'dark' })
const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return
  const host = canvas.parentElement!
  const reduce = window.matchMedia(reducedMotionQuery.reduce).matches
  const light = props.tone === 'light'
  const restFill = light ? 'rgba(3, 60, 89, 0.16)' : 'rgba(255, 222, 140, 0.14)'

  let w = 0
  let h = 0
  let dpr = 1
  let gap = 34
  let points: { x: number; y: number }[] = []

  const layout = () => {
    const r = host.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = r.width
    h = r.height
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    gap = w < 640 ? 28 : 34
    points = []
    const ox = (w % gap) / 2
    const oy = (h % gap) / 2
    for (let y = oy; y <= h; y += gap) for (let x = ox; x <= w; x += gap) points.push({ x, y })
  }

  // Node position: smoothed toward the pointer, or an idle Lissajous drift.
  const node = { x: 0, y: 0 }
  const target = { x: 0, y: 0 }
  let lastInput = -Infinity
  let t = 0

  const draw = () => {
    const radius = Math.min(220, Math.max(140, w * 0.16))
    ctx.clearRect(0, 0, w, h)

    // Connections first, so points sit on top of the lines.
    ctx.lineWidth = 1
    for (const p of points) {
      const dx = p.x - node.x
      const dy = p.y - node.y
      const d = Math.hypot(dx, dy)
      if (d < radius * 0.62) {
        const a = (1 - d / (radius * 0.62)) * (light ? 0.8 : 0.55)
        ctx.strokeStyle = `rgba(251, 186, 0, ${a.toFixed(3)})`
        ctx.beginPath()
        ctx.moveTo(node.x, node.y)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
      }
    }

    for (const p of points) {
      const dx = p.x - node.x
      const dy = p.y - node.y
      const d = Math.hypot(dx, dy) || 1
      const k = Math.max(0, 1 - d / radius)
      const push = k * k * 10
      const x = p.x + (dx / d) * push
      const y = p.y + (dy / d) * push
      ctx.fillStyle = k > 0
        ? light
          ? `rgba(${Math.round(3 + 248 * k)}, ${Math.round(60 + 126 * k)}, ${Math.round(89 - 89 * k)}, ${(0.16 + 0.8 * k).toFixed(3)})`
          : `rgba(255, ${Math.round(222 - 36 * k)}, ${Math.round(140 - 140 * k)}, ${(0.14 + 0.8 * k).toFixed(3)})`
        : restFill
      ctx.beginPath()
      ctx.arc(x, y, 1 + 1.4 * k, 0, Math.PI * 2)
      ctx.fill()
    }

    // The node itself: PASTI Yellow point + soft ring.
    ctx.fillStyle = '#FBBA00'
    ctx.beginPath()
    ctx.arc(node.x, node.y, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(251, 186, 0, 0.35)'
    ctx.beginPath()
    ctx.arc(node.x, node.y, 14 + Math.sin(t * 2) * 2, 0, Math.PI * 2)
    ctx.stroke()
  }

  const tick = () => {
    t += 1 / 60
    const idle = performance.now() - lastInput > 2200
    if (idle) {
      target.x = w * (0.62 + 0.26 * Math.sin(t * 0.35))
      target.y = h * (0.5 + 0.28 * Math.sin(t * 0.52 + 1.2))
    }
    const ease = idle ? 0.03 : 0.14
    node.x += (target.x - node.x) * ease
    node.y += (target.y - node.y) * ease
    draw()
  }

  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    target.x = e.clientX - r.left
    target.y = e.clientY - r.top
    lastInput = performance.now()
  }

  layout()
  node.x = target.x = w * 0.66
  node.y = target.y = h * 0.5
  draw()
  if (reduce) return

  let raf = 0
  let running = false
  const gate = createFrameGate()
  const loop = () => {
    if (gate()) tick()
    raf = requestAnimationFrame(loop)
  }
  const start = () => {
    if (running) return
    running = true
    raf = requestAnimationFrame(loop)
  }
  const stop = () => {
    running = false
    cancelAnimationFrame(raf)
  }

  const io = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? start() : stop()))
  io.observe(host)
  const ro = new ResizeObserver(() => layout())
  ro.observe(host)
  host.addEventListener('pointermove', onPointer, { passive: true })
  host.addEventListener('pointerdown', onPointer, { passive: true })

  onBeforeUnmount(() => {
    stop()
    io.disconnect()
    ro.disconnect()
    host.removeEventListener('pointermove', onPointer)
    host.removeEventListener('pointerdown', onPointer)
  })
})
</script>

<template>
  <canvas ref="canvasRef" aria-hidden="true" class="pointer-events-none absolute inset-0 block" />
</template>

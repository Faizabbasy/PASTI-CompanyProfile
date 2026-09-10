<script setup lang="ts">
// 2D — Inspired by Lusion's Awwwards Site of the Month technique: "a scroll
// that moves the camera through true Z-axis depth rather than sliding 2D
// layers" (their coaster launch site rendered this live in Three.js). Faked
// here with flat canvas 2D: several depth "layers" of simple brand shapes
// are each continuously scaled up and faded out on independent clocks,
// simulating flying forward through them — the moment a layer would grow
// too large/opaque it silently resets to small/distant and starts again,
// so the loop reads as a seamless infinite dolly through space rather than
// a visible reset.
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

interface DepthShape {
  baseX: number // normalized center x
  baseY: number // normalized center y
  kind: 'circle' | 'ring' | 'square'
  color: string
  phase: number // 0..1 progress through its own flight cycle
  speed: number // cycles per second
  maxScale: number
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
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const colors = ['#0B3954', '#0B2A3D', '#FBBA00', '#EAF1F4']
  const kinds: DepthShape['kind'][] = ['circle', 'ring', 'square']

  const shapes: DepthShape[] = Array.from({ length: 18 }, (_, i) => ({
    baseX: 0.15 + ((i * 0.61) % 1) * 0.7,
    baseY: 0.15 + ((i * 0.37) % 1) * 0.7,
    kind: kinds[i % kinds.length]!,
    color: colors[i % colors.length]!,
    phase: (i / 18),
    speed: 0.045 + (i % 5) * 0.006,
    maxScale: 0.9 + (i % 4) * 0.35
  }))

  function drawShape(s: DepthShape, cx: number, cy: number, radius: number, alpha: number) {
    ctx.globalAlpha = alpha
    ctx.fillStyle = s.color
    ctx.strokeStyle = s.color
    ctx.lineWidth = Math.max(1, radius * 0.06)

    if (s.kind === 'circle') {
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fill()
    } else if (s.kind === 'ring') {
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(radius * 0.01)
      ctx.strokeRect(-radius * 0.7, -radius * 0.7, radius * 1.4, radius * 1.4)
      ctx.restore()
    }
    ctx.globalAlpha = 1
  }

  let lastT = performance.now()
  function tick() {
    const now = performance.now()
    const dt = prefersReducedMotion ? 0 : (now - lastT) / 1000
    lastT = now

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#0B2A3D'
    ctx.fillRect(0, 0, width, height)

    const shortSide = Math.min(width, height)

    // sort back-to-front so nearer (larger phase) shapes draw on top
    const ordered = [...shapes].sort((a, b) => a.phase - b.phase)

    ordered.forEach((s) => {
      s.phase = (s.phase + s.speed * dt) % 1

      // ease-in growth: slow when "far", accelerating as it approaches
      const eased = s.phase * s.phase
      const scale = 0.05 + eased * s.maxScale
      const radius = scale * shortSide * 0.5

      // fade in quickly, hold, then fade out just before reset
      let alpha = 1
      if (s.phase < 0.08) alpha = s.phase / 0.08
      else if (s.phase > 0.82) alpha = Math.max(0, (1 - s.phase) / 0.18)
      alpha *= 0.5

      const cx = s.baseX * width
      const cy = s.baseY * height

      drawShape(s, cx, cy, radius, alpha)
    })

    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>

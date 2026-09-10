<script setup lang="ts">
import gsap from 'gsap'

// 2D — Inspired by Iventions' Awwwards Site of the Day: "treats each project
// like a spotlit installation, with GSAP pacing the reveals so the page
// reads like a guided walk-through." Re-authored in flat canvas 2D: a dark
// navy field carries a faint dot-grid pattern; one soft circular spotlight
// of warm paper/yellow light travels a fixed, GSAP-timed path (a museum
// spotlight rig on a timer, not cursor-following) via a proxy object tweened
// through waypoints. Wherever the light currently sits, the pattern beneath
// it brightens; once the light moves on, that patch fades back to near-
// invisible — same restrained, deliberate pacing as the source site.
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

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

  // pre-choreographed path in normalized 0..1 space — a fixed rig sweep,
  // not cursor-following and not random.
  const waypoints = [
    { x: 0.15, y: 0.25 },
    { x: 0.5, y: 0.15 },
    { x: 0.82, y: 0.35 },
    { x: 0.7, y: 0.75 },
    { x: 0.3, y: 0.8 }
  ]

  const spot = { x: waypoints[0]!.x, y: waypoints[0]!.y, radius: 0.22 }

  const DOT_SPACING = 34

  function draw() {
    ctx.fillStyle = '#0B2A3D'
    ctx.fillRect(0, 0, width, height)

    const cx = spot.x * width
    const cy = spot.y * height
    const r = spot.radius * Math.max(width, height)

    // faint dot-grid pattern, brightened only within the spotlight radius
    for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
      for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
        const dx = x - cx
        const dy = y - cy
        const d = Math.sqrt(dx * dx + dy * dy)
        const t = Math.max(0, 1 - d / r)
        if (t <= 0.01) continue
        const alpha = 0.03 + t * 0.5
        ctx.fillStyle = `rgba(251, 186, 0, ${alpha})`
        const size = 1 + t * 1.6
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // soft radial glow for the spotlight itself
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    gradient.addColorStop(0, 'rgba(234, 241, 244, 0.12)')
    gradient.addColorStop(0.6, 'rgba(251, 186, 0, 0.06)')
    gradient.addColorStop(1, 'rgba(251, 186, 0, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }

  function tick() {
    draw()
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  let tl: gsap.core.Timeline | null = null
  if (!prefersReducedMotion) {
    tl = gsap.timeline({ repeat: -1 })
    waypoints.forEach((wp, i) => {
      const next = waypoints[(i + 1) % waypoints.length]!
      tl!.to(spot, { x: next.x, y: next.y, duration: 3.4, ease: 'power2.inOut' })
      tl!.to(spot, { radius: 0.26, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 1 }, '<')
      tl!.to({}, { duration: 0.8 }) // hold beat at each waypoint before moving on
    })
  }

  return () => {
    cancelAnimationFrame(raf)
    tl?.kill()
    resizeObserver.disconnect()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>

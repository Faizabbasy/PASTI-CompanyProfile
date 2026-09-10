<script setup lang="ts">
// Interactive — Velocity distortion. Inspired by Active Theory's philosophy
// that "the engine reacts to how you move, not just where you are": a canvas
// grid of short line segments tracks the CURSOR'S CURRENT VELOCITY, computed
// as the delta between this frame's and last frame's pointer position divided
// by elapsed time — not just proximity. Nearby segments stretch and rotate
// to align with that velocity vector, streaking visibly during fast swipes
// and relaxing back to their calm resting orientation the instant the cursor
// slows or stops. A trailing velocity magnitude (eased) also drives a subtle
// motion-blur-style alpha smear so fast movement reads as genuine streak,
// not just a static tilt.
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

interface Segment {
  x: number
  y: number
  angle: number
  stretch: number
}

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const ctx = canvas.getContext('2d')!

  const SPACING = 42
  let width = 0
  let height = 0
  let dpr = 1
  let segments: Segment[] = []

  function buildSegments() {
    segments = []
    const cols = Math.ceil(width / SPACING) + 1
    const rows = Math.ceil(height / SPACING) + 1
    for (let iy = 0; iy < rows; iy++) {
      for (let ix = 0; ix < cols; ix++) {
        segments.push({ x: ix * SPACING, y: iy * SPACING, angle: 0, stretch: 1 })
      }
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = parent.clientWidth
    height = parent.clientHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    buildSegments()
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const pointer = { x: -9999, y: -9999, active: false }
  const prevPointer = { x: -9999, y: -9999 }
  const velocity = { x: 0, y: 0, speed: 0 }
  let easedSpeed = 0
  let lastMoveTime = performance.now() / 1000

  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    pointer.x = e.clientX - rect.left
    pointer.y = e.clientY - rect.top
    pointer.active = true
    lastMoveTime = performance.now() / 1000
  }
  function onPointerLeave() {
    pointer.active = false
  }
  parent.addEventListener('pointermove', onPointerMove)
  parent.addEventListener('pointerleave', onPointerLeave)

  const RADIUS = 220
  const clockStart = performance.now() / 1000
  let lastTime = 0

  function tick() {
    const now = performance.now() / 1000 - clockStart
    const dt = Math.max(Math.min(now - lastTime, 1 / 20), 1 / 240)
    lastTime = now

    if (!prefersReducedMotion && pointer.active) {
      const rawVx = (pointer.x - prevPointer.x) / dt
      const rawVy = (pointer.y - prevPointer.y) / dt
      velocity.x += (rawVx - velocity.x) * 0.4
      velocity.y += (rawVy - velocity.y) * 0.4
      velocity.speed = Math.hypot(velocity.x, velocity.y)
    } else {
      velocity.x *= 0.85
      velocity.y *= 0.85
      velocity.speed *= 0.85
    }
    prevPointer.x = pointer.x
    prevPointer.y = pointer.y

    // Idle cursor (no movement for a beat) settles everything to calm even
    // while technically "active" (still inside the element, just not moving).
    const idleFor = performance.now() / 1000 - lastMoveTime
    const activity = pointer.active && idleFor < 0.15 ? 1 : 0
    easedSpeed += (velocity.speed * activity - easedSpeed) * 0.15

    const moveAngle = Math.atan2(velocity.y, velocity.x)

    ctx.clearRect(0, 0, width, height)
    ctx.lineCap = 'round'

    for (const seg of segments) {
      let targetAngle = 0
      let targetStretch = 1
      let alpha = 0.22

      if (pointer.active) {
        const dx = seg.x - pointer.x
        const dy = seg.y - pointer.y
        const dist = Math.hypot(dx, dy)
        if (dist < RADIUS) {
          const falloff = 1 - dist / RADIUS
          targetAngle = moveAngle
          targetStretch = 1 + Math.min(easedSpeed / 900, 1) * falloff * 3.2
          alpha = 0.22 + falloff * Math.min(easedSpeed / 1200, 1) * 0.55
        }
      }

      seg.angle += (targetAngle - seg.angle) * 0.25
      seg.stretch += (targetStretch - seg.stretch) * 0.2

      const len = 5 * seg.stretch
      ctx.save()
      ctx.translate(seg.x, seg.y)
      ctx.rotate(seg.angle)
      ctx.strokeStyle = seg.stretch > 1.4 ? `rgba(251, 186, 0, ${alpha})` : `rgba(11, 57, 84, ${alpha})`
      ctx.lineWidth = seg.stretch > 1.4 ? 1.6 : 1.2
      ctx.beginPath()
      ctx.moveTo(-len / 2, 0)
      ctx.lineTo(len / 2, 0)
      ctx.stroke()
      ctx.restore()
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
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-80">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>

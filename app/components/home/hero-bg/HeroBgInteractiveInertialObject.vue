<script setup lang="ts">
// Interactive — Inertial object. Inspired by Lusion's award-winning approach
// of rendering ONE hero object with real simulated weight rather than a
// scene of many things. A single bold ring outline is drawn on canvas; the
// cursor sets a target offset + target spin, and a 2D spring-damper (linear
// AND angular, each integrated with its own stiffness/damping every frame)
// chases that target — so a fast flick makes the ring overshoot its resting
// position and wobble/settle back, like a weighted object on a string,
// rather than snapping straight to the pointer. No shader, no particles:
// the entire "real mass" illusion comes from the spring integration below.
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
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = parent.clientWidth
    height = parent.clientHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  // Linear spring-damper: position/velocity chase a pointer-derived target.
  const pos = { x: 0, y: 0 }
  const vel = { x: 0, y: 0 }
  const target = { x: 0, y: 0 }
  const linStiffness = 0.05
  const linDamping = 0.88

  // Angular spring-damper: independent rotation + spin momentum, driven by
  // lateral velocity of the pointer target — sharp direction changes impart
  // real torque, so the ring keeps spinning/wobbling after the cursor stops.
  const angle = { value: 0 }
  const spin = { value: 0 }
  let prevTargetX = 0

  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    target.x = nx * Math.min(width, height) * 0.5
    target.y = ny * Math.min(width, height) * 0.5
  }
  function onPointerLeave() {
    target.x = 0
    target.y = 0
  }
  parent.addEventListener('pointermove', onPointerMove)
  parent.addEventListener('pointerleave', onPointerLeave)

  function draw(t: number) {
    ctx.clearRect(0, 0, width, height)
    const cx = width / 2 + pos.x
    const cy = height / 2 + pos.y
    const radius = Math.min(width, height) * 0.22
    const wobble = prefersReducedMotion ? 0 : Math.sin(t * 2.4) * 0.015

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle.value)

    ctx.lineWidth = 3
    ctx.strokeStyle = '#FBBA00'
    ctx.beginPath()
    ctx.ellipse(0, 0, radius * (1 + wobble), radius * (1 - wobble), 0, 0, Math.PI * 2)
    ctx.stroke()

    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(11, 57, 84, 0.5)'
    ctx.beginPath()
    ctx.ellipse(0, 0, radius * 0.62, radius * 0.62, 0, 0, Math.PI * 2)
    ctx.stroke()

    // A single marker on the outer ring makes the spin/torque visible.
    ctx.fillStyle = '#0B2A3D'
    ctx.beginPath()
    ctx.arc(radius, 0, 4.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  const clockStart = performance.now() / 1000
  let lastTime = 0
  function tick() {
    const now = performance.now() / 1000 - clockStart
    const dt = Math.min(now - lastTime, 1 / 30)
    lastTime = now

    if (!prefersReducedMotion) {
      const accelX = (target.x - pos.x) * linStiffness - vel.x * linDamping * 0.06
      const accelY = (target.y - pos.y) * linStiffness - vel.y * linDamping * 0.06
      vel.x = (vel.x + accelX) * (1 - linDamping * 0.02)
      vel.y = (vel.y + accelY) * (1 - linDamping * 0.02)
      pos.x += vel.x
      pos.y += vel.y

      // Torque from lateral target velocity feeds angular spin, which is
      // itself damped — the ring keeps turning briefly after input stops.
      const targetVelX = target.x - prevTargetX
      prevTargetX = target.x
      spin.value += targetVelX * 0.0022
      spin.value *= 0.94
      angle.value += spin.value
    } else {
      pos.x = target.x
      pos.y = target.y
    }

    draw(now)
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
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>

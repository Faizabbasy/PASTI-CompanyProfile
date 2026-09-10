<script setup lang="ts">
// Interactive — Room transition. Inspired by Immersive Garden's Cartier
// digital-twin work: distinct rooms/alcoves the visitor moves through, with
// hidden gestures that reward curiosity rather than visible UI. The hero
// area is silently divided into three vertical zones (no borders, no labels
// drawn); as the cursor's X position crosses from one zone into the next,
// the ambient background gradient tone and a fine pattern's density both
// smoothly retarget toward that zone's own palette/density via eased
// interpolation each tick — discovering the shift by moving around IS the
// reward. Pure canvas 2D, cheap per-frame cost (one gradient fill + a sparse
// dot pass).
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

interface Room {
  colorA: [number, number, number]
  colorB: [number, number, number]
  density: number
}

const rooms: Room[] = [
  { colorA: [11, 42, 61], colorB: [11, 57, 84], density: 46 }, // navy, sparse
  { colorA: [11, 57, 84], colorB: [16, 40, 30], density: 30 }, // warmer, mid density
  { colorA: [11, 42, 61], colorB: [30, 24, 10], density: 20 } // amber-tinted, dense
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
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

  // Current eased state — a virtual "room mix" blending toward whichever
  // zone the cursor currently occupies, so crossing a boundary transitions
  // smoothly rather than snapping.
  const state = {
    colorA: [...rooms[0]!.colorA] as [number, number, number],
    colorB: [...rooms[0]!.colorB] as [number, number, number],
    density: rooms[0]!.density
  }
  let targetRoomIndex = 0

  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width
    targetRoomIndex = nx < 1 / 3 ? 0 : nx < 2 / 3 ? 1 : 2
  }
  parent.addEventListener('pointermove', onPointerMove)

  const EASE = 0.035

  function draw() {
    const target = rooms[targetRoomIndex]!
    state.colorA[0] = lerp(state.colorA[0], target.colorA[0], EASE)
    state.colorA[1] = lerp(state.colorA[1], target.colorA[1], EASE)
    state.colorA[2] = lerp(state.colorA[2], target.colorA[2], EASE)
    state.colorB[0] = lerp(state.colorB[0], target.colorB[0], EASE)
    state.colorB[1] = lerp(state.colorB[1], target.colorB[1], EASE)
    state.colorB[2] = lerp(state.colorB[2], target.colorB[2], EASE)
    state.density = lerp(state.density, target.density, EASE)

    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, `rgb(${state.colorA[0]}, ${state.colorA[1]}, ${state.colorA[2]})`)
    gradient.addColorStop(1, `rgb(${state.colorB[0]}, ${state.colorB[1]}, ${state.colorB[2]})`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    const spacing = Math.max(14, state.density)
    ctx.fillStyle = 'rgba(251, 186, 0, 0.12)'
    for (let y = spacing / 2; y < height; y += spacing) {
      for (let x = spacing / 2; x < width; x += spacing) {
        ctx.beginPath()
        ctx.arc(x, y, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  function tick() {
    draw()
    raf = requestAnimationFrame(tick)
  }

  if (prefersReducedMotion) {
    // Keep pointer-driven zone response (user-initiated), draw once per
    // move instead of a continuous rAF loop, and skip the eased blend so
    // there's no ambient drift.
    draw()
    parent.addEventListener('pointermove', () => {
      state.colorA = [...rooms[targetRoomIndex]!.colorA]
      state.colorB = [...rooms[targetRoomIndex]!.colorB]
      state.density = rooms[targetRoomIndex]!.density
      draw()
    })
  } else {
    raf = requestAnimationFrame(tick)
  }

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>

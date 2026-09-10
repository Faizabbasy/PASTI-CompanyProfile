<script setup lang="ts">
import gsap from 'gsap'

// 2D — Inspired by Uncommon Studio's Awwwards Site of the Day / Developer
// Award-winning technique: "what wins here is rhythm — a confident grid
// that breaks rhythm" at exactly the right moments. A clean grid of thin
// lines is drawn on canvas; a GSAP timeline (deliberate, deterministic
// timing — not randomness) periodically picks one row or one column and
// sharply displaces it sideways/downward with a snappy non-bouncy ease,
// holds a beat, then snaps back — like a heartbeat in an otherwise static
// grid — before moving on to a different line. The choreography is a fixed
// sequence, not procedural noise, so it reads as intentional.
const canvasRef = ref<HTMLCanvasElement | null>(null)

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const ctx = canvas.getContext('2d')!

  const COLS = 12
  const ROWS = 8
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

  // break state: which line is currently displaced, by how much, and axis
  const state = {
    axis: 'row' as 'row' | 'col',
    index: -1,
    offset: 0
  }

  function draw() {
    ctx.clearRect(0, 0, width, height)
    ctx.strokeStyle = 'rgba(11, 57, 84, 0.22)'
    ctx.lineWidth = 1

    // vertical lines (columns)
    for (let c = 0; c <= COLS; c++) {
      const baseX = (c / COLS) * width
      const shiftTop = state.axis === 'col' && c === state.index ? state.offset : 0
      ctx.beginPath()
      ctx.moveTo(baseX + shiftTop, 0)
      ctx.lineTo(baseX, height)
      ctx.stroke()
    }

    // horizontal lines (rows)
    for (let r = 0; r <= ROWS; r++) {
      const baseY = (r / ROWS) * height
      const shiftLeft = state.axis === 'row' && r === state.index ? state.offset : 0
      ctx.beginPath()
      ctx.moveTo(0, baseY + shiftLeft)
      ctx.lineTo(width, baseY)
      ctx.stroke()
    }
  }
  draw()

  if (prefersReducedMotion) {
    return () => {
      resizeObserver.disconnect()
    }
  }

  const tl = gsap.timeline({ repeat: -1 })
  const sequence: { axis: 'row' | 'col'; index: number }[] = [
    { axis: 'row', index: 2 },
    { axis: 'col', index: 8 },
    { axis: 'row', index: 6 },
    { axis: 'col', index: 3 },
    { axis: 'row', index: 4 }
  ]

  sequence.forEach((step) => {
    tl.call(() => {
      state.axis = step.axis
      state.index = step.index
    })
    tl.to(state, {
      offset: step.axis === 'row' ? 34 : 26,
      duration: 0.22,
      ease: 'power4.out',
      onUpdate: draw
    })
    tl.to(state, {
      offset: 0,
      duration: 0.5,
      ease: 'power3.inOut',
      onUpdate: draw
    }, '+=0.18')
    tl.call(() => {
      state.index = -1
      draw()
    }, undefined, '+=1.2')
  })

  return () => {
    tl.kill()
    resizeObserver.disconnect()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-80">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>

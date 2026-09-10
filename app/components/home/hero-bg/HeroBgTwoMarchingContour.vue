<script setup lang="ts">
// 2D — Marching-squares contour field. A scalar field made of a few moving
// "charge" points is sampled on a grid and contoured with the marching
// squares algorithm each frame (canvas 2D), producing smooth topographic-
// map-style isolines that continuously reshape — a technique seen on
// generative-art-leaning agency sites, distinct from simple SVG bezier
// lines because the *topology* (how many loops, where they merge/split)
// changes live rather than a fixed path deforming.
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

interface Charge {
  x: number
  y: number
  vx: number
  vy: number
  strength: number
}

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const ctx = canvas.getContext('2d')!

  const GRID = 48
  let width = 0
  let height = 0
  let cellW = 0
  let cellH = 0
  const field: number[] = new Array((GRID + 1) * (GRID + 1)).fill(0)

  const charges: Charge[] = Array.from({ length: 4 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.06,
    vy: (Math.random() - 0.5) * 0.06,
    strength: 0.6 + Math.random() * 0.4
  }))
  const pointerCharge: Charge = { x: -1, y: -1, vx: 0, vy: 0, strength: 0.9 }

  function resize() {
    width = parent.clientWidth
    height = parent.clientHeight
    canvas.width = width
    canvas.height = height
    cellW = width / GRID
    cellH = height / GRID
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

  function sampleField(nx: number, ny: number, activeCharges: Charge[]): number {
    let v = 0
    for (const c of activeCharges) {
      const dx = nx - c.x
      const dy = (ny - c.y) * (height / width)
      v += c.strength / (dx * dx + dy * dy + 0.002)
    }
    return v
  }

  const THRESHOLD = 9

  function marchAndDraw(activeCharges: Charge[]) {
    for (let gy = 0; gy <= GRID; gy++) {
      for (let gx = 0; gx <= GRID; gx++) {
        field[gy * (GRID + 1) + gx] = sampleField(gx / GRID, gy / GRID, activeCharges)
      }
    }

    ctx.clearRect(0, 0, width, height)
    ctx.strokeStyle = '#0B3954'
    ctx.lineWidth = 1.25
    ctx.globalAlpha = 0.5
    ctx.beginPath()

    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const tl = field[gy * (GRID + 1) + gx]! > THRESHOLD ? 1 : 0
        const tr = field[gy * (GRID + 1) + gx + 1]! > THRESHOLD ? 1 : 0
        const br = field[(gy + 1) * (GRID + 1) + gx + 1]! > THRESHOLD ? 1 : 0
        const bl = field[(gy + 1) * (GRID + 1) + gx]! > THRESHOLD ? 1 : 0
        const state = (tl << 3) | (tr << 2) | (br << 1) | bl
        if (state === 0 || state === 15) continue

        const x0 = gx * cellW
        const y0 = gy * cellH
        const midTop: [number, number] = [x0 + cellW / 2, y0]
        const midBottom: [number, number] = [x0 + cellW / 2, y0 + cellH]
        const midLeft: [number, number] = [x0, y0 + cellH / 2]
        const midRight: [number, number] = [x0 + cellW, y0 + cellH / 2]

        const segments: [number, number][][] = []
        switch (state) {
          case 1: case 14: segments.push([midLeft, midBottom]); break
          case 2: case 13: segments.push([midBottom, midRight]); break
          case 3: case 12: segments.push([midLeft, midRight]); break
          case 4: case 11: segments.push([midTop, midRight]); break
          case 5: segments.push([midLeft, midTop], [midBottom, midRight]); break
          case 6: case 9: segments.push([midTop, midBottom]); break
          case 7: case 8: segments.push([midLeft, midTop]); break
          case 10: segments.push([midTop, midRight], [midLeft, midBottom]); break
        }
        for (const [[ax, ay], [bx, by]] of segments) {
          ctx.moveTo(ax, ay)
          ctx.lineTo(bx, by)
        }
      }
    }
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  const clock = { start: performance.now() }
  function tick() {
    const t = prefersReducedMotion ? 0 : (performance.now() - clock.start) / 1000

    if (!prefersReducedMotion) {
      charges.forEach((c) => {
        c.x += c.vx * 0.016
        c.y += c.vy * 0.016
        if (c.x < 0.05 || c.x > 0.95) c.vx *= -1
        if (c.y < 0.05 || c.y > 0.95) c.vy *= -1
      })
    }

    pointerCharge.x += ((pointer.active ? pointer.x : pointerCharge.x) - pointerCharge.x) * 0.15
    pointerCharge.y += ((pointer.active ? pointer.y : pointerCharge.y) - pointerCharge.y) * 0.15
    pointerCharge.strength += ((pointer.active ? 1.1 : 0) - pointerCharge.strength) * 0.1

    const activeCharges = pointer.active || pointerCharge.strength > 0.05 ? [...charges, pointerCharge] : charges
    marchAndDraw(activeCharges)
    void t

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

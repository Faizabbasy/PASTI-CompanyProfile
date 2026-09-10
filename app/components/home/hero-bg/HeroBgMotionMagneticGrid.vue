<script setup lang="ts">
import gsap from 'gsap'

// Motion — Magnetic dot grid. A regular grid of small dots, each pulled
// toward the cursor within a radius and springing back when released
// (classic "magnetic field" interaction seen on many Awwwards agency
// sites' hero/footer sections). Built with a moderate grid density and a
// single shared RAF loop (not one GSAP tween per dot) to stay cheap even
// at ~140 dots.
const rootRef = ref<HTMLElement | null>(null)
const COLS = 18
const ROWS = 11

interface DotState {
  el: HTMLElement
  homeX: number
  homeY: number
  x: number
  y: number
  vx: number
  vy: number
}

useGsapContext(() => {
  if (!rootRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  const el = rootRef.value
  const dotEls = Array.from(el.querySelectorAll<HTMLElement>('[data-dot]'))
  const dots: DotState[] = dotEls.map((dotEl) => ({
    el: dotEl,
    homeX: 0,
    homeY: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0
  }))

  function measure() {
    const rect = el.getBoundingClientRect()
    dots.forEach((d) => {
      const dotRect = d.el.getBoundingClientRect()
      d.homeX = dotRect.left + dotRect.width / 2 - rect.left
      d.homeY = dotRect.top + dotRect.height / 2 - rect.top
    })
  }
  measure()
  const resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(el)

  const pointer = { x: -9999, y: -9999 }
  function onPointerMove(e: PointerEvent) {
    const rect = el.getBoundingClientRect()
    pointer.x = e.clientX - rect.left
    pointer.y = e.clientY - rect.top
  }
  function onPointerLeave() {
    pointer.x = -9999
    pointer.y = -9999
  }
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerleave', onPointerLeave)

  const RADIUS = 130
  const stiffness = 0.12
  const damping = 0.8

  const ticker = gsap.ticker.add(() => {
    dots.forEach((d) => {
      const dx = d.homeX - pointer.x
      const dy = d.homeY - pointer.y
      const dist = Math.hypot(dx, dy)
      let targetX = d.homeX
      let targetY = d.homeY
      if (dist < RADIUS) {
        const push = (1 - dist / RADIUS) * 18
        targetX += (dx / (dist || 1)) * push
        targetY += (dy / (dist || 1)) * push
      }

      d.vx += (targetX - d.x) * stiffness
      d.vy += (targetY - d.y) * stiffness
      d.vx *= damping
      d.vy *= damping
      d.x += d.vx
      d.y += d.vy

      d.el.style.transform = `translate(${d.x - d.homeX}px, ${d.y - d.homeY}px)`
    })
  })

  return () => {
    resizeObserver.disconnect()
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerleave', onPointerLeave)
    gsap.ticker.remove(ticker)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
    <div class="grid h-full w-full" :style="{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }">
      <div v-for="i in COLS * ROWS" :key="i" class="flex items-center justify-center">
        <div data-dot="" class="h-1 w-1 rounded-full bg-navy-400" />
      </div>
    </div>
  </div>
</template>

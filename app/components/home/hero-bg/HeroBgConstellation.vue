<script setup lang="ts">
import gsap from 'gsap'

// Constellation Drift — a small field of points, each with its own slow
// Brownian-ish wander (independent noise per point, not one shared loop),
// connected by thin lines that fade in/out purely as a function of live
// distance (no fixed pairs) — the graph topology itself changes over time.
// The cursor acts as a local repulsion field: nearby points nudge away,
// making the whole graph visibly reshape rather than just drift.
const rootRef = ref<HTMLElement | null>(null)

const WIDTH = 1200
const HEIGHT = 800
const LINK_DISTANCE = 220

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Point {
  x: number
  y: number
  homeX: number
  homeY: number
  phaseX: number
  phaseY: number
  speedX: number
  speedY: number
  ampX: number
  ampY: number
  r: number
}

const rand = mulberry32(4242)
const POINT_COUNT = 16
const points: Point[] = Array.from({ length: POINT_COUNT }, () => {
  const homeX = 60 + rand() * (WIDTH - 120)
  const homeY = 60 + rand() * (HEIGHT - 120)
  return {
    x: homeX,
    y: homeY,
    homeX,
    homeY,
    phaseX: rand() * Math.PI * 2,
    phaseY: rand() * Math.PI * 2,
    speedX: 0.15 + rand() * 0.25,
    speedY: 0.15 + rand() * 0.25,
    ampX: 18 + rand() * 22,
    ampY: 18 + rand() * 22,
    r: rand() > 0.85 ? 3.5 : 2
  }
})

useGsapContext(() => {
  if (!rootRef.value) return
  const svg = rootRef.value.querySelector<SVGSVGElement>('svg')
  const dotsLayer = rootRef.value.querySelector<SVGGElement>('[data-dots]')
  const linksLayer = rootRef.value.querySelector<SVGGElement>('[data-links]')
  if (!svg || !dotsLayer || !linksLayer) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const dotEls = points.map((p) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    el.setAttribute('r', String(p.r))
    el.setAttribute('fill', p.r > 3 ? '#FBBA00' : '#0B3954')
    el.setAttribute('cx', String(p.x))
    el.setAttribute('cy', String(p.y))
    dotsLayer.appendChild(el)
    return el
  })

  if (prefersReducedMotion) {
    gsap.set(rootRef.value, { opacity: 0.4 })
    return
  }

  gsap.set(rootRef.value, { opacity: 0 })
  gsap.to(rootRef.value, { opacity: 1, duration: 1.2, delay: 0.3 })

  const el = rootRef.value
  const pointer = { x: -9999, y: -9999, active: false }
  function onPointerMove(e: PointerEvent) {
    const rect = el.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * WIDTH
    pointer.y = ((e.clientY - rect.top) / rect.height) * HEIGHT
    pointer.active = true
  }
  function onPointerLeave() {
    pointer.active = false
  }
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerleave', onPointerLeave)

  let t = 0
  // Reuse line elements across frames rather than recreating the DOM each
  // tick — a pool sized generously for the worst case (every point linked
  // to every other), toggled visible/hidden as pairs cross the threshold.
  const maxLinks = (POINT_COUNT * (POINT_COUNT - 1)) / 2
  const linkEls: SVGLineElement[] = Array.from({ length: maxLinks }, () => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('stroke', '#0B3954')
    line.setAttribute('stroke-width', '0.75')
    linksLayer.appendChild(line)
    return line
  })

  const ticker = gsap.ticker.add((_time, deltaMs) => {
    t += deltaMs / 1000

    points.forEach((p) => {
      let targetX = p.homeX + Math.sin(t * p.speedX + p.phaseX) * p.ampX
      let targetY = p.homeY + Math.cos(t * p.speedY + p.phaseY) * p.ampY

      if (pointer.active) {
        const dx = targetX - pointer.x
        const dy = targetY - pointer.y
        const dist = Math.hypot(dx, dy)
        if (dist < 160) {
          const push = (1 - dist / 160) * 46
          targetX += (dx / (dist || 1)) * push
          targetY += (dy / (dist || 1)) * push
        }
      }

      p.x += (targetX - p.x) * 0.08
      p.y += (targetY - p.y) * 0.08
    })

    dotEls.forEach((el, i) => {
      el.setAttribute('cx', String(points[i]!.x))
      el.setAttribute('cy', String(points[i]!.y))
    })

    let linkIndex = 0
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const pi = points[i]!
        const pj = points[j]!
        const dist = Math.hypot(pi.x - pj.x, pi.y - pj.y)
        const line = linkEls[linkIndex++]!
        if (dist < LINK_DISTANCE) {
          line.setAttribute('x1', String(pi.x))
          line.setAttribute('y1', String(pi.y))
          line.setAttribute('x2', String(pj.x))
          line.setAttribute('y2', String(pj.y))
          line.setAttribute('opacity', String((1 - dist / LINK_DISTANCE) * 0.35))
        } else {
          line.setAttribute('opacity', '0')
        }
      }
    }
  })

  return () => {
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerleave', onPointerLeave)
    gsap.ticker.remove(ticker)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg class="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <g data-links="" />
      <g data-dots="" />
    </svg>
  </div>
</template>

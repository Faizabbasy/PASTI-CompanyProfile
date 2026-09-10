<script setup lang="ts">
import gsap from 'gsap'

// Interactive — Connected nodes. A sparse, static field of nodes (no idle
// wander — distinct from the Constellation background's Brownian drift)
// draws thin lines to any neighbour within range, purely a function of
// fixed distance. The cursor is treated as an extra node each tick: while
// active it links into the same graph exactly like any other point, so the
// network visibly "welcomes" it and drops it again on pointerleave —
// a live network diagram the visitor is temporarily part of.
const rootRef = ref<HTMLElement | null>(null)

const WIDTH = 1200
const HEIGHT = 800
const LINK_DISTANCE = 200
const CURSOR_LINK_DISTANCE = 260

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

interface Node {
  x: number
  y: number
  r: number
}

const rand = mulberry32(7331)
const NODE_COUNT = 22
const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
  x: 40 + rand() * (WIDTH - 80),
  y: 40 + rand() * (HEIGHT - 80),
  r: rand() > 0.82 ? 3.5 : 2
}))

useGsapContext(() => {
  if (!rootRef.value) return
  const el = rootRef.value
  const dotsLayer = el.querySelector<SVGGElement>('[data-dots]')
  const linksLayer = el.querySelector<SVGGElement>('[data-links]')
  const cursorDot = el.querySelector<SVGCircleElement>('[data-cursor-dot]')
  if (!dotsLayer || !linksLayer || !cursorDot) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  nodes.forEach((n) => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    dot.setAttribute('r', String(n.r))
    dot.setAttribute('cx', String(n.x))
    dot.setAttribute('cy', String(n.y))
    dot.setAttribute('fill', n.r > 3 ? '#FBBA00' : '#0B3954')
    dotsLayer.appendChild(dot)
  })

  // Static node-to-node links never change, so they're drawn once.
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]!
      const b = nodes[j]!
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      if (dist < LINK_DISTANCE) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', String(a.x))
        line.setAttribute('y1', String(a.y))
        line.setAttribute('x2', String(b.x))
        line.setAttribute('y2', String(b.y))
        line.setAttribute('stroke', '#0B3954')
        line.setAttribute('stroke-width', '0.75')
        line.setAttribute('opacity', String((1 - dist / LINK_DISTANCE) * 0.3))
        linksLayer.appendChild(line)
      }
    }
  }

  gsap.set(el, { opacity: 0 })
  gsap.to(el, { opacity: 1, duration: 1, delay: 0.2 })

  if (prefersReducedMotion) return

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

  // Cursor-to-node link pool, reused each frame rather than recreated.
  const cursorLinkEls: SVGLineElement[] = nodes.map(() => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('stroke', '#FBBA00')
    line.setAttribute('stroke-width', '1')
    linksLayer.appendChild(line)
    return line
  })

  const easedCursor = { x: -9999, y: -9999 }

  const ticker = gsap.ticker.add(() => {
    if (pointer.active) {
      easedCursor.x += (pointer.x - easedCursor.x) * 0.18
      easedCursor.y += (pointer.y - easedCursor.y) * 0.18
    }

    const targetOpacity = pointer.active ? 1 : 0
    const currentOpacity = Number(cursorDot.getAttribute('data-opacity') || '0')
    const nextOpacity = currentOpacity + (targetOpacity - currentOpacity) * 0.15
    cursorDot.setAttribute('data-opacity', String(nextOpacity))
    cursorDot.setAttribute('opacity', String(nextOpacity))
    cursorDot.setAttribute('cx', String(easedCursor.x))
    cursorDot.setAttribute('cy', String(easedCursor.y))

    nodes.forEach((n, i) => {
      const line = cursorLinkEls[i]!
      const dist = Math.hypot(n.x - easedCursor.x, n.y - easedCursor.y)
      if (dist < CURSOR_LINK_DISTANCE && nextOpacity > 0.02) {
        line.setAttribute('x1', String(n.x))
        line.setAttribute('y1', String(n.y))
        line.setAttribute('x2', String(easedCursor.x))
        line.setAttribute('y2', String(easedCursor.y))
        line.setAttribute('opacity', String((1 - dist / CURSOR_LINK_DISTANCE) * 0.55 * nextOpacity))
      } else {
        line.setAttribute('opacity', '0')
      }
    })
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
      <circle data-cursor-dot="" r="3.5" fill="#FBBA00" opacity="0" />
    </svg>
  </div>
</template>

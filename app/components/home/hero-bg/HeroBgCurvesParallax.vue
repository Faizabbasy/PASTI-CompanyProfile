<script setup lang="ts">
import gsap from 'gsap'

// Curves polish C — depth-layered parallax. The same curve family is split
// into a far layer (thin, blurred, low opacity, moves least), a mid layer,
// and a near layer (crisp, moves most) — both on scroll (via ScrollTrigger
// scrub) and cursor (subtle translate). Gives an illusion of depth from flat
// 2D strokes without touching Three.js.
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const rootRef = ref<HTMLElement | null>(null)
const farRef = ref<HTMLElement | null>(null)
const midRef = ref<HTMLElement | null>(null)
const nearRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value) return
  const layers = [farRef.value, midRef.value, nearRef.value].filter(Boolean) as HTMLElement[]
  const allPaths = rootRef.value.querySelectorAll<SVGPathElement>('path')

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  allPaths.forEach((path, i) => {
    const length = path.getTotalLength()
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 })
    if (!prefersReducedMotion) {
      gsap.to(path, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', delay: i * 0.12 })
    } else {
      gsap.set(path, { strokeDashoffset: 0 })
    }
  })

  if (prefersReducedMotion) return

  // Scroll parallax: far layer barely moves, near layer moves the most.
  const scrollTrigger = ScrollTrigger.create({
    trigger: rootRef.value,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
    onUpdate: (self) => {
      gsap.set(farRef.value, { y: self.progress * 20 })
      gsap.set(midRef.value, { y: self.progress * 50 })
      gsap.set(nearRef.value, { y: self.progress * 90 })
    }
  })

  // Cursor parallax: same depth ordering, smaller magnitudes, eased toward target.
  const el = rootRef.value
  const pointer = { x: 0, y: 0 }
  function onPointerMove(e: PointerEvent) {
    const rect = el.getBoundingClientRect()
    pointer.x = (e.clientX - rect.left) / rect.width - 0.5
    pointer.y = (e.clientY - rect.top) / rect.height - 0.5
  }
  el.addEventListener('pointermove', onPointerMove)

  const depths = [
    { ref: farRef, strength: 6 },
    { ref: midRef, strength: 14 },
    { ref: nearRef, strength: 26 }
  ]
  const cursorTicker = gsap.ticker.add(() => {
    depths.forEach(({ ref, strength }) => {
      if (!ref.value) return
      gsap.to(ref.value, { x: pointer.x * strength, duration: 1, ease: 'power3.out', overwrite: 'auto' })
    })
  })

  return () => {
    scrollTrigger.kill()
    el.removeEventListener('pointermove', onPointerMove)
    gsap.ticker.remove(cursorTicker)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg
      class="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 800"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <g ref="farRef" opacity="0.3" style="filter: blur(1.5px)">
        <path d="M-50 250 C 200 150, 400 350, 650 200 S 1000 100, 1250 220" stroke="#0B3954" stroke-width="1" />
        <circle cx="1000" cy="600" r="120" stroke="#0B3954" stroke-width="0.75" />
      </g>

      <g ref="midRef" opacity="0.55">
        <path d="M100 650 C 300 500, 500 750, 750 550 S 1100 350, 1150 200" stroke="#0B3954" stroke-width="1.25" />
        <path d="M150 100 L 350 100 L 350 300 L 150 300 Z" stroke="#0B3954" stroke-width="1" opacity="0.7" />
      </g>

      <g ref="nearRef" opacity="0.9">
        <path d="M850 650 L 1050 450" stroke="#FBBA00" stroke-width="2" />
        <circle cx="950" cy="550" r="6" fill="#FBBA00" stroke="none" />
        <path d="M50 450 L 250 450" stroke="#0B3954" stroke-width="1.5" />
      </g>
    </svg>
  </div>
</template>

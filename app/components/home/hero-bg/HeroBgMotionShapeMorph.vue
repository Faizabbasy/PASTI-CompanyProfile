<script setup lang="ts">
import gsap from 'gsap'

// Motion — Scroll-linked shape morph. A single soft blob shape morphs
// between several hand-authored SVG path states as the user scrolls
// through the Hero (GSAP ScrollTrigger scrub, no plugin needed — path
// data itself is interpolated via a manual point-lerp since MorphSVG is a
// paid plugin PASTI doesn't have). At rest (no scroll) it also idles with
// a slow independent morph, so it's never fully static.
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const rootRef = ref<HTMLElement | null>(null)

// Each shape is the same number of points (8) around a rough circle,
// radius-perturbed — interpolating between them keeps triangulation sane.
const shapeStates = [
  [1, 0.92, 1.05, 0.88, 0.95, 1.1, 0.9, 1.02],
  [1.08, 0.85, 0.95, 1.05, 1.1, 0.82, 1.0, 0.95],
  [0.9, 1.05, 1.1, 0.9, 0.85, 1.0, 1.08, 0.92],
  [1, 0.92, 1.05, 0.88, 0.95, 1.1, 0.9, 1.02]
]

function pointsToPath(radii: number[], cx: number, cy: number, baseR: number): string {
  const n = radii.length
  const pts: [number, number][] = radii.map((r, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2
    return [cx + Math.cos(angle) * baseR * r, cy + Math.sin(angle) * baseR * r]
  })
  let d = `M${pts[0]![0]} ${pts[0]![1]}`
  for (let i = 0; i < n; i++) {
    const curr = pts[i]!
    const next = pts[(i + 1) % n]!
    const midX = (curr[0] + next[0]) / 2
    const midY = (curr[1] + next[1]) / 2
    d += ` Q${curr[0]} ${curr[1]}, ${midX} ${midY}`
  }
  d += ' Z'
  return d
}

useGsapContext(() => {
  if (!rootRef.value) return
  const path = rootRef.value.querySelector<SVGPathElement>('[data-blob]')
  if (!path) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cx = 600
  const cy = 400
  const baseR = 260

  const state = { mix: 0 }
  function render() {
    const total = shapeStates.length - 1
    const scaled = state.mix * total
    const idx = Math.min(Math.floor(scaled), total - 1)
    const localT = scaled - idx
    const from = shapeStates[idx]!
    const to = shapeStates[idx + 1]!
    const radii = from.map((r, i) => r + (to[i]! - r) * localT)
    path.setAttribute('d', pointsToPath(radii, cx, cy, baseR))
  }
  render()

  if (prefersReducedMotion) return

  const idleTween = gsap.to(state, {
    mix: shapeStates.length - 1,
    duration: 16,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    onUpdate: render
  })

  const scrollTrigger = ScrollTrigger.create({
    trigger: rootRef.value,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      idleTween.pause()
      state.mix = self.progress * (shapeStates.length - 1)
      render()
    },
    onLeaveBack: () => idleTween.resume(),
    onLeave: () => idleTween.resume()
  })

  return () => {
    idleTween.kill()
    scrollTrigger.kill()
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
    <svg class="h-[90%] w-[90%] opacity-40" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="shape-morph-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0B3954" />
          <stop offset="100%" stop-color="#FBBA00" />
        </linearGradient>
      </defs>
      <path data-blob="" fill="url(#shape-morph-grad)" style="filter: blur(40px)" />
    </svg>
  </div>
</template>

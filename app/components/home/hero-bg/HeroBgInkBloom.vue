<script setup lang="ts">
import gsap from 'gsap'

// Ink Bloom — organic ink-spread reveal instead of a symmetric bezier
// diagram. A handful of strokes are built from a seeded pseudo-random walk
// (not neat C/S curve math), each masked by its own radial "bloom" circle
// that expands from a seed point on load — so the line looks like it's
// being drawn by spreading ink rather than a mechanical stroke-dashoffset
// wipe. Once settled, the seed points act as soft gravity wells: the
// cursor displaces the nearest wells, and the strokes re-sample toward
// them with a lagged, slightly overshooting spring (not 1:1 tracking).
const rootRef = ref<HTMLElement | null>(null)

// Mulberry32 — tiny deterministic PRNG so the "organic" jitter is stable
// across reloads/SSR instead of actually random (which would hydration-
// mismatch and also just look different every visit in a way that reads
// as noise rather than intentional linework).
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

interface InkStroke {
  seed: [number, number]
  points: [number, number][]
  width: number
  opacity: number
  well: { x: number; y: number; vx: number; vy: number; homeX: number; homeY: number }
}

function buildStroke(rand: () => number, seedX: number, seedY: number, reach: number, segments: number): [number, number][] {
  const points: [number, number][] = [[seedX, seedY]]
  let angle = rand() * Math.PI * 2
  let x = seedX
  let y = seedY
  for (let i = 0; i < segments; i++) {
    angle += (rand() - 0.5) * 1.4
    const step = reach * (0.5 + rand() * 0.5)
    x += Math.cos(angle) * step
    y += Math.sin(angle) * step
    points.push([x, y])
  }
  return points
}

function catmullRomPath(points: [number, number][]): string {
  if (points.length < 2) return ''
  let d = `M${points[0]![0]} ${points[0]![1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!
    const p1 = points[i]!
    const p2 = points[i + 1]!
    const p3 = points[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`
  }
  return d
}

const rand = mulberry32(1337)
const strokes: InkStroke[] = [
  { seed: [180, 620], points: [], width: 2, opacity: 1, well: { x: 180, y: 620, vx: 0, vy: 0, homeX: 180, homeY: 620 } },
  { seed: [980, 180], points: [], width: 1.5, opacity: 0.7, well: { x: 980, y: 180, vx: 0, vy: 0, homeX: 980, homeY: 180 } },
  { seed: [560, 420], points: [], width: 1.25, opacity: 0.55, well: { x: 560, y: 420, vx: 0, vy: 0, homeX: 560, homeY: 420 } },
  { seed: [880, 640], points: [], width: 1, opacity: 0.4, well: { x: 880, y: 640, vx: 0, vy: 0, homeX: 880, homeY: 640 } }
]
strokes.forEach((s, i) => {
  s.points = buildStroke(rand, s.seed[0], s.seed[1], 60 + i * 8, 7)
})

useGsapContext(() => {
  if (!rootRef.value) return
  const paths = Array.from(rootRef.value.querySelectorAll<SVGPathElement>('[data-ink]'))
  const blooms = Array.from(rootRef.value.querySelectorAll<SVGCircleElement>('[data-bloom]'))

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    gsap.set(paths, { opacity: 0.5 })
    gsap.set(blooms, { attr: { r: 400 } })
    return
  }

  gsap.set(blooms, { attr: { r: 0 } })
  blooms.forEach((bloom, i) => {
    gsap.to(bloom, {
      attr: { r: 260 + i * 40 },
      duration: 1.6 + i * 0.3,
      ease: 'power2.out',
      delay: 0.15 + i * 0.22
    })
  })

  const el = rootRef.value
  const pointer = { x: 0.5, y: 0.5 }
  function onPointerMove(e: PointerEvent) {
    const rect = el.getBoundingClientRect()
    pointer.x = (e.clientX - rect.left) / rect.width
    pointer.y = (e.clientY - rect.top) / rect.height
  }
  el.addEventListener('pointermove', onPointerMove)

  // Spring physics per well: displaced by cursor proximity, pulled back
  // home with a slight overshoot — deliberately not critically damped, so
  // it settles with one small oscillation instead of easing in flatly.
  const stiffness = 0.02
  const damping = 0.88

  const ticker = gsap.ticker.add(() => {
    const cx = pointer.x * 1200
    const cy = pointer.y * 800

    strokes.forEach((s, i) => {
      const { well } = s
      const dx = well.homeX - cx
      const dy = well.homeY - cy
      const dist = Math.hypot(dx, dy)
      const influence = Math.max(0, 1 - dist / 320)

      const pushX = influence > 0 ? (-dx / (dist || 1)) * influence * 26 : 0
      const pushY = influence > 0 ? (-dy / (dist || 1)) * influence * 26 : 0

      const targetX = well.homeX + pushX
      const targetY = well.homeY + pushY

      well.vx += (targetX - well.x) * stiffness
      well.vy += (targetY - well.y) * stiffness
      well.vx *= damping
      well.vy *= damping
      well.x += well.vx
      well.y += well.vy

      const offsetX = well.x - well.homeX
      const offsetY = well.y - well.homeY
      const shifted = s.points.map(([px, py]) => [px + offsetX, py + offsetY] as [number, number])
      paths[i]?.setAttribute('d', catmullRomPath(shifted))

      const bloom = blooms[i]
      if (bloom) {
        bloom.setAttribute('cx', String(well.x))
        bloom.setAttribute('cy', String(well.y))
      }
    })
  })

  return () => {
    el.removeEventListener('pointermove', onPointerMove)
    gsap.ticker.remove(ticker)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg class="absolute inset-0 h-full w-full opacity-80" viewBox="0 0 1200 800" fill="none" preserveAspectRatio="xMidYMid slice">
      <defs>
        <mask v-for="(s, i) in strokes" :id="`ink-mask-${i}`" :key="`mask-${i}`">
          <circle data-bloom="" :cx="s.seed[0]" :cy="s.seed[1]" r="0" fill="white" />
        </mask>
      </defs>

      <path
        v-for="(s, i) in strokes"
        :key="i"
        data-ink=""
        :d="catmullRomPath(s.points)"
        :stroke="i === 0 ? '#FBBA00' : '#0B3954'"
        :stroke-width="s.width"
        :opacity="s.opacity"
        stroke-linecap="round"
        :mask="`url(#ink-mask-${i})`"
      />
    </svg>
  </div>
</template>

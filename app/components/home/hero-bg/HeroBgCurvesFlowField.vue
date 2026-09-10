<script setup lang="ts">
import gsap from 'gsap'

// Curves polish A — cursor-reactive flow field. Six strokes, each with its
// own draw-in timing. Once settled, each stroke's own curvature bends
// toward the cursor (not just a translate — the control points themselves
// shift), so the effect reads clearly rather than as a faint drift. A trail
// of small dots spawns behind fast cursor movement and fades out.
const rootRef = ref<HTMLElement | null>(null)

// Each stroke is defined as a cubic bezier "M sx sy C c1x c1y, c2x c2y, ex ey
// S c3x c3y, ex2 ey2" — we keep the raw control points so we can nudge them
// toward the cursor and rebuild the `d` string every frame.
const strokes = [
  { start: [80, 640], c1: [280, 480], c2: [480, 760], mid: [740, 540], c3: [1080, 340], end: [1160, 190], width: 1.75, opacity: 1, amp: 70 },
  { start: [-60, 210], c1: [200, 90], c2: [400, 310], mid: [640, 140], c3: [980, 40], end: [1260, 190], width: 1.25, opacity: 0.65, amp: 55 },
  { start: [40, 460], c1: [250, 380], c2: [350, 540], mid: [560, 470], c3: [860, 380], end: [1010, 500], width: 1, opacity: 0.5, amp: 45 },
  { start: [-40, 720], c1: [180, 650], c2: [420, 780], mid: [600, 700], c3: [880, 620], end: [1120, 700], width: 1, opacity: 0.45, amp: 50 },
  { start: [900, 60], c1: [960, 160], c2: [1040, 40], mid: [1080, 150], c3: [1140, 100], end: [1220, 220], width: 0.75, opacity: 0.35, amp: 35 },
  { start: [120, 90], c1: [220, 40], c2: [280, 160], mid: [360, 110], c3: [440, 60], end: [520, 140], width: 0.75, opacity: 0.35, amp: 30 }
]

function pathFor(s: (typeof strokes)[number], dx: number, dy: number): string {
  const [sx, sy] = s.start
  const [c1x, c1y] = s.c1
  const [c2x, c2y] = s.c2
  const [mx, my] = s.mid
  const [c3x, c3y] = s.c3
  const [ex, ey] = s.end
  return `M${sx! + dx} ${sy! + dy} C ${c1x! + dx} ${c1y! + dy}, ${c2x! + dx} ${c2y! + dy}, ${mx! + dx} ${my! + dy} S ${c3x! + dx} ${c3y! + dy}, ${ex! + dx} ${ey! + dy}`
}

useGsapContext(() => {
  if (!rootRef.value) return
  const paths = Array.from(rootRef.value.querySelectorAll<SVGPathElement>('[data-flow]'))
  const accentDot = rootRef.value.querySelector<SVGCircleElement>('[data-accent]')
  const trailLayer = rootRef.value.querySelector<SVGGElement>('[data-trail]')

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    gsap.set(paths, { opacity: 0.5 })
    return
  }

  paths.forEach((path, i) => {
    const length = path.getTotalLength()
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 })
    gsap.to(path, { strokeDashoffset: 0, duration: 1.8 + i * 0.35, ease: 'power2.inOut', delay: i * 0.18 })
  })

  if (accentDot) {
    gsap.set(accentDot, { opacity: 0 })
    gsap.to(accentDot, { opacity: 1, duration: 1, delay: 1.6 })
    gsap.to(accentDot, {
      scale: 1.8,
      opacity: 0.35,
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      transformOrigin: '50% 50%'
    })
  }

  const el = rootRef.value
  const pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5 }
  const eased = { x: 0.5, y: 0.5 }
  let lastSpawn = 0

  function spawnTrailDot(clientX: number, clientY: number) {
    if (!trailLayer) return
    const rect = el.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 1200
    const y = ((clientY - rect.top) / rect.height) * 800
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    dot.setAttribute('cx', String(x))
    dot.setAttribute('cy', String(y))
    dot.setAttribute('r', '3')
    dot.setAttribute('fill', '#FBBA00')
    trailLayer.appendChild(dot)
    gsap.fromTo(
      dot,
      { opacity: 0.7, scale: 1, transformOrigin: `${x}px ${y}px` },
      { opacity: 0, scale: 2.2, duration: 0.9, ease: 'power2.out', onComplete: () => dot.remove() }
    )
  }

  function onPointerMove(e: PointerEvent) {
    const rect = el.getBoundingClientRect()
    pointer.x = (e.clientX - rect.left) / rect.width
    pointer.y = (e.clientY - rect.top) / rect.height

    const dx = pointer.x - pointer.px
    const dy = pointer.y - pointer.py
    const speed = Math.hypot(dx, dy)
    const now = performance.now()
    if (speed > 0.02 && now - lastSpawn > 40) {
      spawnTrailDot(e.clientX, e.clientY)
      lastSpawn = now
    }
    pointer.px = pointer.x
    pointer.py = pointer.y
  }
  el.addEventListener('pointermove', onPointerMove)

  const ticker = gsap.ticker.add(() => {
    eased.x += (pointer.x - eased.x) * 0.06
    eased.y += (pointer.y - eased.y) * 0.06

    paths.forEach((path, i) => {
      const s = strokes[i]!
      const targetX = eased.x * 1200
      const targetY = eased.y * 800
      const midX = (s.start[0] + s.end[0]) / 2
      const midY = (s.start[1] + s.end[1]) / 2
      const pullX = ((targetX - midX) / 1200) * s.amp
      const pullY = ((targetY - midY) / 800) * s.amp
      path.setAttribute('d', pathFor(s, pullX, pullY))
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
      <path
        v-for="(s, i) in strokes"
        :key="i"
        data-flow=""
        :d="pathFor(s, 0, 0)"
        stroke="#0B3954"
        :stroke-width="s.width"
        :opacity="s.opacity"
        stroke-linecap="round"
      />
      <circle data-accent="" cx="950" cy="550" r="6" fill="#FBBA00" stroke="none" />
      <g data-trail="" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

// Curves polish D — "3D flow field": the upgraded cursor flow field (curved
// strokes bending toward the pointer + trail dots) plus a CSS 3D layer —
// the whole SVG sits in a perspective container and tilts on rotateX/
// rotateY as the cursor moves, and each stroke gets a depth-appropriate
// drop-shadow (far strokes: soft/faint, near strokes: tighter/darker) so
// flat SVG paths read as floating at different depths in space.
const wrapRef = ref<HTMLElement | null>(null)
const rootRef = ref<HTMLElement | null>(null)

const strokes = [
  { start: [80, 640], c1: [280, 480], c2: [480, 760], mid: [740, 540], c3: [1080, 340], end: [1160, 190], width: 1.75, opacity: 1, amp: 70, depth: 'near' as const },
  { start: [-60, 210], c1: [200, 90], c2: [400, 310], mid: [640, 140], c3: [980, 40], end: [1260, 190], width: 1.25, opacity: 0.7, amp: 55, depth: 'mid' as const },
  { start: [40, 460], c1: [250, 380], c2: [350, 540], mid: [560, 470], c3: [860, 380], end: [1010, 500], width: 1, opacity: 0.55, amp: 45, depth: 'mid' as const },
  { start: [-40, 720], c1: [180, 650], c2: [420, 780], mid: [600, 700], c3: [880, 620], end: [1120, 700], width: 1, opacity: 0.45, amp: 50, depth: 'far' as const },
  { start: [900, 60], c1: [960, 160], c2: [1040, 40], mid: [1080, 150], c3: [1140, 100], end: [1220, 220], width: 0.75, opacity: 0.35, amp: 35, depth: 'far' as const },
  { start: [120, 90], c1: [220, 40], c2: [280, 160], mid: [360, 110], c3: [440, 60], end: [520, 140], width: 0.75, opacity: 0.35, amp: 30, depth: 'far' as const }
]

const depthShadow: Record<string, string> = {
  near: 'drop-shadow(0 6px 10px rgba(11,57,84,0.35))',
  mid: 'drop-shadow(0 3px 6px rgba(11,57,84,0.2))',
  far: 'drop-shadow(0 1px 2px rgba(11,57,84,0.1))'
}

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
  if (!rootRef.value || !wrapRef.value) return
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
  const wrap = wrapRef.value
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

    gsap.to(wrap, {
      rotateY: (pointer.x - 0.5) * 10,
      rotateX: (0.5 - pointer.y) * 8,
      duration: 1,
      ease: 'power3.out'
    })
  }
  el.addEventListener('pointermove', onPointerMove)

  function onPointerLeave() {
    gsap.to(wrap, { rotateX: 0, rotateY: 0, duration: 1.2, ease: 'power3.out' })
  }
  el.addEventListener('pointerleave', onPointerLeave)

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
    el.removeEventListener('pointerleave', onPointerLeave)
    gsap.ticker.remove(ticker)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="hero-3d-flow pointer-events-none absolute inset-0 overflow-hidden">
    <div ref="wrapRef" class="hero-3d-flow-wrap absolute inset-0">
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
          :style="{ filter: depthShadow[s.depth] }"
        />
        <circle data-accent="" cx="950" cy="550" r="6" fill="#FBBA00" stroke="none" />
        <g data-trail="" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.hero-3d-flow {
  perspective: 1200px;
}

.hero-3d-flow-wrap {
  transform-style: preserve-3d;
  will-change: transform;
}
</style>

<script setup lang="ts">
import gsap from 'gsap'

// Interactive — Trained activation. Inspired by Active Theory's award-winning
// craft of cursor interaction that "trains you how to use it" with no
// explanation: a scattered field of ~40 small inert marks sits completely
// still until the very first pointermove, at which point the single nearest
// mark visibly activates (brightens + scales, briefly draws a connecting
// line back to the cursor) to teach the pattern in one gesture. From then on,
// marks activate/deactivate purely by proximity as the cursor travels, and
// each mark's activation response is individually varied (some scale, some
// rotate, some just brighten) via a per-mark seeded behaviour so repeated
// exploration keeps feeling discovered rather than mechanical.
const rootRef = ref<HTMLElement | null>(null)
const COUNT = 40

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

const rand = mulberry32(4242)
type Behaviour = 'scale' | 'rotate' | 'brighten'
const behaviours: Behaviour[] = ['scale', 'rotate', 'brighten']

const marks = Array.from({ length: COUNT }, () => ({
  left: `${4 + rand() * 92}%`,
  top: `${4 + rand() * 92}%`,
  behaviour: behaviours[Math.floor(rand() * behaviours.length)]!
}))

useGsapContext(() => {
  if (!rootRef.value) return
  const root = rootRef.value
  const markEls = Array.from(root.querySelectorAll<HTMLElement>('[data-mark]'))
  const line = root.querySelector<SVGLineElement>('[data-teach-line]')
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  gsap.set(markEls, { opacity: 0.16, scale: 1, rotate: 0 })

  if (prefersReducedMotion) return

  let hasMoved = false
  let activeSet = new Set<number>()
  const RADIUS_ACTIVE = 0.16

  function activate(el: HTMLElement, behaviour: Behaviour) {
    const props: gsap.TweenVars = { opacity: 0.95, duration: 0.45, ease: 'power3.out' }
    if (behaviour === 'scale') props.scale = 1.9
    if (behaviour === 'rotate') props.rotate = 135
    gsap.to(el, props)
  }
  function deactivate(el: HTMLElement) {
    gsap.to(el, { opacity: 0.16, scale: 1, rotate: 0, duration: 0.6, ease: 'power2.out' })
  }

  function onPointerMove(e: PointerEvent) {
    const rect = root.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const diag = Math.hypot(rect.width, rect.height)

    if (!hasMoved) {
      hasMoved = true
      // First-move teaching moment: light the single nearest mark and draw
      // a brief connecting line from it to the cursor, then let it fade.
      let nearest = -1
      let nearestDist = Infinity
      marks.forEach((m, i) => {
        const mx = parseFloat(m.left) / 100
        const my = parseFloat(m.top) / 100
        const dist = Math.hypot(px - mx, py - my)
        if (dist < nearestDist) {
          nearestDist = dist
          nearest = i
        }
      })
      if (nearest >= 0 && line) {
        const m = marks[nearest]!
        line.setAttribute('x1', m.left)
        line.setAttribute('y1', m.top)
        line.setAttribute('x2', `${px * 100}%`)
        line.setAttribute('y2', `${py * 100}%`)
        gsap.fromTo(line, { opacity: 0.8 }, { opacity: 0, duration: 0.9, ease: 'power2.out' })
        activate(markEls[nearest]!, marks[nearest]!.behaviour)
        activeSet.add(nearest)
      }
    }

    const nextActive = new Set<number>()
    marks.forEach((m, i) => {
      const mx = parseFloat(m.left) / 100
      const my = parseFloat(m.top) / 100
      const normDist = Math.hypot((px - mx) * rect.width, (py - my) * rect.height) / diag
      if (normDist < RADIUS_ACTIVE) nextActive.add(i)
    })

    nextActive.forEach((i) => {
      if (!activeSet.has(i)) activate(markEls[i]!, marks[i]!.behaviour)
    })
    activeSet.forEach((i) => {
      if (!nextActive.has(i)) deactivate(markEls[i]!)
    })
    activeSet = nextActive
  }

  function onPointerLeave() {
    activeSet.forEach((i) => deactivate(markEls[i]!))
    activeSet = new Set()
  }

  root.addEventListener('pointermove', onPointerMove)
  root.addEventListener('pointerleave', onPointerLeave)

  return () => {
    root.removeEventListener('pointermove', onPointerMove)
    root.removeEventListener('pointerleave', onPointerLeave)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg class="absolute inset-0 h-full w-full">
      <line data-teach-line="" stroke="#FBBA00" stroke-width="1" opacity="0" />
    </svg>
    <div
      v-for="(m, i) in marks"
      :key="i"
      data-mark=""
      class="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy-700 will-change-transform"
      :style="{ left: m.left, top: m.top }"
    />
  </div>
</template>

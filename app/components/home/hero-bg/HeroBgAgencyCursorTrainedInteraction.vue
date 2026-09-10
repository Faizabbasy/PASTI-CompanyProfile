<script setup lang="ts">
import gsap from 'gsap'

// Agency — Inspired by Active Theory's award-winning cursor craft: the site
// trains you how to use it without explaining anything. A small set of
// structural tick marks stay completely inert until the cursor first
// moves; then the nearest mark "lights up" (brightens/scales) to teach the
// pattern, and as the cursor continues, different marks light up based on
// proximity — the interaction reveals its own rule through use.
const rootRef = ref<HTMLElement | null>(null)

const marks = [
  { left: '8%', top: '18%' },
  { left: '92%', top: '14%' },
  { left: '15%', top: '82%' },
  { left: '85%', top: '78%' },
  { left: '50%', top: '8%' },
  { left: '50%', top: '92%' },
  { left: '6%', top: '50%' },
  { left: '94%', top: '50%' }
]

useGsapContext(() => {
  if (!rootRef.value) return
  const root = rootRef.value
  const tickEls = Array.from(root.querySelectorAll<HTMLElement>('[data-tick]'))
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  gsap.set(tickEls, { opacity: 0.14, scale: 1 })

  if (prefersReducedMotion) {
    return
  }

  let activeIndex = -1

  function onPointerMove(e: PointerEvent) {
    const rect = root.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top

    let nearest = -1
    let nearestDist = Infinity
    tickEls.forEach((el, i) => {
      const m = marks[i]!
      const mx = (parseFloat(m.left) / 100) * rect.width
      const my = (parseFloat(m.top) / 100) * rect.height
      const dist = Math.hypot(px - mx, py - my)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = i
      }
    })

    const proximityThreshold = Math.min(rect.width, rect.height) * 0.42
    const shouldLight = nearestDist < proximityThreshold

    if (shouldLight && nearest !== activeIndex) {
      if (activeIndex >= 0) {
        gsap.to(tickEls[activeIndex]!, { opacity: 0.14, scale: 1, duration: 0.5, ease: 'power2.out' })
      }
      gsap.to(tickEls[nearest]!, { opacity: 0.9, scale: 1.6, duration: 0.4, ease: 'power3.out' })
      activeIndex = nearest
    } else if (!shouldLight && activeIndex >= 0) {
      gsap.to(tickEls[activeIndex]!, { opacity: 0.14, scale: 1, duration: 0.6, ease: 'power2.out' })
      activeIndex = -1
    }
  }

  root.addEventListener('pointermove', onPointerMove)

  function onPointerLeave() {
    if (activeIndex >= 0) {
      gsap.to(tickEls[activeIndex]!, { opacity: 0.14, scale: 1, duration: 0.6, ease: 'power2.out' })
      activeIndex = -1
    }
  }
  root.addEventListener('pointerleave', onPointerLeave)

  return () => {
    root.removeEventListener('pointermove', onPointerMove)
    root.removeEventListener('pointerleave', onPointerLeave)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      v-for="(m, i) in marks"
      :key="i"
      data-tick=""
      class="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 will-change-transform"
      :style="{ left: m.left, top: m.top }"
    >
      <span class="absolute inset-0 border border-navy-900" />
      <span class="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500" />
    </div>
  </div>
</template>

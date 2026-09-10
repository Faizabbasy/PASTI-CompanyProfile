<script setup lang="ts">
import gsap from 'gsap'

// Agency — SVG line-drawing reveal. An abstract, angular/architectural
// path draws itself on load via the classic stroke-dasharray/
// stroke-dashoffset technique, then settles into a very slow, subtle
// morph/breathing loop (a handful of anchor points nudge back and forth)
// so the line never feels fully inert — a thin, elegant signature move
// distinct from the bolder shape-morph blob elsewhere in this set.
const rootRef = ref<HTMLElement | null>(null)

// Two closely-related angular path states — interpolating between them
// on a long, slow yoyo tween gives the "breathing" effect after the draw.
const pathA = 'M-40 520 L 220 520 L 220 260 L 480 260 L 480 640 L 760 640 L 760 120 L 1040 120 L 1040 460 L 1280 460'
const pathB = 'M-40 500 L 240 500 L 240 280 L 460 280 L 460 620 L 780 620 L 780 140 L 1020 140 L 1020 480 L 1280 480'

useGsapContext(() => {
  if (!rootRef.value) return
  const path = rootRef.value.querySelector<SVGPathElement>('[data-path]')
  if (!path) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const length = path.getTotalLength()

  if (prefersReducedMotion) {
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: 0, attr: { d: pathA } })
    return
  }

  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })

  const tl = gsap.timeline()
  tl.to(path, { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut' })
  tl.to(
    path,
    {
      attr: { d: pathB },
      duration: 10,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    },
    '-=0.1'
  )

  return () => tl.kill()
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.16]">
    <svg class="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" fill="none" preserveAspectRatio="xMidYMid slice">
      <path data-path="" :d="pathA" stroke="#0B2A3D" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </div>
</template>

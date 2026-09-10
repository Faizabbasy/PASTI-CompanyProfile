<script setup lang="ts">
// "Architectural Drawing Field" — the empty left column (col 1-4) in
// WhatWeDo gets a technical line field (grid + registration-mark crosshairs,
// same corner-bracket motif already shipped on Hero/Why PASTI/FAQ) that
// draws itself in as the section scrolls. See
// .docs/context/LARGE_SCALE_MOTION_PLAN.md section 2.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

const wrapperRef = ref<HTMLElement | null>(null)
const svgRef = ref<HTMLElement | null>(null)

useDepthParallax(wrapperRef, 'back')

useGsapContext(() => {
  const svg = svgRef.value
  const wrapper = wrapperRef.value
  if (!svg || !wrapper) return

  const paths = Array.from(svg.querySelectorAll<SVGPathElement | SVGLineElement>('[data-draw]'))
  if (!paths.length) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = window.matchMedia('(max-width: 767px)').matches

  if (prefersReducedMotion) {
    gsap.set(paths, { strokeDashoffset: 0 })
    return
  }

  gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 })

  if (isMobile) {
    // One-shot reveal-on-enter on mobile, not a continuous scrub — per the
    // global "art-directed, not merely disabled" mobile adaptation rule.
    const anim = gsap.to(paths, {
      strokeDashoffset: 0,
      duration: motionDuration.editorial,
      stagger: motionStagger.base,
      ease: motionEase.standard,
      scrollTrigger: { trigger: wrapper, start: 'top 85%', once: true }
    })
    return () => anim.kill()
  }

  // Desktop: scrubbed by section scroll progress, lines draw themselves in
  // progressively as the user scrolls through WhatWeDo.
  const trigger = ScrollTrigger.create({
    trigger: wrapper,
    start: 'top 90%',
    end: 'bottom 60%',
    scrub: true,
    onUpdate: (self) => {
      gsap.set(paths, { strokeDashoffset: 1 - self.progress })
    }
  })

  return () => trigger.kill()
})
</script>

<template>
  <div ref="wrapperRef" aria-hidden="true" class="pointer-events-none relative hidden h-full min-h-[18rem] w-full md:block">
    <svg ref="svgRef" class="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <!-- Base grid: thin uniform lines, low opacity, structural texture. -->
      <g stroke="#0B3954" stroke-opacity="0.16" stroke-width="0.3">
        <line v-for="x in [20, 40, 60, 80]" :key="`v-${x}`" data-draw :x1="x" y1="0" :x2="x" y2="100" pathLength="1" />
        <line v-for="y in [20, 40, 60, 80]" :key="`h-${y}`" data-draw x1="0" :y1="y" x2="100" :y2="y" pathLength="1" />
      </g>

      <!-- Registration-mark crosshairs at two fixed points — the same
           precision-accent visual language as the corner brackets
           elsewhere (navy/yellow, 15-20% opacity, consistent stroke). -->
      <g stroke-width="1" pathLength="1">
        <g stroke="#0B3954" stroke-opacity="0.35">
          <line data-draw x1="28" y1="34" x2="28" y2="46" />
          <line data-draw x1="22" y1="40" x2="34" y2="40" />
        </g>
        <circle cx="28" cy="40" r="1.4" fill="none" stroke="#0B3954" stroke-opacity="0.3" stroke-width="0.6" />

        <g stroke="#FBBA00" stroke-opacity="0.4">
          <line data-draw x1="66" y1="62" x2="66" y2="74" />
          <line data-draw x1="60" y1="68" x2="72" y2="68" />
        </g>
        <circle cx="66" cy="68" r="1.4" fill="none" stroke="#FBBA00" stroke-opacity="0.35" stroke-width="0.6" />
      </g>
    </svg>
  </div>
</template>

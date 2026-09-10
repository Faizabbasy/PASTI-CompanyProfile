<script setup lang="ts">
import gsap from 'gsap'

// Explore — Lite take on Mat Voyce's Awwwards Site of the Day technique
// ("letters that stretch and snap, timeline-driven"). Simplified to just
// one oversized background glyph that gently scaleX-stretches and snaps
// back on a slow GSAP loop — understated, no stagger, no full word.
const letterRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!letterRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6 })
  tl.to(letterRef.value, { scaleX: 1.35, skewX: -4, duration: 0.5, ease: 'power2.out' })
  tl.to(letterRef.value, { scaleX: 1, skewX: 0, duration: 0.85, ease: 'elastic.out(1, 0.45)' })

  return () => tl.kill()
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center">
    <span
      ref="letterRef"
      class="select-none font-display font-extrabold leading-none text-navy-900 opacity-[0.06] origin-center"
      style="font-size: 34vw"
    >P</span>
  </div>
</template>

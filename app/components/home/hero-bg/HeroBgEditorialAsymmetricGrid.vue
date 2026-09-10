<script setup lang="ts">
import gsap from 'gsap'

// Editorial — Asymmetric layout-grid overlay. A handful of uneven "column"
// guide blocks like a magazine layout grid (never a uniform CSS grid), one
// tinted navy and one tinted yellow at low opacity, the rest left as thin
// outlines, plus a couple of small caption labels for editorial credibility.
// Composition-led rather than motion-led: a single slow fade-in on load,
// nothing continuous after that.
const rootRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!rootRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) return

  const blocks = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-block]'))
  const labels = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-label]'))

  gsap.set(blocks, { opacity: 0, y: 16 })
  gsap.set(labels, { opacity: 0 })

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
  tl.to(blocks, { opacity: 1, y: 0, duration: 1.2, stagger: 0.12 })
  tl.to(labels, { opacity: 1, duration: 0.8, stagger: 0.1 }, '-=0.6')

  return () => {
    tl.kill()
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div data-block="" class="absolute left-[6%] top-[10%] h-[36%] w-[18%] border border-navy-700/20" />
    <div data-block="" class="absolute left-[26%] top-[10%] h-[62%] w-[10%] bg-navy-700 opacity-[0.05]" />
    <div data-block="" class="absolute left-[40%] top-[24%] h-[48%] w-[26%] border border-navy-700/20" />
    <div data-block="" class="absolute right-[8%] top-[14%] h-[30%] w-[16%] bg-yellow-500 opacity-[0.08]" />
    <div data-block="" class="absolute bottom-[8%] right-[8%] h-[20%] w-[30%] border border-navy-700/20" />

    <span
      data-label=""
      class="absolute left-[6%] top-[47%] font-display text-eyebrow font-semibold uppercase tracking-[0.3em] text-navy-700 opacity-[0.16]"
    >
      Grid — A
    </span>
    <span
      data-label=""
      class="absolute bottom-[6%] right-[8%] font-display text-eyebrow font-semibold uppercase tracking-[0.3em] text-navy-700 opacity-[0.16]"
    >
      Fig. 02
    </span>
  </div>
</template>

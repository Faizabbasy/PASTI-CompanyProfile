<script setup lang="ts">
import gsap from 'gsap'

// 2D — Ambient version of Mat Voyce's Awwwards Site of the Day technique
// ("type-in-motion: letters that stretch, snap, and recombine, all
// timeline-driven" — built with GSAP + R3F on the original site, here
// re-authored purely in DOM/CSS since this category has no WebGL). Large
// background letterforms spelling PASTI are each an individually
// transformable span; a GSAP timeline staggers through them on a loop,
// scaleX-stretching + skewing one letter at a time then snapping it back
// with a controlled elastic ease — not a one-shot intro, an endless texture
// loop sitting at low opacity behind real Hero content.
const rootRef = ref<HTMLElement | null>(null)
const letters = ['P', 'A', 'S', 'T', 'I']

useGsapContext(() => {
  if (!rootRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  const els = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-letter]'))
  if (!els.length) return

  const tl = gsap.timeline({ repeat: -1 })

  els.forEach((el, i) => {
    const pos = i * 1.1
    tl.to(el, {
      scaleX: 1.9,
      skewX: -8,
      duration: 0.42,
      ease: 'power3.out'
    }, pos)
    tl.to(el, {
      scaleX: 1,
      skewX: 0,
      duration: 0.9,
      ease: 'elastic.out(1, 0.4)'
    }, pos + 0.42)
  })

  return () => {
    tl.kill()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center">
    <div ref="rootRef" class="flex select-none font-display font-extrabold leading-none text-navy-900 opacity-[0.07]" style="font-size: 22vw">
      <span
        v-for="(letter, i) in letters"
        :key="i"
        data-letter=""
        class="inline-block origin-center"
      >{{ letter }}</span>
    </div>
  </div>
</template>

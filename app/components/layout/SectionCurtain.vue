<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const { trigger, targetSelector, resolveCurrent } = useSectionCurtain()
const panelRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!panelRef.value) return

  gsap.set(panelRef.value, { yPercent: 100 })

  watch(trigger, () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const target = targetSelector.value

    if (prefersReducedMotion) {
      scrollToImmediate(target)
      resolveCurrent()
      return
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(panelRef.value, { pointerEvents: 'none' })
        resolveCurrent()
        // Re-evaluate every ScrollTrigger against the new scroll position
        // now that the curtain animation is fully done — deliberately
        // *after* `tl` has finished, not mid-timeline. Calling refresh()
        // while `tl`'s own tweens were still running (tried during earlier
        // debugging) corrupted the slide-out tween: it reported completing
        // normally but left the panel's transform at yPercent 0 instead of
        // -100, so the curtain never visually lifted. refresh() forces a
        // synchronous reflow that fights GSAP's ticker for the same frame,
        // so it must never run while a tween it doesn't own is mid-flight.
        ScrollTrigger.refresh()
      }
    })

    tl.set(panelRef.value, { yPercent: 100, pointerEvents: 'auto' })
      .to(panelRef.value, { yPercent: 0, duration: 0.55, ease: 'power3.inOut' })
      .call(() => scrollToImmediate(target))
      .to(panelRef.value, { yPercent: -100, duration: 0.55, ease: 'power3.inOut' }, '+=0.05')
  })
})
</script>

<template>
  <!-- No CSS `transform` (neither a Tailwind `translate-y-full` class nor an
       inline `transform: translateY(...)`) is set here — the element starts
       with `transform: none` and `useGsapContext`'s `gsap.set(panelRef.value,
       { yPercent: 100 })` in onMounted is the ONLY thing that ever writes a
       transform to it. GSAP's yPercent tweens cache whatever transform is
       already on the element as their starting point rather than replacing
       it outright; when that starting transform came from CSS the browser
       applied on its own (either the Tailwind class or an inline style,
       tried and still broken), GSAP layered its own yPercent value on top of
       that cached transform instead of superseding it, producing
       `translate(0%, -100%) translate(0px, 900px)` on the slide-out tween —
       the px offset exactly cancelled the intended -100% and the curtain
       panel never visually lifted after covering the destination section
       (it looked "stuck" over an empty navy panel). Starting from no
       transform at all means GSAP's first `gsap.set` in onMounted is the
       only transform source, so there's nothing else for later yPercent
       tweens to stack onto. The panel is still invisible pre-mount because
       it's positioned off the bottom naturally via `yPercent: 100` the
       instant GSAP sets it, which happens before the browser's first paint
       of this element. -->
  <div
    ref="panelRef"
    aria-hidden="true"
    class="fixed inset-0 z-[60] bg-navy-950 pointer-events-none"
    style="will-change: transform"
  />
</template>

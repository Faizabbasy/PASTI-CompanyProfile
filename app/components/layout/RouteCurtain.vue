<script setup lang="ts">
import gsap from 'gsap'

const { coverTrigger, revealTrigger, resolveCoverDone, resolveRevealDone } = useRouteCurtain()
const panelRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!panelRef.value) return
  const panel = panelRef.value
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Same "no CSS transform, GSAP's first gsap.set is the only transform
  // source" reasoning as LayoutSectionCurtain.vue — see that file for the
  // full explanation of why this matters for the slide-out tween.
  gsap.set(panel, { yPercent: 100 })

  watch(coverTrigger, () => {
    if (prefersReducedMotion) {
      resolveCoverDone()
      return
    }

    gsap.set(panel, { pointerEvents: 'auto' })
    gsap.to(panel, {
      yPercent: 0,
      duration: 0.55,
      ease: 'power3.inOut',
      onComplete: resolveCoverDone
    })
  })

  watch(revealTrigger, () => {
    if (prefersReducedMotion) {
      resolveRevealDone()
      return
    }

    gsap.to(panel, {
      yPercent: -100,
      duration: 0.55,
      ease: 'power3.inOut',
      delay: 0.05,
      onComplete: () => {
        gsap.set(panel, { pointerEvents: 'none' })
        resolveRevealDone()
      }
    })
  })
})
</script>

<template>
  <div
    ref="panelRef"
    aria-hidden="true"
    class="fixed inset-0 z-[70] bg-paper pointer-events-none"
    style="will-change: transform"
  />
</template>

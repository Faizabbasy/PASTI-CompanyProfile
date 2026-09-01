<script setup lang="ts">
import gsap from 'gsap'

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
  <div
    ref="panelRef"
    aria-hidden="true"
    class="fixed inset-0 z-[60] bg-navy-950 pointer-events-none"
  />
</template>

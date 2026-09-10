<script setup lang="ts">
import gsap from 'gsap'

// 2D Intro — Mask wipe. Two full-bleed panels (navy, yellow) slide apart
// from center like a curtain opening, with the "PASTI" wordmark clipped
// via a CSS clip-path that expands from a thin horizontal line to full
// height right as the panels part — a clean, confident split-reveal.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const panelLeftRef = ref<HTMLElement | null>(null)
const panelRightRef = ref<HTMLElement | null>(null)
const wordRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const tl = gsap.timeline({
    onComplete: () => emit('complete')
  })

  gsap.set(wordRef.value, { clipPath: 'inset(48% 0% 48% 0%)' })

  tl.to(wordRef.value, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power3.inOut', delay: 0.3 })
  tl.to({}, { duration: 0.4 })
  tl.to(panelLeftRef.value, { xPercent: -100, duration: 0.8, ease: 'power3.inOut' })
  tl.to(panelRightRef.value, { xPercent: 100, duration: 0.8, ease: 'power3.inOut' }, '<')
  tl.set(overlayRef.value, { autoAlpha: 0 })

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] overflow-hidden">
    <div ref="panelLeftRef" class="absolute inset-y-0 left-0 w-1/2 bg-navy-900" />
    <div ref="panelRightRef" class="absolute inset-y-0 right-0 w-1/2 bg-navy-900" />
    <div class="absolute inset-0 flex items-center justify-center">
      <span ref="wordRef" class="font-display text-4xl font-extrabold tracking-tight text-paper md:text-6xl">PASTI</span>
    </div>
  </div>
</template>

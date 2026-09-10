<script setup lang="ts">
import gsap from 'gsap'

// Motion Intro — Pulse dot. A single small dot breathes/pulses (scale +
// opacity) 2-3 times, each pulse slightly bigger than the last, then on
// the final pulse it expands into a full-screen circle-wipe that reveals
// the page — minimal built-up anticipation from one simple element rather
// than many moving parts.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const dotRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const tl = gsap.timeline({
    onComplete: () => emit('complete')
  })

  gsap.set(dotRef.value, { scale: 0.6, opacity: 0.5 })

  for (let i = 0; i < 3; i++) {
    tl.to(dotRef.value, { scale: 0.6 + i * 0.15, opacity: 1, duration: 0.3, ease: 'power2.out' })
    tl.to(dotRef.value, { scale: 0.5 + i * 0.15, opacity: 0.5, duration: 0.3, ease: 'power2.in' })
  }

  tl.to(dotRef.value, {
    scale: 60,
    duration: 0.7,
    ease: 'power3.in',
    onComplete: () => gsap.set(overlayRef.value, { autoAlpha: 0 })
  })

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] flex items-center justify-center bg-paper">
    <div ref="dotRef" class="h-4 w-4 rounded-full bg-navy-900" />
  </div>
</template>

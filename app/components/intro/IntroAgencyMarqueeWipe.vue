<script setup lang="ts">
import gsap from 'gsap'

// Agency Intro — Marquee wipe. A fast horizontal marquee of the brand
// wordmark races across the screen 2-3 times, each pass slightly slower
// than the last (deceleration reads as "settling"), then the final pass
// stops centered and the whole band scales up to fill/fade the screen —
// borrowed from agency sites that use a rushing ticker as their loading
// beat instead of a static spinner.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(overlayRef.value, { autoAlpha: 0, duration: 0.5, onComplete: () => emit('complete') })
    }
  })

  gsap.set(trackRef.value, { xPercent: 100 })

  tl.to(trackRef.value, { xPercent: -100, duration: 0.7, ease: 'power1.in' })
  tl.set(trackRef.value, { xPercent: 100 })
  tl.to(trackRef.value, { xPercent: -50, duration: 0.9, ease: 'power2.inOut' })
  tl.set(trackRef.value, { xPercent: 60 })
  tl.to(trackRef.value, { xPercent: 0, duration: 0.6, ease: 'power3.out' })
  tl.to({}, { duration: 0.5 })
  tl.to(trackRef.value, { scale: 1.4, duration: 0.5, ease: 'power2.in' })

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-navy-950">
    <span ref="trackRef" class="whitespace-nowrap font-display text-6xl font-extrabold tracking-tight text-paper md:text-8xl">PASTI</span>
  </div>
</template>

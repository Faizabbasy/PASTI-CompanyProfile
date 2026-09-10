<script setup lang="ts">
import gsap from 'gsap'

// Agency Intro — Slab reveal. A bold solid-color slab slides in from the
// left carrying the wordmark, holds center-stage like a title card, then
// slides fully out to the right while a second slab (offset, different
// color) follows a beat behind — a layered "title cards" move borrowed
// from film-style agency reels rather than a wipe/mask technique.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const slabBackRef = ref<HTMLElement | null>(null)
const slabFrontRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const tl = gsap.timeline({
    onComplete: () => emit('complete')
  })

  gsap.set(slabBackRef.value, { xPercent: -100 })
  gsap.set(slabFrontRef.value, { xPercent: -100 })

  tl.to(slabBackRef.value, { xPercent: 0, duration: 0.5, ease: 'power3.out' })
  tl.to(slabFrontRef.value, { xPercent: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
  tl.to({}, { duration: 0.6 })
  tl.to(slabFrontRef.value, { xPercent: 100, duration: 0.55, ease: 'power3.in' })
  tl.to(slabBackRef.value, { xPercent: 100, duration: 0.55, ease: 'power3.in' }, '-=0.35')
  tl.set(overlayRef.value, { autoAlpha: 0 })

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] overflow-hidden">
    <div ref="slabBackRef" class="absolute inset-0 bg-navy-700" />
    <div ref="slabFrontRef" class="absolute inset-0 flex items-center justify-center bg-navy-900">
      <span class="font-display text-4xl font-extrabold tracking-tight text-paper md:text-6xl">PASTI</span>
    </div>
  </div>
</template>

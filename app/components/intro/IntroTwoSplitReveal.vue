<script setup lang="ts">
import gsap from 'gsap'

// 2D Intro — Split panel reveal. Screen divides into vertical strips (like
// window blinds), each strip's height animates from 0 with a staggered
// delay to build a "loading bars settling" look, then all strips retract
// upward together — a technique closer to a design-tool splash than a
// generic spinner.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const STRIPS = 8

onMounted(() => {
  const strips = Array.from(document.querySelectorAll<HTMLElement>('[data-strip]'))
  gsap.set(strips, { scaleY: 0, transformOrigin: 'center' })

  const tl = gsap.timeline({
    onComplete: () => emit('complete')
  })

  tl.to(strips, { scaleY: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' })
  tl.to({}, { duration: 0.35 })
  tl.to(strips, { scaleY: 0, duration: 0.5, stagger: 0.04, ease: 'power3.in' })
  tl.set(overlayRef.value, { autoAlpha: 0 })

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] flex">
    <div v-for="i in STRIPS" :key="i" data-strip="" class="h-full flex-1" :style="{ backgroundColor: i % 2 === 0 ? '#0B3954' : '#082A3E' }" />
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span class="font-display text-3xl font-extrabold tracking-tight text-paper md:text-5xl">PASTI</span>
    </div>
  </div>
</template>

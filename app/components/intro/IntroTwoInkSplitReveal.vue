<script setup lang="ts">
import gsap from 'gsap'

// 2D Intro — Ink + split reveal. Combines the ink-spread logo bloom with
// the split-panel strip mechanic: vertical strips build up first (the
// "loading bars settling" beat), then an ink bloom expands from center
// behind large wordmark type, and finally the strips retract to reveal the
// fully bloomed mark before handing off — layers two prior single-trick
// intros into one longer, more elaborate sequence.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const inkRef = ref<HTMLElement | null>(null)
const wordRef = ref<HTMLElement | null>(null)
const STRIPS = 8

onMounted(() => {
  const strips = Array.from(document.querySelectorAll<HTMLElement>('[data-strip]'))
  gsap.set(strips, { scaleY: 0, transformOrigin: 'center' })
  gsap.set(inkRef.value, { scale: 0, opacity: 0.9 })
  gsap.set(wordRef.value, { opacity: 0, scale: 0.85, filter: 'blur(10px)' })

  const tl = gsap.timeline({
    onComplete: () => emit('complete')
  })

  tl.to(strips, { scaleY: 1, duration: 0.55, stagger: 0.05, ease: 'power3.out' })
  tl.to(inkRef.value, { scale: 8, opacity: 1, duration: 1.1, ease: 'power2.out' }, '-=0.15')
  tl.to(wordRef.value, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power4.out' }, '-=0.6')
  tl.to({}, { duration: 0.5 })
  tl.to(strips, { scaleY: 0, duration: 0.55, stagger: 0.04, ease: 'power3.in' })
  tl.to([inkRef.value, wordRef.value], { opacity: 0, duration: 0.3 }, '<')
  tl.set(overlayRef.value, { autoAlpha: 0 })

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-paper">
    <div v-for="i in STRIPS" :key="i" data-strip="" class="absolute inset-y-0 h-full" :style="{ left: `${((i - 1) / STRIPS) * 100}%`, width: `${100 / STRIPS}%`, backgroundColor: i % 2 === 0 ? '#0B3954' : '#082A3E' }" />
    <div
      ref="inkRef"
      aria-hidden="true"
      class="pointer-events-none absolute h-10 w-10 rounded-full bg-yellow-500"
    />
    <span
      ref="wordRef"
      class="relative font-display text-[clamp(3rem,9vw,8rem)] font-extrabold tracking-tight text-paper"
    >PASTI</span>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

// Agency Intro — Slab + glyph resolve. Combines the layered title-card
// slabs with the glyph-decryption letter cycle: two offset slabs slide in
// and hold like a film title card, letters of "PASTI" decrypt/resolve on
// the front slab at large scale, hold briefly, then both slabs slide out
// together — a more elaborate, premium escalation of either single-trick
// variant, closing on a fully "materialized" wordmark rather than a static one.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const slabBackRef = ref<HTMLElement | null>(null)
const slabFrontRef = ref<HTMLElement | null>(null)

const word = 'PASTI'
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&$'

onMounted(() => {
  const letterEls = Array.from(document.querySelectorAll<HTMLElement>('[data-glyph]'))

  const tl = gsap.timeline({
    onComplete: () => emit('complete')
  })

  gsap.set(slabBackRef.value, { xPercent: -100 })
  gsap.set(slabFrontRef.value, { xPercent: -100 })

  tl.to(slabBackRef.value, { xPercent: 0, duration: 0.55, ease: 'power3.out' })
  tl.to(slabFrontRef.value, { xPercent: 0, duration: 0.55, ease: 'power3.out' }, '-=0.35')

  letterEls.forEach((el, i) => {
    const target = word[i]!
    const cycles = 7 + i
    const obj = { n: 0 }
    tl.to(
      obj,
      {
        n: cycles,
        duration: cycles * 0.04,
        ease: 'none',
        onUpdate: () => {
          const step = Math.floor(obj.n)
          el.textContent = step >= cycles - 1 ? target : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!
        }
      },
      `-=${i === 0 ? 0.1 : 0.35}`
    )
  })

  tl.to({}, { duration: 0.7 })
  tl.to(slabFrontRef.value, { xPercent: 100, duration: 0.6, ease: 'power3.in' })
  tl.to(slabBackRef.value, { xPercent: 100, duration: 0.6, ease: 'power3.in' }, '-=0.4')
  tl.set(overlayRef.value, { autoAlpha: 0 })

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] overflow-hidden">
    <div ref="slabBackRef" class="absolute inset-0 bg-navy-700" />
    <div ref="slabFrontRef" class="absolute inset-0 flex items-center justify-center bg-navy-900">
      <div class="flex font-display text-[clamp(3.5rem,10vw,9rem)] font-extrabold tracking-tight text-paper">
        <span v-for="(_, i) in word" :key="i" data-glyph="" class="inline-block w-[0.72em] text-center" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

// Agency Intro — Glyph cycle. Each letter of "PASTI" independently cycles
// through a few random glyphs (like a slot machine / decryption effect)
// before settling on its correct character, letters resolving left to
// right with a slight stagger — a "text materializing" effect popular on
// tech-leaning agency sites, distinct from a plain typewriter because
// every letter is visibly "searching" before landing.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)

const word = 'PASTI'
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&$'

onMounted(() => {
  const letterEls = Array.from(document.querySelectorAll<HTMLElement>('[data-glyph]'))

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(overlayRef.value, { autoAlpha: 0, duration: 0.5, onComplete: () => emit('complete') })
    }
  })

  letterEls.forEach((el, i) => {
    const target = word[i]!
    const cycles = 6 + i
    const obj = { n: 0 }
    tl.to(
      obj,
      {
        n: cycles,
        duration: cycles * 0.035,
        ease: 'none',
        onUpdate: () => {
          const step = Math.floor(obj.n)
          el.textContent = step >= cycles - 1 ? target : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!
        }
      },
      i * 0.08
    )
  })
  tl.to({}, { duration: 0.6 })

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] flex items-center justify-center bg-navy-950">
    <div class="flex font-mono text-4xl font-bold tracking-wide text-paper md:text-6xl">
      <span v-for="(_, i) in word" :key="i" data-glyph="" class="inline-block w-[0.65em] text-center" />
    </div>
  </div>
</template>

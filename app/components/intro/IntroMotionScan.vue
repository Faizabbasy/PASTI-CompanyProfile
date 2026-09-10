<script setup lang="ts">
import gsap from 'gsap'

// Motion Intro — Scan line reveal. A thin bright horizontal line sweeps
// top-to-bottom exactly once (like a document scanner or CRT warm-up),
// with the wordmark's opacity tied to whether the scan line has passed
// over it yet (revealed progressively as the line crosses it, not a
// separate fade) — then the whole overlay fades once the sweep completes.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const lineRef = ref<HTMLElement | null>(null)
const markRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(overlayRef.value, { autoAlpha: 0, duration: 0.5, onComplete: () => emit('complete') })
    }
  })

  gsap.set(lineRef.value, { yPercent: -100 })
  gsap.set(markRef.value, { clipPath: 'inset(0% 0% 100% 0%)' })

  tl.to({}, { duration: 0.2 })
  tl.to([lineRef.value, markRef.value], {
    yPercent: (i) => (i === 0 ? 220 : 0),
    clipPath: (i) => (i === 1 ? 'inset(0% 0% 0% 0%)' : undefined),
    duration: 1,
    ease: 'power1.inOut'
  })
  tl.to({}, { duration: 0.4 })

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] overflow-hidden bg-navy-950">
    <div ref="lineRef" class="absolute inset-x-0 h-px bg-yellow-400" style="box-shadow: 0 0 20px 2px rgba(251, 186, 0, 0.6)" />
    <div class="absolute inset-0 flex items-center justify-center">
      <span ref="markRef" class="font-display text-2xl font-extrabold tracking-tight text-paper">PASTI</span>
    </div>
  </div>
</template>

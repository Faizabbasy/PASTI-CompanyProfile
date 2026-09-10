<script setup lang="ts">
import gsap from 'gsap'

// Motion Intro — Soft crossfade. The quietest possible option: a plain
// paper-colored overlay with a small centered wordmark fades in, holds,
// then the whole overlay simply fades out (no wipe, no mask, no motion
// beyond opacity) — for a brand/client that wants zero flourish but still
// a deliberate branded beat before the page appears, rather than an
// abrupt cut straight to the Hero.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const markRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const tl = gsap.timeline({
    onComplete: () => emit('complete')
  })

  gsap.set(markRef.value, { opacity: 0 })
  tl.to(markRef.value, { opacity: 1, duration: 0.6, ease: 'sine.inOut' })
  tl.to({}, { duration: 0.5 })
  tl.to(markRef.value, { opacity: 0, duration: 0.4, ease: 'sine.inOut' })
  tl.to(overlayRef.value, { autoAlpha: 0, duration: 0.6, ease: 'sine.inOut' }, '-=0.2')

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] flex items-center justify-center bg-paper">
    <span ref="markRef" class="font-display text-xl font-semibold tracking-[0.2em] text-navy-700">PASTI</span>
  </div>
</template>

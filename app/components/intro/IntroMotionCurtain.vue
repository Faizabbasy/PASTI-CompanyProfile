<script setup lang="ts">
import gsap from 'gsap'

// Motion Intro — Curtain rise. A single solid panel covers the screen,
// holds briefly with a centered mark fading in/out, then rises straight up
// off-screen — deliberately the simplest, calmest possible intro (matches
// the existing LayoutSectionCurtain/RouteCurtain motion language already
// used for in-page and route transitions elsewhere in the app, so it reads
// as consistent rather than a one-off).
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const markRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const tl = gsap.timeline({
    onComplete: () => emit('complete')
  })

  gsap.set(markRef.value, { opacity: 0, y: 8 })
  tl.to(markRef.value, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.2 })
  tl.to({}, { duration: 0.5 })
  tl.to(markRef.value, { opacity: 0, duration: 0.3 })
  tl.to(overlayRef.value, { yPercent: -100, duration: 0.7, ease: 'power3.inOut' }, '-=0.1')

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] flex items-center justify-center bg-paper">
    <span ref="markRef" class="font-display text-2xl font-extrabold tracking-tight text-navy-900">PASTI</span>
  </div>
</template>

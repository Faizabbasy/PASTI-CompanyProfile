<script setup lang="ts">
import gsap from 'gsap'

// 2D Intro — Ink spread logo. The "P" mark (a simple circle+bar standing
// in for the PASTI monogram) is revealed by an expanding circular mask
// that grows from the mark's own center with a slightly irregular edge
// (achieved via a blurred mask edge, evoking ink soaking into paper)
// rather than a clean circle-wipe — then the mask keeps growing past the
// viewport to reveal the page.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const maskRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const tl = gsap.timeline({
    onComplete: () => emit('complete')
  })

  tl.set(maskRef.value, { '--reveal-r': '0px' })
  tl.to({}, { duration: 0.3 })
  tl.to(maskRef.value, {
    '--reveal-r': '90px',
    duration: 0.8,
    ease: 'power2.out'
  })
  tl.to({}, { duration: 0.4 })
  tl.to(maskRef.value, {
    '--reveal-r': '2400px',
    duration: 0.9,
    ease: 'power3.in',
    onComplete: () => gsap.set(overlayRef.value, { autoAlpha: 0 })
  })

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90]">
    <div class="absolute inset-0 bg-paper" />
    <div ref="maskRef" class="ink-mask absolute inset-0 flex items-center justify-center bg-navy-900">
      <div class="relative flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400">
        <span class="font-display text-4xl font-extrabold text-navy-900">P</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ink-mask {
  --reveal-r: 0px;
  -webkit-mask-image: radial-gradient(circle var(--reveal-r) at 50% 50%, transparent 60%, black 100%);
  mask-image: radial-gradient(circle var(--reveal-r) at 50% 50%, transparent 60%, black 100%);
  filter: blur(0.4px);
}
</style>

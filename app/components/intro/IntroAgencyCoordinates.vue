<script setup lang="ts">
import gsap from 'gsap'

// Agency Intro — Coordinates readout. A technical/process-driven feel:
// small corner labels (lat/long-style fake coordinates, a status line that
// cycles through "INITIALIZING… / LOADING ASSETS… / READY") count up while
// crop-mark brackets at the four corners animate inward to frame the
// centered wordmark, then everything snaps outward and fades — echoes the
// "editorial grid" Hero option's aesthetic but as a load sequence.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const statusRef = ref<HTMLElement | null>(null)

const statuses = ['INITIALIZING', 'LOADING ASSETS', 'CALIBRATING', 'READY']

onMounted(() => {
  const brackets = Array.from(document.querySelectorAll<HTMLElement>('[data-bracket]'))
  gsap.set(brackets, { opacity: 0, scale: 1.6 })

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(overlayRef.value, { autoAlpha: 0, duration: 0.4, onComplete: () => emit('complete') })
    }
  })

  tl.to(brackets, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.06, ease: 'power2.out' })

  statuses.forEach((status) => {
    tl.call(() => {
      if (statusRef.value) statusRef.value.textContent = status
    })
    tl.to({}, { duration: 0.3 })
  })

  tl.to({}, { duration: 0.3 })
  tl.to(brackets, { opacity: 0, scale: 1.6, duration: 0.4, ease: 'power2.in' })

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] flex items-center justify-center bg-paper">
    <div data-bracket="" class="absolute left-6 top-6 h-8 w-8 border-l-2 border-t-2 border-navy-700" />
    <div data-bracket="" class="absolute right-6 top-6 h-8 w-8 border-r-2 border-t-2 border-navy-700" />
    <div data-bracket="" class="absolute bottom-6 left-6 h-8 w-8 border-b-2 border-l-2 border-navy-700" />
    <div data-bracket="" class="absolute bottom-6 right-6 h-8 w-8 border-b-2 border-r-2 border-navy-700" />

    <div class="flex flex-col items-center gap-3">
      <span class="font-display text-3xl font-extrabold tracking-tight text-navy-900 md:text-5xl">PASTI</span>
      <span ref="statusRef" class="font-mono text-[10px] tracking-[0.3em] text-navy-400" />
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

// Motion Intro — Progress bar. A thin bar fills left-to-right with
// slightly uneven, realistic-feeling pacing (a few small pauses/bursts via
// a timeline of unequal segments, not one flat linear tween — reads as
// "actually loading something" rather than an obviously decorative fill),
// paired with a percentage readout, then the bar's container wipes away.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const barRef = ref<HTMLElement | null>(null)
const pctRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(overlayRef.value, { autoAlpha: 0, duration: 0.5, onComplete: () => emit('complete') })
    }
  })

  const state = { pct: 0 }
  const segments = [
    { to: 32, duration: 0.5 },
    { to: 48, duration: 0.15 },
    { to: 51, duration: 0.4 },
    { to: 82, duration: 0.5 },
    { to: 100, duration: 0.3 }
  ]

  segments.forEach((seg) => {
    tl.to(state, {
      pct: seg.to,
      duration: seg.duration,
      ease: 'power1.inOut',
      onUpdate: () => {
        const v = Math.round(state.pct)
        if (barRef.value) barRef.value.style.width = `${v}%`
        if (pctRef.value) pctRef.value.textContent = `${v}%`
      }
    })
  })
  tl.to({}, { duration: 0.35 })

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-navy-950">
    <span class="font-display text-lg font-semibold tracking-tight text-paper">PASTI</span>
    <div class="h-px w-48 overflow-hidden bg-navy-800 md:w-64">
      <div ref="barRef" class="h-full bg-yellow-400" style="width: 0%" />
    </div>
    <span ref="pctRef" class="font-mono text-xs text-navy-300">0%</span>
  </div>
</template>

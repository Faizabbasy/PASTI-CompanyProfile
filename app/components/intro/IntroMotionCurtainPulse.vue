<script setup lang="ts">
import gsap from 'gsap'

// Motion Intro — Curtain + pulse. Combines the calm curtain-panel language
// with a breathing pulse-dot beat while the panel holds: a soft dot pulses
// 2-3 times behind the mark (like a heartbeat / loading pulse), the mark
// then scales up dramatically with a light bloom, and the whole curtain
// rises off-screen — more elaborate and "alive" than the plain curtain
// while staying calm/elegant rather than flashy.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const pulseRef = ref<HTMLElement | null>(null)
const markRef = ref<HTMLElement | null>(null)
const shineRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const tl = gsap.timeline({
    onComplete: () => emit('complete')
  })

  gsap.set(pulseRef.value, { scale: 0.4, opacity: 0.5 })
  gsap.set(markRef.value, { opacity: 0, scale: 0.9, filter: 'blur(8px)' })
  if (shineRef.value) gsap.set(shineRef.value, { opacity: 0, backgroundPosition: '150% 150%' })

  tl.to(pulseRef.value, { scale: 1.6, opacity: 0, duration: 0.9, ease: 'power2.out', repeat: 1 }, 0.1)
  tl.to(markRef.value, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power4.out' }, 0.5)
  if (shineRef.value) {
    tl.to(shineRef.value, { opacity: 1, backgroundPosition: '-50% -50%', duration: 1, ease: 'cubic-bezier(0.65, 0, 0.35, 1)' }, '-=0.3')
  }
  tl.to({}, { duration: 0.6 })
  tl.to(markRef.value, { opacity: 0, duration: 0.3 })
  tl.to(overlayRef.value, { yPercent: -100, duration: 0.8, ease: 'power3.inOut' }, '-=0.1')

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-paper">
    <div ref="pulseRef" aria-hidden="true" class="pointer-events-none absolute h-24 w-24 rounded-full bg-yellow-500/60 blur-xl" />
    <div class="relative">
      <span ref="markRef" class="block font-display text-[clamp(3rem,8vw,7rem)] font-extrabold tracking-tight text-navy-900">PASTI</span>
      <span
        ref="shineRef"
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.9)_50%,transparent_65%)] bg-[length:250%_250%] bg-clip-text font-display text-[clamp(3rem,8vw,7rem)] font-extrabold tracking-tight text-transparent [-webkit-text-fill-color:transparent]"
      >PASTI</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

// Explore — Lite take on Iventions' "GSAP-paced spotlit reveals". A single
// soft light gradient sweeps slowly left-to-right on a basic looping
// timeline, revealing a faint static grid underneath — simpler than the
// flagship rig (no multi-beat cue list, one straight pass back and forth).
const glowRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!glowRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    gsap.set(glowRef.value, { left: '50%', top: '50%' })
    return
  }

  const tl = gsap.timeline({ repeat: -1, yoyo: true })
  tl.fromTo(
    glowRef.value,
    { left: '10%', top: '40%' },
    { left: '90%', top: '60%', duration: 9, ease: 'sine.inOut' }
  )

  return () => tl.kill()
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="sweep-grid absolute inset-0" />
    <div ref="glowRef" class="sweep-glow" />
  </div>
</template>

<style scoped>
.sweep-grid {
  background-image:
    linear-gradient(theme(colors.navy.500 / 12%) 1px, transparent 1px),
    linear-gradient(90deg, theme(colors.navy.500 / 12%) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.5;
}

.sweep-glow {
  position: absolute;
  width: 28vw;
  height: 28vw;
  max-width: 420px;
  max-height: 420px;
  margin: -14vw 0 0 -14vw;
  border-radius: 9999px;
  filter: blur(70px);
  opacity: 0.55;
  will-change: left, top;
  background: radial-gradient(circle at 45% 40%, theme(colors.yellow.300 / 80%), theme(colors.yellow.500 / 15%) 55%, transparent 72%);
}
</style>

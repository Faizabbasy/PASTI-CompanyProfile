<script setup lang="ts">
import gsap from 'gsap'

// Motion — A single soft radial glow, off-center, that "breathes": scale
// and opacity oscillate on a slow sine (~7s cycle) while its color
// temperature drifts between cool navy and warm yellow on a much longer,
// independent cycle (~40s) — two unsynced rhythms so it never feels like a
// mechanical loop. Meditative and barely-there, closer to a slow exhale
// than an animation.
const glowRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!glowRef.value) return
  const glow = glowRef.value
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    gsap.set(glow, { scale: 1.04, opacity: 0.55, '--glow-mix': 0.5 })
    return
  }

  gsap.to(glow, {
    scale: 1.12,
    opacity: 0.65,
    duration: 7,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1
  })

  const mix = { value: 0 }
  gsap.to(mix, {
    value: 1,
    duration: 40,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    onUpdate: () => glow.style.setProperty('--glow-mix', String(mix.value))
  })
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div ref="glowRef" class="glow" />
  </div>
</template>

<style scoped>
.glow {
  --glow-mix: 0;
  position: absolute;
  right: 10%;
  top: 12%;
  width: 42vw;
  height: 42vw;
  max-width: 620px;
  max-height: 620px;
  border-radius: 9999px;
  opacity: 0.45;
  filter: blur(90px);
  will-change: transform, opacity;
  background: radial-gradient(
    circle at 45% 45%,
    color-mix(in srgb, theme(colors.navy.400) calc(100% - (var(--glow-mix) * 100%)), theme(colors.yellow.400) calc(var(--glow-mix) * 100%)),
    transparent 70%
  );
}
</style>

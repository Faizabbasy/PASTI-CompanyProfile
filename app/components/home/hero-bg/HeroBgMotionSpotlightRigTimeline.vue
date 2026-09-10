<script setup lang="ts">
import gsap from 'gsap'

// Motion — Spotlight rig timeline. Inspired by Iventions (Awwwards Site of
// the Day + Developer Award): a scene that treats each moment like a
// spotlit installation, with GSAP pacing the reveals so it reads as a
// guided walk-through rather than random motion. Here a single soft warm
// glow moves along a slow, pre-choreographed GSAP timeline — not
// cursor-driven, not randomized — pausing at a few deliberate "beats"
// across the viewport, like a gallery light rig on a timed program.
const glowRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  if (!glowRef.value) return
  const glow = glowRef.value
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Fixed "beats": a deliberate path with pauses, expressed as % of the
  // viewport. Not random — the same program every load, like a rig cue list.
  const beats = [
    { x: 22, y: 28, scale: 1 },
    { x: 68, y: 20, scale: 1.15 },
    { x: 58, y: 62, scale: 0.9 },
    { x: 30, y: 70, scale: 1.05 }
  ]

  if (prefersReducedMotion) {
    const first = beats[0]!
    gsap.set(glow, { left: `${first.x}%`, top: `${first.y}%`, scale: first.scale })
    return
  }

  const tl = gsap.timeline({ repeat: -1 })
  beats.forEach((beat) => {
    tl.to(glow, {
      left: `${beat.x}%`,
      top: `${beat.y}%`,
      scale: beat.scale,
      duration: 6,
      ease: 'power2.inOut'
    }).to(glow, { duration: 2.5 }) // hold — the "beat"
  })

  return () => {
    tl.kill()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div ref="glowRef" class="rig-glow" />
  </div>
</template>

<style scoped>
.rig-glow {
  position: absolute;
  width: 30vw;
  height: 30vw;
  max-width: 440px;
  max-height: 440px;
  margin: -15vw 0 0 -15vw;
  border-radius: 9999px;
  opacity: 0.5;
  filter: blur(85px);
  will-change: transform, left, top;
  background: radial-gradient(circle at 45% 40%, theme(colors.yellow.300 / 75%), theme(colors.yellow.500 / 15%) 55%, transparent 72%);
}
</style>

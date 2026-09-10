<script setup lang="ts">
import gsap from 'gsap'

// Motion — Rhythmic pulse grid. Inspired by Uncommon Studio (Awwwards Site
// of the Day): pacing that knows exactly when to be bold and when to pull
// back, using stagger and rhythm rather than constant motion. Here a
// sparse handful of soft dots sit still almost all the time; on a
// confident quantized beat (every 2.5s, not random) one dot briefly
// pulses with a sharp, non-bouncy ease — like a metronome or heartbeat,
// restrained rather than busy.
const rootRef = ref<HTMLElement | null>(null)
const BEAT = 2.5

const dots = [
  { x: 18, y: 24 },
  { x: 62, y: 16 },
  { x: 82, y: 52 },
  { x: 40, y: 60 },
  { x: 24, y: 82 },
  { x: 70, y: 78 }
]

useGsapContext(() => {
  if (!rootRef.value) return
  const el = rootRef.value
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const dotEls = Array.from(el.querySelectorAll<HTMLElement>('[data-dot]'))

  if (prefersReducedMotion || dotEls.length === 0) return

  let index = 0
  const interval = setInterval(() => {
    const target = dotEls[index % dotEls.length]!
    gsap.fromTo(
      target,
      { scale: 1, opacity: 0.35 },
      { scale: 2.4, opacity: 0.9, duration: 0.28, ease: 'power3.out', yoyo: true, repeat: 1 }
    )
    index++
  }, BEAT * 1000)

  return () => clearInterval(interval)
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      v-for="(dot, i) in dots"
      :key="i"
      data-dot=""
      class="pulse-dot"
      :style="{ left: `${dot.x}%`, top: `${dot.y}%` }"
    />
  </div>
</template>

<style scoped>
.pulse-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  border-radius: 9999px;
  opacity: 0.35;
  background: theme(colors.yellow.400 / 80%);
  box-shadow: 0 0 16px 3px theme(colors.yellow.300 / 40%);
  will-change: transform, opacity;
}

.pulse-dot:nth-child(3n) {
  background: theme(colors.navy.300 / 70%);
  box-shadow: 0 0 16px 3px theme(colors.navy.200 / 35%);
}
</style>

<script setup lang="ts">
import gsap from 'gsap'

// Agency — Inspired by Immersive Garden's Cartier digital-twin approach:
// rooms you move through, one alcove per idea. Four distinct rectangular
// "chambers", each with its own subtle border/background treatment, sit
// side by side on a strip that idle-pans left-to-right in a continuous
// seamless loop (duplicated strip, modulo translate) — like walking past
// gallery rooms at a slow dolly pace. Structural, premium, no parallax.
const rootRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)

const rooms = [
  { label: 'TECHNOLOGY', border: '#0B3954', bg: 'rgba(11, 57, 84, 0.05)' },
  { label: 'CREATIVITY', border: '#FBBA00', bg: 'rgba(251, 186, 0, 0.05)' },
  { label: 'IMPACT', border: '#0B2A3D', bg: 'rgba(11, 42, 61, 0.06)' },
  { label: 'PASTI', border: '#0B3954', bg: 'rgba(234, 241, 244, 0.04)' }
]

useGsapContext(() => {
  if (!trackRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const track = trackRef.value

  if (prefersReducedMotion) {
    gsap.set(track, { x: 0 })
    return
  }

  let halfWidth = track.scrollWidth / 2
  const resizeObserver = new ResizeObserver(() => {
    halfWidth = track.scrollWidth / 2
  })
  resizeObserver.observe(track)

  const state = { x: 0 }
  const speed = 14 // px/sec, slow deliberate dolly

  const ticker = gsap.ticker.add((_time, deltaMs) => {
    state.x -= (speed * deltaMs) / 1000
    if (Math.abs(state.x) >= halfWidth) state.x += halfWidth
    track.style.transform = `translateX(${state.x}px)`
  })

  return () => {
    resizeObserver.disconnect()
    gsap.ticker.remove(ticker)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 flex items-center overflow-hidden opacity-40">
    <div ref="trackRef" class="flex shrink-0 gap-[6vw] will-change-transform">
      <div v-for="rep in 2" :key="rep" class="flex shrink-0 gap-[6vw]">
        <div
          v-for="(room, i) in rooms"
          :key="`${rep}-${i}`"
          class="flex h-[46vh] w-[20vw] min-w-[220px] shrink-0 items-end border p-4"
          :style="{ borderColor: room.border, backgroundColor: room.bg }"
        >
          <span class="font-mono text-[10px] tracking-[0.2em] text-navy-700">{{ room.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

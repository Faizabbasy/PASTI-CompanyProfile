<script setup lang="ts">
import gsap from 'gsap'

// Editorial — Print-masthead marquee. Unlike the Agency marquee's fast,
// diagonal, scroll-reactive ticker, this scrolls flat and calm, full-bleed,
// at a fixed slow pace — closer to a magazine nameplate repeating along a
// header band than an agency ticker. Two duplicated tracks translate in a
// seamless loop; a fixed-speed GSAP ticker drives the transform.
const rootRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)

const words = ['PASTI', '·', 'PASTI', '·', 'PASTI', '·']

useGsapContext(() => {
  if (!trackRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const track = trackRef.value

  if (prefersReducedMotion) {
    gsap.set(track, { x: 0 })
    return
  }

  const speed = 12 // px/sec — deliberately slow, calm masthead pace
  const state = { x: 0 }

  let halfWidth = track.scrollWidth / 2
  const resizeObserver = new ResizeObserver(() => {
    halfWidth = track.scrollWidth / 2
  })
  resizeObserver.observe(track)

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
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 flex items-center overflow-hidden opacity-[0.05]">
    <div ref="trackRef" class="flex whitespace-nowrap will-change-transform">
      <span v-for="rep in 2" :key="rep" class="flex shrink-0">
        <span
          v-for="(w, i) in words"
          :key="`${rep}-${i}`"
          class="mx-5 font-display text-[9vw] font-extrabold leading-none tracking-tight text-navy-900"
        >
          {{ w }}
        </span>
      </span>
    </div>
  </div>
</template>

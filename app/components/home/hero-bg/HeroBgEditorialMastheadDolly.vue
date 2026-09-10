<script setup lang="ts">
import gsap from 'gsap'

// Editorial — Inspired by Immersive Garden's Cartier work ("rooms you move
// through") and Lusion's true Z-depth camera dolly, translated from 3D
// scenes into typography: instead of geometric forms at different Z depths
// (see HeroBgThreeZDepthCameraDolly), four oversized editorial words/
// phrases sit at simulated depths using scale + blur + opacity, each
// drifting horizontally at its own rate. Nearer "spreads" (large, sharp,
// full opacity) sweep past quickly; distant ones (small, soft, faint) crawl
// — a single continuous seamless loop per layer, like oversized magazine
// spreads passing camera on a slow rail.
const rootRef = ref<HTMLElement | null>(null)

const layers = [
  { text: 'FUTURE FORWARD', depth: 'near', y: 18, speed: 46, blur: 0, size: '11vw', opacity: 0.09 },
  { text: 'DESIGN AS CRAFT', depth: 'mid', y: 42, speed: 28, blur: 2, size: '7vw', opacity: 0.06 },
  { text: 'BUILT ON IMPACT', depth: 'mid-far', y: 64, speed: 17, blur: 4, size: '5vw', opacity: 0.045 },
  { text: 'PASTI STUDIO — N° 26', depth: 'far', y: 86, speed: 9, blur: 6, size: '3.4vw', opacity: 0.035 }
]

useGsapContext(() => {
  if (!rootRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  const tracks = Array.from(rootRef.value.querySelectorAll<HTMLElement>('[data-track]'))
  const tickers: Array<() => void> = []

  tracks.forEach((track, i) => {
    const speed = layers[i]!.speed
    const state = { x: 0 }
    let halfWidth = track.scrollWidth / 2

    const resizeObserver = new ResizeObserver(() => {
      halfWidth = track.scrollWidth / 2
    })
    resizeObserver.observe(track)

    const tick = (_time: number, deltaMs: number) => {
      state.x -= (speed * deltaMs) / 1000
      if (Math.abs(state.x) >= halfWidth) state.x += halfWidth
      track.style.transform = `translateX(${state.x}px)`
    }
    gsap.ticker.add(tick)

    tickers.push(() => {
      gsap.ticker.remove(tick)
      resizeObserver.disconnect()
    })
  })

  return () => {
    tickers.forEach((cleanup) => cleanup())
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      v-for="(layer, i) in layers"
      :key="i"
      class="absolute left-0 flex w-full whitespace-nowrap"
      :style="{ top: `${layer.y}%`, filter: layer.blur ? `blur(${layer.blur}px)` : 'none' }"
    >
      <div data-track="" class="flex shrink-0 will-change-transform">
        <span
          v-for="rep in 2"
          :key="rep"
          class="mr-24 select-none font-display font-extrabold leading-none tracking-tight text-navy-900"
          :style="{ fontSize: layer.size, opacity: layer.opacity }"
        >
          {{ layer.text }}
        </span>
      </div>
    </div>
  </div>
</template>

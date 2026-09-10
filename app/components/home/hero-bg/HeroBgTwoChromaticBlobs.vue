<script setup lang="ts">
// 2D — Chromatic blob mash-up. Large soft organic shapes float and slowly
// morph using an SVG goo filter (feGaussianBlur + feColorMatrix contrast
// boost fuses overlapping circles into single blobby silhouettes — the
// classic CSS/SVG "metaball" trick, cheaper than canvas metaballs since the
// browser's filter pipeline does the blending) restrained to navy/yellow on
// paper. A GSAP timeline drifts each blob's position/scale independently on
// long, staggered durations so the group never looks like it's looping in
// sync. A grain layer on top (regenerated on canvas, MotionGrain technique)
// keeps the flat SVG fills from reading as glossy digital gradients.
import gsap from 'gsap'

const grainRef = ref<HTMLCanvasElement | null>(null)
const blobRefs = ref<(SVGGElement | null)[]>([])
let grainRaf = 0

const blobs = [
  { cx: 22, cy: 30, r: 26, fill: '#0B3954', opacity: 0.55 },
  { cx: 72, cy: 22, r: 22, fill: '#FBBA00', opacity: 0.4 },
  { cx: 68, cy: 72, r: 30, fill: '#0B2A3D', opacity: 0.5 },
  { cx: 24, cy: 76, r: 18, fill: '#FBBA00', opacity: 0.3 }
]

useGsapContext(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!prefersReducedMotion) {
    blobRefs.value.forEach((el, i) => {
      if (!el) return
      const dir = i % 2 === 0 ? 1 : -1
      gsap.to(el, {
        x: `+=${dir * (30 + i * 8)}`,
        y: `+=${-dir * (24 + i * 6)}`,
        duration: 20 + i * 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      })
      gsap.to(el, {
        scale: 1 + 0.14 + i * 0.02,
        transformOrigin: '50% 50%',
        duration: 16 + i * 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.7
      })
    })
  }

  if (!grainRef.value) return () => {}
  const grainCanvas = grainRef.value
  const grainCtx = grainCanvas.getContext('2d')!
  const GRAIN_RES = 160
  grainCanvas.width = GRAIN_RES
  grainCanvas.height = GRAIN_RES
  const grainData = grainCtx.createImageData(GRAIN_RES, GRAIN_RES)

  function drawGrain() {
    const data = grainData.data
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255
      data[i] = v
      data[i + 1] = v
      data[i + 2] = v
      data[i + 3] = 16
    }
    grainCtx.putImageData(grainData, 0, 0)
  }

  let frame = 0
  function grainTick() {
    frame++
    if (frame % 2 === 0) drawGrain()
    grainRaf = requestAnimationFrame(grainTick)
  }
  if (!prefersReducedMotion) grainRaf = requestAnimationFrame(grainTick)
  else drawGrain()

  return () => {
    cancelAnimationFrame(grainRaf)
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
    <svg class="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="hero-blob-goo" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
            result="goo"
          />
        </filter>
      </defs>
      <g filter="url(#hero-blob-goo)">
        <g v-for="(b, i) in blobs" :key="i" :ref="(el) => (blobRefs[i] = el as SVGGElement | null)">
          <circle :cx="b.cx" :cy="b.cy" :r="b.r" :fill="b.fill" :opacity="b.opacity" />
        </g>
      </g>
    </svg>
    <canvas
      ref="grainRef"
      class="hero-grain absolute inset-0 h-full w-full opacity-[0.25] mix-blend-overlay"
    />
  </div>
</template>

<style scoped>
.hero-grain {
  image-rendering: pixelated;
}
</style>

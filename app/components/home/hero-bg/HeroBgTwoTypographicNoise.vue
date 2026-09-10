<script setup lang="ts">
// 2D — Oversized cropped typography as pure texture. A single brand word is
// set at a massive font size (vw-scaled well past the viewport) and offset
// so most of its bulk bleeds off-canvas — only fragments of letterforms
// remain visible, at very low opacity navy — a purely decorative background
// layer distinct from KineticType's animated foreground word-cloud. A
// continuously-regenerating grain layer (MotionGrain technique) sits on top
// so the flat type gains a tactile, printed-poster grit instead of reading
// as crisp digital text.
const grainRef = ref<HTMLCanvasElement | null>(null)
let grainRaf = 0

useGsapContext(() => {
  if (!grainRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
      data[i + 3] = 18
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
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden" style="background-color: #eaf1f4">
    <span
      class="absolute select-none whitespace-nowrap font-display font-extrabold leading-none text-navy-900 opacity-[0.06]"
      style="left: -8vw; top: -14vw; font-size: 46vw"
    >
      PASTI
    </span>
    <span
      class="absolute select-none whitespace-nowrap font-display font-extrabold leading-none text-navy-900 opacity-[0.045]"
      style="right: -18vw; bottom: -16vw; font-size: 30vw"
    >
      IMPACT
    </span>
    <canvas
      ref="grainRef"
      class="hero-grain absolute inset-0 h-full w-full opacity-[0.3] mix-blend-overlay"
    />
  </div>
</template>

<style scoped>
.hero-grain {
  image-rendering: pixelated;
}
</style>

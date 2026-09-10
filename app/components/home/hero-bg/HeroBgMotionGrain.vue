<script setup lang="ts">
// Motion — Animated film grain + magnetic light sweep. Two layers: (1) a
// continuously-regenerating noise pattern drawn on canvas at low res and
// scaled up (classic animated grain, changes every frame rather than a
// static repeating texture — reads as alive even standing still), and
// (2) a soft diagonal light band that drifts extremely slowly and bends
// toward the cursor. Deliberately quiet — designed to make the Hero feel
// "expensive" rather than "busy", the way Stripe/Linear-era sites do.
const canvasRef = ref<HTMLCanvasElement | null>(null)
const sweepRef = ref<HTMLElement | null>(null)
let raf = 0

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const ctx = canvas.getContext('2d')!

  const RES = 180
  canvas.width = RES
  canvas.height = RES
  const imageData = ctx.createImageData(RES, RES)

  function drawGrain() {
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255
      data[i] = v
      data[i + 1] = v
      data[i + 2] = v
      data[i + 3] = 14
    }
    ctx.putImageData(imageData, 0, 0)
  }

  let frameCount = 0
  function tick() {
    frameCount++
    if (frameCount % 2 === 0) drawGrain()
    raf = requestAnimationFrame(tick)
  }
  if (!prefersReducedMotion) raf = requestAnimationFrame(tick)
  else drawGrain()

  const sweep = sweepRef.value
  function onPointerMove(e: PointerEvent) {
    if (prefersReducedMotion || !sweep) return
    const rect = parent.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * 100
    const py = ((e.clientY - rect.top) / rect.height) * 100
    sweep.style.setProperty('--sweep-x', `${px}%`)
    sweep.style.setProperty('--sweep-y', `${py}%`)
  }
  parent.addEventListener('pointermove', onPointerMove)

  return () => {
    cancelAnimationFrame(raf)
    parent.removeEventListener('pointermove', onPointerMove)
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <canvas ref="canvasRef" class="hero-grain absolute inset-0 h-full w-full opacity-[0.35] mix-blend-overlay" />
    <div ref="sweepRef" class="hero-sweep absolute inset-0" />
  </div>
</template>

<style scoped>
.hero-grain {
  image-rendering: pixelated;
}

.hero-sweep {
  --sweep-x: 50%;
  --sweep-y: 30%;
  background: radial-gradient(
    circle at var(--sweep-x) var(--sweep-y),
    theme(colors.yellow.100 / 35%),
    transparent 45%
  );
  transition: background-position 0.4s ease-out;
}
</style>

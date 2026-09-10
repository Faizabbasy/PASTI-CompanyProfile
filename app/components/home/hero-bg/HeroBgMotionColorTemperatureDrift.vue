<script setup lang="ts">
// Motion — Full-bleed color temperature drift. A soft gradient backdrop
// whose stops slowly cycle between cool navy-dominant and warm
// yellow-tinted over a long ~18s cycle, like ambient daylight passing
// through a room, plus a very faint animated grain overlay (same
// regenerating-noise technique as MotionGrain, lower opacity) so the
// gradient doesn't band or read as flat. A single CSS custom property
// driven by gsap.ticker keeps this cheap — no canvas needed for the
// gradient itself.
import gsap from 'gsap'

const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

useGsapContext(() => {
  if (!rootRef.value) return
  const root = rootRef.value
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    root.style.setProperty('--temp-mix', '0.5')
  } else {
    const mix = { value: 0 }
    gsap.to(mix, {
      value: 1,
      duration: 18,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      onUpdate: () => root.style.setProperty('--temp-mix', String(mix.value))
    })
  }

  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')!
  const RES = 160
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
      data[i + 3] = 8
    }
    ctx.putImageData(imageData, 0, 0)
  }

  let frameCount = 0
  function tick() {
    frameCount++
    if (frameCount % 3 === 0) drawGrain()
    raf = requestAnimationFrame(tick)
  }
  if (!prefersReducedMotion) raf = requestAnimationFrame(tick)
  else drawGrain()

  return () => {
    cancelAnimationFrame(raf)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden drift-root">
    <div class="drift-gradient" />
    <canvas ref="canvasRef" class="drift-grain absolute inset-0 h-full w-full opacity-[0.15] mix-blend-overlay" />
  </div>
</template>

<style scoped>
.drift-root {
  --temp-mix: 0;
}

.drift-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, theme(colors.navy.800) calc(100% - (var(--temp-mix) * 55%)), theme(colors.yellow.700) calc(var(--temp-mix) * 55%)) 0%,
    color-mix(in srgb, theme(colors.navy.500) calc(100% - (var(--temp-mix) * 60%)), theme(colors.yellow.400) calc(var(--temp-mix) * 60%)) 50%,
    color-mix(in srgb, theme(colors.navy.900) calc(100% - (var(--temp-mix) * 40%)), theme(colors.yellow.600) calc(var(--temp-mix) * 40%)) 100%
  );
  opacity: 0.5;
}

.drift-grain {
  image-rendering: pixelated;
}
</style>

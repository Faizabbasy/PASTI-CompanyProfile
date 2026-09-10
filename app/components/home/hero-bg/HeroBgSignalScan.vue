<script setup lang="ts">
import gsap from 'gsap'

// Signal Scan — oscilloscope/radar-inspired sweep. A vertical scan line
// travels left→right on a loop; as it passes, it "reads" a waveform built
// from layered sine components (not a single Math.sin — three frequencies
// summed with different phases, so the shape never looks like a generic
// sine wave). The most recent sweep leaves a fading afterimage trace
// (ghosting), so 2-3 passes are visible at once at different opacities —
// it reads as a live signal rather than a looping animation.
const rootRef = ref<HTMLElement | null>(null)

const WIDTH = 1200
const HEIGHT = 800
const BASELINE = 460
const SAMPLES = 140

function waveformY(x: number, t: number): number {
  const nx = x / WIDTH
  const a = Math.sin(nx * Math.PI * 3.2 + t * 1.3) * 46
  const b = Math.sin(nx * Math.PI * 7.1 - t * 0.8 + 1.4) * 18
  const c = Math.sin(nx * Math.PI * 1.1 + t * 0.35) * 30
  return BASELINE + a + b + c
}

function buildWaveformPath(t: number, upToX: number): string {
  let d = ''
  const step = WIDTH / SAMPLES
  for (let x = 0; x <= upToX; x += step) {
    const y = waveformY(x, t)
    d += d === '' ? `M${x} ${y}` : ` L${x} ${y}`
  }
  return d
}

useGsapContext(() => {
  if (!rootRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const liveWave = rootRef.value.querySelector<SVGPathElement>('[data-wave-live]')
  const ghost1 = rootRef.value.querySelector<SVGPathElement>('[data-wave-ghost-1]')
  const ghost2 = rootRef.value.querySelector<SVGPathElement>('[data-wave-ghost-2]')
  const scanLine = rootRef.value.querySelector<SVGLineElement>('[data-scan-line]')
  const scanGlow = rootRef.value.querySelector<SVGCircleElement>('[data-scan-glow]')
  const grid = rootRef.value.querySelector<SVGGElement>('[data-scan-grid]')

  if (prefersReducedMotion) {
    if (liveWave) liveWave.setAttribute('d', buildWaveformPath(0, WIDTH))
    gsap.set([liveWave, grid].filter(Boolean), { opacity: 0.4 })
    gsap.set([ghost1, ghost2, scanLine, scanGlow].filter(Boolean), { opacity: 0 })
    return
  }

  gsap.set(grid, { opacity: 0 })
  gsap.to(grid, { opacity: 0.12, duration: 1.5 })

  const cycleDuration = 5.5
  const state = { progress: 0, t: 0 }
  let lastGhostSnapshot = 0

  const ticker = gsap.ticker.add((_time, deltaMs) => {
    const dt = deltaMs / 1000
    state.t += dt * 0.5
    state.progress += dt / cycleDuration
    if (state.progress > 1) {
      state.progress -= 1
      // Freeze a ghost snapshot at the moment a sweep completes.
      if (ghost2 && ghost1) {
        ghost2.setAttribute('d', ghost1.getAttribute('d') ?? '')
        ghost1.setAttribute('d', liveWave?.getAttribute('d') ?? '')
      }
    }

    const scanX = state.progress * WIDTH
    if (liveWave) liveWave.setAttribute('d', buildWaveformPath(state.t, scanX))
    if (scanLine) {
      scanLine.setAttribute('x1', String(scanX))
      scanLine.setAttribute('x2', String(scanX))
    }
    if (scanGlow) {
      scanGlow.setAttribute('cx', String(scanX))
      scanGlow.setAttribute('cy', String(waveformY(scanX, state.t)))
    }

    // Periodically snapshot into the near ghost even mid-sweep, so the
    // trailing afterimage isn't just "previous full pass" but a rolling
    // few-hundred-ms-old trace.
    if (state.t - lastGhostSnapshot > 0.12 && ghost1 && liveWave) {
      ghost1.setAttribute('d', liveWave.getAttribute('d') ?? '')
      lastGhostSnapshot = state.t
    }
  })

  return () => gsap.ticker.remove(ticker)
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg class="absolute inset-0 h-full w-full opacity-75" viewBox="0 0 1200 800" fill="none" preserveAspectRatio="xMidYMid slice">
      <g data-scan-grid="" stroke="#0B3954" stroke-width="0.5">
        <path v-for="i in 7" :key="`h${i}`" :d="`M0 ${i * 100} L1200 ${i * 100}`" />
      </g>

      <path data-wave-ghost-2="" stroke="#0B3954" stroke-width="1" opacity="0.12" fill="none" />
      <path data-wave-ghost-1="" stroke="#0B3954" stroke-width="1.25" opacity="0.22" fill="none" />
      <path data-wave-live="" stroke="#0B3954" stroke-width="1.5" opacity="0.75" fill="none" stroke-linecap="round" />

      <line data-scan-line="" y1="0" y2="800" x1="0" x2="0" stroke="#FBBA00" stroke-width="1.5" opacity="0.5" />
      <circle data-scan-glow="" r="5" fill="#FBBA00" opacity="0.9" />
    </svg>
  </div>
</template>

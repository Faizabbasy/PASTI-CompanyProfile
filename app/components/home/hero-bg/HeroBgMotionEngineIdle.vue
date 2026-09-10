<script setup lang="ts">
import gsap from 'gsap'

// Motion — Engine idle. Inspired by Active Theory's game-engine approach
// to web builds (Developer Site of the Year), where a site feels rendered
// like a real-time environment rather than a static page. Kept calm for
// a hero background: a minimal HUD-like idle state — two thin line
// segments trace a partial path via animated stroke-dashoffset, pause,
// then retrace, plus tiny periodic "tick" marks — like an instrument
// panel breathing while idle rather than anything literal or busy.
const svgRef = ref<SVGSVGElement | null>(null)

useGsapContext(() => {
  if (!svgRef.value) return
  const svg = svgRef.value
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const lines = Array.from(svg.querySelectorAll<SVGPathElement>('[data-line]'))
  const ticks = Array.from(svg.querySelectorAll<SVGCircleElement>('[data-tick]'))

  lines.forEach((line) => {
    const length = line.getTotalLength()
    line.style.strokeDasharray = `${length}`
    line.style.strokeDashoffset = `${length}`
  })

  if (prefersReducedMotion) {
    lines.forEach((line) => { line.style.strokeDashoffset = '0' })
    gsap.set(ticks, { opacity: 0.5 })
    return
  }

  lines.forEach((line, i) => {
    const length = line.getTotalLength()
    const tl = gsap.timeline({ repeat: -1, delay: i * 1.4 })
    tl.to(line, { strokeDashoffset: 0, duration: 2.2, ease: 'power1.inOut' })
      .to(line, { duration: 1.6 }) // hold — readout pause
      .to(line, { strokeDashoffset: -length, duration: 1.8, ease: 'power1.inOut' })
      .set(line, { strokeDashoffset: length })
      .to(line, { duration: 0.6 })
  })

  ticks.forEach((tick, i) => {
    gsap.to(tick, {
      opacity: 0.85,
      duration: 0.18,
      ease: 'none',
      repeat: -1,
      repeatDelay: 2.6 + (i % 3) * 0.6,
      yoyo: true,
      delay: i * 0.4
    })
  })
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg
      ref="svgRef"
      class="hud-svg absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path data-line="" class="hud-line" d="M 8 20 L 38 20 L 46 30 L 78 30" />
      <path data-line="" class="hud-line hud-line-alt" d="M 92 74 L 64 74 L 56 66 L 20 66" />
      <circle data-tick="" class="hud-tick" cx="8" cy="20" r="0.9" />
      <circle data-tick="" class="hud-tick" cx="78" cy="30" r="0.9" />
      <circle data-tick="" class="hud-tick" cx="92" cy="74" r="0.9" />
      <circle data-tick="" class="hud-tick" cx="20" cy="66" r="0.9" />
    </svg>
  </div>
</template>

<style scoped>
.hud-svg {
  opacity: 0.4;
}

.hud-line {
  fill: none;
  stroke: theme(colors.yellow.400);
  stroke-width: 0.3;
  vector-effect: non-scaling-stroke;
}

.hud-line-alt {
  stroke: theme(colors.navy.300);
}

.hud-tick {
  fill: theme(colors.yellow.300);
  opacity: 0;
}
</style>

<script setup lang="ts">
// One animated glyph per brand pillar (drawn in white + PASTI Yellow on the
// navy panel). Animations run only while the pillar is active and are CSS-only;
// reduced motion shows the resolved still.
const props = defineProps<{ index: number; active: boolean }>()
// Rounded: server (Node) and browser trig differ in the last digits, which
// would otherwise be a hydration mismatch.
const r2 = (n: number) => Math.round(n * 100) / 100
const dots = Array.from({ length: 9 }, (_, i) => {
  const a = (i / 9) * Math.PI * 2
  return { x: r2(50 + Math.cos(a) * 34), y: r2(50 + Math.sin(a) * 34), d: r2(i * 0.06) }
})
</script>

<template>
  <svg viewBox="0 0 100 100" aria-hidden="true" class="pg" :class="{ 'pg-on': props.active }">
    <!-- 01 Certainty: scattered points converge into one -->
    <g v-if="props.index === 0">
      <circle v-for="(d, i) in dots" :key="i" class="pg-converge" :style="{ '--x': `${r2(50 - d.x)}px`, '--y': `${r2(50 - d.y)}px`, animationDelay: `${d.d}s` }" :cx="d.x" :cy="d.y" r="3" fill="rgba(255,255,255,0.8)" />
      <circle cx="50" cy="50" r="6" fill="#FBBA00" />
      <circle class="pg-ring" cx="50" cy="50" r="10" fill="none" stroke="#FBBA00" stroke-width="1.5" />
    </g>
    <!-- 02 Precision: crosshair locking onto the grid -->
    <g v-else-if="props.index === 1" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" fill="none">
      <path d="M10 30H90M10 50H90M10 70H90M30 10V90M50 10V90M70 10V90" stroke="rgba(255,255,255,0.18)" stroke-width="1" />
      <g class="pg-lock">
        <rect x="38" y="38" width="24" height="24" />
        <path d="M50 26v8M50 66v8M26 50h8M66 50h8" />
      </g>
      <circle cx="50" cy="50" r="3" fill="#FBBA00" stroke="none" />
    </g>
    <!-- 03 Momentum: chevrons travelling forward -->
    <g v-else-if="props.index === 2" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path class="pg-chev" style="animation-delay: 0s" d="M22 30l20 20-20 20" stroke="rgba(255,255,255,0.35)" />
      <path class="pg-chev" style="animation-delay: 0.15s" d="M40 30l20 20-20 20" stroke="rgba(255,255,255,0.65)" />
      <path class="pg-chev" style="animation-delay: 0.3s" d="M58 30l20 20-20 20" stroke="#FBBA00" />
    </g>
    <!-- 04 Practicality: a check drawn inside a clear frame -->
    <g v-else-if="props.index === 3" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="18" y="18" width="64" height="64" rx="12" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" />
      <path class="pg-check" d="M32 51l12 12 24-26" stroke="#FBBA00" stroke-width="6" pathLength="1" />
    </g>
    <!-- 05 Impact: a point sending out rings -->
    <g v-else fill="none">
      <circle class="pg-wave" style="animation-delay: 0s" cx="50" cy="50" r="12" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />
      <circle class="pg-wave" style="animation-delay: 0.6s" cx="50" cy="50" r="12" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />
      <circle class="pg-wave" style="animation-delay: 1.2s" cx="50" cy="50" r="12" stroke="#FBBA00" stroke-width="1.5" />
      <circle cx="50" cy="50" r="7" fill="#FBBA00" />
    </g>
  </svg>
</template>

<style scoped>
.pg * {
  transform-box: fill-box;
  transform-origin: center;
}
.pg-check {
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
}
@media (prefers-reduced-motion: no-preference) {
  .pg-on .pg-converge {
    animation: pg-converge 2.6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }
  .pg-on .pg-ring {
    animation: pg-ring 2.6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }
  .pg-on .pg-lock {
    animation: pg-lock 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }
  .pg-on .pg-chev {
    animation: pg-chev 1.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }
  .pg-on .pg-check {
    animation: pg-check 2.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }
  .pg-on .pg-wave {
    animation: pg-wave 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }
}
@keyframes pg-converge {
  0%,
  15% {
    transform: translate(0, 0);
    opacity: 1;
  }
  60%,
  100% {
    transform: translate(var(--x), var(--y));
    opacity: 0;
  }
}
@keyframes pg-ring {
  0%,
  55% {
    transform: scale(0.6);
    opacity: 0;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}
@keyframes pg-lock {
  0% {
    transform: translate(-14px, 10px) rotate(-20deg) scale(1.3);
    opacity: 0.3;
  }
  45%,
  100% {
    transform: translate(0, 0) rotate(0) scale(1);
    opacity: 1;
  }
}
@keyframes pg-chev {
  0% {
    transform: translateX(-10px);
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
  100% {
    transform: translateX(10px);
    opacity: 0;
  }
}
@keyframes pg-check {
  0% {
    stroke-dashoffset: 1;
  }
  45%,
  100% {
    stroke-dashoffset: 0;
  }
}
@keyframes pg-wave {
  0% {
    transform: scale(1);
    opacity: 0.9;
  }
  100% {
    transform: scale(3.4);
    opacity: 0;
  }
}
</style>

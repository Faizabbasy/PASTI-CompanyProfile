<script setup lang="ts">
// Explore — Lite take on Lusion / Immersive Garden's "camera moving through
// true Z-depth". Simplified to just 2 soft blurred circles standing in for
// a near and a far layer, drifting horizontally at different speeds — no
// canvas, no scale-based dolly illusion, pure CSS transform loop.
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="depth-circle depth-far" />
    <div class="depth-circle depth-near" />
  </div>
</template>

<style scoped>
.depth-circle {
  position: absolute;
  border-radius: 9999px;
  will-change: transform;
}

.depth-far {
  left: -10%;
  top: 20%;
  width: 22vw;
  height: 22vw;
  max-width: 320px;
  max-height: 320px;
  filter: blur(30px);
  opacity: 0.3;
  background: radial-gradient(circle at 40% 40%, theme(colors.navy.300), theme(colors.navy.600) 75%);
  animation: drift-far 34s linear infinite;
}

.depth-near {
  right: -8%;
  bottom: 12%;
  width: 34vw;
  height: 34vw;
  max-width: 460px;
  max-height: 460px;
  filter: blur(55px);
  opacity: 0.45;
  background: radial-gradient(circle at 45% 40%, theme(colors.yellow.300), theme(colors.yellow.500) 75%);
  animation: drift-near 20s linear infinite;
}

@keyframes drift-far {
  0% { transform: translateX(0); }
  50% { transform: translateX(8vw); }
  100% { transform: translateX(0); }
}

@keyframes drift-near {
  0% { transform: translateX(0); }
  50% { transform: translateX(-10vw); }
  100% { transform: translateX(0); }
}

@media (prefers-reduced-motion: reduce) {
  .depth-circle {
    animation: none;
  }
}
</style>

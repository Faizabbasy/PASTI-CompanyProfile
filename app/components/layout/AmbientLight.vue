<script setup lang="ts">
// Page-global cursor-reactive light-leak layer. See useAmbientLight for the
// pointer-damping/velocity-stretch pipeline. Purely decorative — sits above
// the page background but below all content, never intercepts pointer
// events, and is a no-op on touch devices / prefers-reduced-motion.
const canvasRef = ref<HTMLCanvasElement | null>(null)
useAmbientLight(canvasRef)
</script>

<template>
  <canvas
    ref="canvasRef"
    aria-hidden="true"
    class="ambient-light pointer-events-none fixed inset-0 z-[5] hidden motion-safe:block"
  />
</template>

<script setup lang="ts">
// Gradient mesh: 3 large, heavily-blurred color blobs drifting slowly behind
// the Hero text. Pure CSS transform animation (GPU-cheap, no JS per-frame
// work) — respects prefers-reduced-motion by freezing the blobs in place.
</script>

<template>
  <div aria-hidden="true" class="hero-bg-mesh pointer-events-none absolute inset-0 overflow-hidden">
    <div class="blob blob-navy" />
    <div class="blob blob-yellow" />
    <div class="blob blob-navy-soft" />
  </div>
</template>

<style scoped>
.hero-bg-mesh {
  filter: blur(70px);
}

.blob {
  position: absolute;
  border-radius: 9999px;
  opacity: 0.55;
  will-change: transform;
}

.blob-navy {
  left: 8%;
  top: 10%;
  width: 42vw;
  height: 42vw;
  max-width: 620px;
  max-height: 620px;
  background: radial-gradient(circle at 35% 35%, theme(colors.navy.400), theme(colors.navy.700) 70%);
  animation: drift-a 22s ease-in-out infinite;
}

.blob-yellow {
  right: 6%;
  top: 22%;
  width: 30vw;
  height: 30vw;
  max-width: 460px;
  max-height: 460px;
  background: radial-gradient(circle at 40% 40%, theme(colors.yellow.300), theme(colors.yellow.500) 75%);
  opacity: 0.4;
  animation: drift-b 26s ease-in-out infinite;
}

.blob-navy-soft {
  left: 30%;
  bottom: -10%;
  width: 36vw;
  height: 36vw;
  max-width: 520px;
  max-height: 520px;
  background: radial-gradient(circle at 50% 50%, theme(colors.navy.200), theme(colors.navy.400) 70%);
  opacity: 0.3;
  animation: drift-c 30s ease-in-out infinite;
}

@keyframes drift-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(4%, 6%) scale(1.08); }
}

@keyframes drift-b {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-6%, 4%) scale(1.1); }
}

@keyframes drift-c {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(3%, -5%) scale(1.05); }
}

@media (prefers-reduced-motion: reduce) {
  .blob {
    animation: none;
  }
}
</style>

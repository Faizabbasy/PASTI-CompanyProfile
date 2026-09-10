<script setup lang="ts">
// Full-bleed responsive WebGL background for the Hero — see
// docs/superpowers/specs/2026-09-11-hero-living-surface-design.md.
// Replaces the old Nucleus/Origin centerpiece-object background: this is a
// single continuous surface, not an object behind the text.
const canvasRef = ref<HTMLCanvasElement | null>(null)
const sectionRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  sectionRef.value = canvasRef.value?.closest('section') ?? null
  return useHeroLivingSurface(canvasRef, { sectionEl: sectionRef })
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>

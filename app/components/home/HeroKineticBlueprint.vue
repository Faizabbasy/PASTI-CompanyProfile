<script setup lang="ts">
const svgRef = ref<SVGSVGElement | null>(null)
const sectionRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  sectionRef.value = svgRef.value?.closest('section') ?? null
  contentRef.value = sectionRef.value?.querySelector('[data-hero-content]') ?? null
  return useHeroKineticBlueprint(svgRef, { sectionEl: sectionRef, contentEl: contentRef })
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg ref="svgRef" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" class="h-full w-full">
      <defs>
        <!-- Gradient <stop> elements and the void clipPath's <rect> are
             populated/updated imperatively by useHeroKineticBlueprint —
             see kineticBlueprintPaths.ts's GradientDef data and the
             composable's buildGradients()/updateVoidClip() functions. -->
        <linearGradient id="grad-plate-a" data-gradient-kind="linear" />
        <linearGradient id="grad-plate-b" data-gradient-kind="linear" />
        <radialGradient id="grad-plate-c" data-gradient-kind="radial" />
        <clipPath id="signal-void-clip" clipPathUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1600" height="900" />
          <rect data-void-hole x="0" y="0" width="0" height="0" rx="10" ry="10" />
        </clipPath>
      </defs>
      <g data-blueprint-group="band" clip-path="url(#signal-void-clip)" />
      <g data-blueprint-group="facets" clip-path="url(#signal-void-clip)" />
      <g data-blueprint-group="rail" />
      <g data-blueprint-group="nodes" />
    </svg>
  </div>
</template>

<script setup lang="ts">
const svgRef = ref<SVGSVGElement | null>(null)
const sectionRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  sectionRef.value = svgRef.value?.closest('section') ?? null
  return useHeroKineticBlueprint(svgRef, { sectionEl: sectionRef })
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg ref="svgRef" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" class="h-full w-full">
      <!-- Element groups are appended imperatively by useHeroKineticBlueprint. -->
    </svg>
  </div>
</template>

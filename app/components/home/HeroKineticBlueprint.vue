<script setup lang="ts">
const props = defineProps<{
  headingWords?: HTMLElement[]
  subtextEl?: HTMLElement | null
  ctaRowEl?: HTMLElement | null
}>()

const svgRef = ref<SVGSVGElement | null>(null)
const sectionRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
  sectionRef.value = svgRef.value?.closest('section') ?? null
  contentRef.value = sectionRef.value?.querySelector('[data-hero-content]') ?? null
  return useHeroKineticBlueprint(svgRef, {
    sectionEl: sectionRef,
    contentEl: contentRef,
    headingWords: computed(() => props.headingWords ?? []),
    subtextEl: computed(() => props.subtextEl ?? null),
    ctaRowEl: computed(() => props.ctaRowEl ?? null)
  })
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <svg ref="svgRef" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" class="h-full w-full">
      <defs>
        <!-- Gradient <stop> elements and the void clipPath's <path> are
             populated/updated imperatively by useHeroKineticBlueprint —
             see kineticBlueprintPaths.ts's GradientDef data and the
             composable's buildGradients()/updateVoidClip() functions. -->
        <linearGradient id="grad-plate-a" data-gradient-kind="linear" />
        <linearGradient id="grad-plate-b" data-gradient-kind="linear" />
        <radialGradient id="grad-plate-c" data-gradient-kind="radial" />
        <clipPath id="signal-void-clip" clipPathUnits="userSpaceOnUse">
          <path data-void-clip clip-rule="evenodd" d="M0 0H1600V900H0Z" />
        </clipPath>
        <!-- Subtle fractal-noise grain overlaid on each facet (via CSS,
             see .signal-architecture__facet's mix-blend-mode use) so the
             gradient surfaces read as a textured material rather than a
             flat vector wash. -->
        <filter id="signal-grain" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
        </filter>
      </defs>
      <g data-blueprint-group="facets" clip-path="url(#signal-void-clip)" />
    </svg>
  </div>
</template>

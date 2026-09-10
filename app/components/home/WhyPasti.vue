<script setup lang="ts">
// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 07 — WHY PASTI.
const label = 'Why PASTI'

const introSegments: { text: string; accent?: boolean }[] = [
  { text: 'We combine' },
  { text: 'technology and creativity', accent: true },
  { text: 'to help businesses turn challenges into' },
  { text: 'scalable solutions,', accent: true },
  { text: 'meaningful experiences', accent: true },
  { text: 'and' },
  { text: 'measurable impact.', accent: true }
]

const { metrics } = useWhyPasti()
</script>

<template>
  <BaseSection as="section">
    <BaseContainer>
      <HomeEditorialIntro :label="label" :segments="introSegments" />

      <div class="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-3">
        <HomeWhyPastiMetric
          v-for="(metric, i) in metrics"
          :key="metric.index"
          :metric="metric"
          :tone="i % 2 === 0 ? 'navy' : 'yellow'"
        />
      </div>
    </BaseContainer>
  </BaseSection>
</template>

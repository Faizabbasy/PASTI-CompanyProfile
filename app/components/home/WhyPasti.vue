<script setup lang="ts">
// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 07 — WHY PASTI.
const label = 'Why PASTI'
const intro = 'We combine technology and creativity to help businesses turn challenges into scalable solutions, meaningful experiences and measurable impact.'

const { metrics } = useWhyPasti()

const labelRef = ref<HTMLElement | null>(null)
const introRef = ref<HTMLElement | null>(null)

useMaskedReveal(labelRef, { by: 'word' })
useMaskedReveal(introRef, { by: 'line' })
</script>

<template>
  <BaseSection as="section">
    <BaseContainer>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
        <p ref="labelRef" class="eyebrow text-base font-bold tracking-wider md:col-span-3 md:text-lg">
          {{ label }}
        </p>

        <p ref="introRef" class="text-display-sm font-medium leading-snug text-ink md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-6">
          {{ intro }}
        </p>
      </div>

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

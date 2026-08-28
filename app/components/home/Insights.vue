<script setup lang="ts">
// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 08 — INSIGHTS.
const heading = 'Insights'
const cta = 'Visit insights'

const { articles } = useInsights()

const headingRef = ref<HTMLElement | null>(null)
useScrollReveal(headingRef, { y: 24 })
</script>

<template>
  <BaseSection as="section" class="rounded-t-[2.5rem] bg-navy-950">
    <BaseContainer>
      <div ref="headingRef" class="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <h2 class="text-display-lg text-paper">
          {{ heading }}
        </h2>

        <span class="inline-flex items-center justify-center gap-2 rounded-full border border-navy-700 px-7 py-3.5 font-display text-sm font-semibold text-paper">
          {{ cta }}
        </span>
      </div>

      <div class="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-3 md:mt-20">
        <HomeInsightsCard v-for="article in articles" :key="article.index" :article="article" />
      </div>
    </BaseContainer>
  </BaseSection>
</template>

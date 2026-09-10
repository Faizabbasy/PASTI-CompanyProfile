<script setup lang="ts">
// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 08 — INSIGHTS.
const heading = 'Insights'
const cta = 'View all'

const { articles } = useInsights()
const featuredArticles = articles.slice(0, 3)

const headingRef = ref<HTMLElement | null>(null)
useMaskedReveal(headingRef, { by: 'word' })
</script>

<template>
  <BaseSection as="section" class="bg-navy-950">
    <BaseContainer>
      <h2 ref="headingRef" class="text-display-lg text-paper">
        {{ heading }}
      </h2>

      <div class="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-3 md:mt-20">
        <HomeInsightsCard v-for="article in featuredArticles" :key="article.index" :article="article" />
      </div>

      <div class="mt-16 flex justify-center md:mt-20">
        <NuxtLink
          to="/insights"
          class="inline-flex items-center justify-center gap-2 rounded-full border border-navy-700 px-7 py-3.5 font-display text-sm font-semibold text-paper transition-colors duration-400 ease-editorial hover:border-yellow-500 hover:text-yellow-400"
        >
          {{ cta }}
        </NuxtLink>
      </div>
    </BaseContainer>
  </BaseSection>
</template>

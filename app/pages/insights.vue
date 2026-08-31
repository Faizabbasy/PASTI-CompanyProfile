<script setup lang="ts">
const heading = 'Insights'

const { articles } = useInsights()

const headingRef = ref<HTMLElement | null>(null)
useScrollReveal(headingRef, { y: 24 })
</script>

<template>
  <BaseSection as="section" class="bg-navy-950 pt-32 md:pt-40">
    <BaseContainer>
      <h1 ref="headingRef" class="text-display-lg text-paper">
        {{ heading }}
      </h1>

      <div class="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-3 md:mt-20">
        <HomeInsightsCard v-for="article in articles" :key="article.index" :article="article" />
      </div>
    </BaseContainer>
  </BaseSection>
</template>

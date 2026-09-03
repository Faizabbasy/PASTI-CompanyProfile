<script setup lang="ts">
const eyebrow = 'Insights'
const heading = 'Ideas worth reading'
const intro = 'Perspectives on technology, creative, and business — from the work we do with our clients every day.'

const { articles } = useInsights()
const featured = articles[0]
const rest = articles.slice(1)

const heroStats = [{ value: `${articles.length}`, label: 'Articles published' }]

const heroRef = ref<HTMLElement | null>(null)
const introRef = ref<HTMLElement | null>(null)

useMaskedReveal(heroRef, { by: 'word', trigger: false })
useScrollReveal(introRef, { y: 16 })
</script>

<template>
  <BaseSection as="section" class="relative bg-paper pb-16 pt-32 md:pb-24 md:pt-40">
    <BaseHeroBackdrop />
    <BaseContainer>
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1 ref="heroRef" class="mt-4 max-w-3xl text-display-lg text-ink">
        {{ heading }}
      </h1>
      <p ref="introRef" class="mt-6 max-w-xl text-body-lg text-muted">
        {{ intro }}
      </p>

      <div class="mt-12 flex flex-wrap gap-x-12 gap-y-6 border-t border-navy-100 pt-8">
        <div v-for="stat in heroStats" :key="stat.label">
          <p class="font-display text-display-sm font-semibold text-ink">{{ stat.value }}</p>
          <p class="mt-1 text-body-sm text-muted">{{ stat.label }}</p>
        </div>
      </div>
    </BaseContainer>
  </BaseSection>

  <BaseSection v-if="featured" as="section" tight class="bg-paper">
    <BaseContainer>
      <div class="border-t border-navy-100 pt-10">
        <InsightsArticleCard :article="featured" featured />
      </div>
    </BaseContainer>
  </BaseSection>

  <BaseSection as="section" tight class="bg-paper">
    <BaseContainer>
      <div class="grid grid-cols-1 gap-x-8 gap-y-16 border-t border-navy-100 pt-10 sm:grid-cols-2 lg:grid-cols-3">
        <InsightsArticleCard v-for="article in rest" :key="article.index" :article="article" />
      </div>
    </BaseContainer>
  </BaseSection>

  <HomeFinalCta class="rounded-t-[2.5rem]" />
</template>

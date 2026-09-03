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
const heroFeaturedRef = ref<HTMLElement | null>(null)

useMaskedReveal(heroRef, { by: 'word', trigger: false })
useScrollReveal(introRef, { y: 16 })
useScrollReveal(heroFeaturedRef, { y: 24 })
</script>

<template>
  <BaseSection as="section" class="relative overflow-hidden bg-paper pb-16 pt-32 md:pb-24 md:pt-40">
    <BaseHeroBackdrop />
    <BaseContainer>
      <div class="grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-8">
        <div class="lg:col-span-7">
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
        </div>

        <div v-if="featured" ref="heroFeaturedRef" class="group hidden lg:col-span-5 lg:mr-6 lg:block">
          <div class="overflow-hidden rounded-2xl shadow-[0_30px_60px_-20px_rgba(11,22,32,0.35)]">
            <img
              :src="featured.image"
              :alt="featured.title"
              loading="eager"
              class="aspect-[4/3] w-full object-cover transition-transform duration-600 ease-editorial group-hover:scale-105"
            >
          </div>
          <p class="mt-4 font-mono text-body-sm text-navy-400">Latest</p>
          <p class="mt-2 font-display text-body-lg font-semibold text-ink">{{ featured.title }}</p>
        </div>
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

<script setup lang="ts">
import type { InsightArticle } from '~/composables/useInsights'

defineProps<{ article: InsightArticle; featured?: boolean }>()

const cardRef = ref<HTMLElement | null>(null)
useScrollReveal(cardRef, { y: 24 })

const { setState } = useCustomCursor()
</script>

<template>
  <div
    ref="cardRef"
    class="group"
    :class="featured ? 'grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10' : ''"
    @mouseenter="setState('view')"
    @mouseleave="setState('default')"
  >
    <div
      class="overflow-hidden rounded-2xl"
      :class="featured ? 'aspect-[16/10] md:col-span-7' : 'aspect-[4/3] w-full'"
    >
      <img
        :src="article.image"
        :alt="article.title"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-600 ease-editorial group-hover:scale-105"
      >
    </div>

    <div :class="featured ? 'md:col-span-5' : 'mt-6'">
      <span class="font-mono text-body-sm text-navy-400">{{ article.index }}</span>
      <p
        class="mt-2 inline-flex items-start gap-2 font-display font-medium text-ink"
        :class="featured ? 'text-display-sm' : 'text-body-lg'"
      >
        <span class="transition-all duration-400 ease-editorial group-hover:translate-x-1 group-hover:text-yellow-600">
          {{ article.title }}
        </span>
        <span
          aria-hidden="true"
          class="mt-1 shrink-0 transition-transform duration-400 ease-editorial group-hover:translate-x-2"
        >→</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { InsightArticle } from '~/composables/useInsights'

defineProps<{ article: InsightArticle }>()

const cardRef = ref<HTMLElement | null>(null)
useScrollReveal(cardRef, { y: 24 })

const { setState } = useCustomCursor()
</script>

<template>
  <div ref="cardRef" class="group" @mouseenter="setState('view')" @mouseleave="setState('default')">
    <div class="aspect-[4/3] w-full overflow-hidden rounded-2xl">
      <img
        :src="article.image"
        :alt="article.title"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-600 ease-editorial group-hover:scale-105"
      >
    </div>

    <p class="mt-6 inline-flex items-center gap-2 text-body-lg font-display font-medium text-paper">
      <span class="inline-block transition-all duration-400 ease-editorial group-hover:translate-x-1 group-hover:text-yellow-400">
        {{ article.title }}
      </span>
      <span
        aria-hidden="true"
        class="transition-transform duration-400 ease-editorial group-hover:translate-x-2"
      >→</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { InsightArticle } from '~/composables/useInsights'

defineProps<{ article: InsightArticle }>()

const cardRef = ref<HTMLElement | null>(null)
useRevealOnScroll(cardRef, { threshold: 0.15 })
</script>

<template>
  <div ref="cardRef" class="reveal-up group">
    <div class="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950" aria-hidden="true">
      <div class="h-full w-full transition-transform duration-600 ease-editorial group-hover:scale-105" />
    </div>

    <p class="mt-6 inline-flex items-center gap-2 text-body-lg font-display font-medium text-paper">
      <span class="transition-colors duration-400 ease-editorial group-hover:text-yellow-400">
        {{ article.title }}
      </span>
      <span
        aria-hidden="true"
        class="transition-transform duration-400 ease-editorial group-hover:translate-x-1"
      >→</span>
    </p>
  </div>
</template>

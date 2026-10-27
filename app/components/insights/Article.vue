<script setup lang="ts">
import type { InsightArticlePageView } from '~/composables/useInsightArticle'

// One article's page: hero spread → long-form body → what to read next.
// Shared by /insights/:slug and the admin draft preview.
defineProps<{ page: InsightArticlePageView }>()
</script>

<template>
  <InsightsArticleHero :page="page" />
  <InsightsArticleBody :page="page" />
  <InsightsArticleNext v-if="page.next || page.more.length" :page="page" />
</template>

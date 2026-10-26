<script setup lang="ts">
import type { InsightsPageContent } from '#shared/utils/insightsPublic'

// Gives the real Insights sections inside this subtree the draft content (via
// provide), without touching the public page state.
const props = defineProps<{ content: InsightsPageContent }>()
provideInsightsPreview(props.content)
</script>

<template>
  <slot />
</template>

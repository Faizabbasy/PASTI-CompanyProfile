<script setup lang="ts">
import type { TechnologyPageContent } from '#shared/utils/technologyPublic'

// Gives the real Technology sections inside this subtree the draft content
// (via provide), without touching the public page state.
const props = defineProps<{ content: TechnologyPageContent }>()
provideTechnologyPreview(props.content)
</script>

<template>
  <slot />
</template>

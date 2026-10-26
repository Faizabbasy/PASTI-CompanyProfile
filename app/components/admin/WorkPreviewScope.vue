<script setup lang="ts">
import type { WorkPageContent } from '#shared/utils/workPublic'

// Gives the real Work sections inside this subtree the draft content (via
// provide), without touching the public page state.
const props = defineProps<{ content: WorkPageContent }>()
provideWorkPreview(props.content)
</script>

<template>
  <slot />
</template>

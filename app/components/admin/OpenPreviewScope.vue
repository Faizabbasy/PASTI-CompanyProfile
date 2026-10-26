<script setup lang="ts">
import type { OpenPageContent } from '~/composables/useOpenPage'

// Gives the real OPEN components inside this subtree the draft content (via
// provide), without touching the public page state.
const props = defineProps<{ content: OpenPageContent }>()
provideOpenPreview(props.content)
</script>

<template>
  <slot />
</template>

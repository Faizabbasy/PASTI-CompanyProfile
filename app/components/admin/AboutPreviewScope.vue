<script setup lang="ts">
import type { AboutPageContent } from '#shared/utils/aboutPublic'

// Gives the real About sections inside this subtree the draft content (via
// provide), without touching the public page state.
const props = defineProps<{ content: AboutPageContent }>()
provideAboutPreview(props.content)
</script>

<template>
  <slot />
</template>

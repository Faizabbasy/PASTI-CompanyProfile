<script setup lang="ts">
import type { CreativePageContent } from '#shared/utils/creativePublic'

// Gives the real Creative sections inside this subtree the draft content
// (via provide), without touching the public page state.
const props = defineProps<{ content: CreativePageContent }>()
provideCreativePreview(props.content)
</script>

<template>
  <slot />
</template>

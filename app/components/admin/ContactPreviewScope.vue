<script setup lang="ts">
import type { ContactPageContent } from '#shared/utils/contactPublic'

// Gives the real Contact components inside this subtree the draft wording
// (via provide), without touching the public page state.
const props = defineProps<{ content: ContactPageContent }>()
provideContactPreview(props.content)
</script>

<template>
  <slot />
</template>

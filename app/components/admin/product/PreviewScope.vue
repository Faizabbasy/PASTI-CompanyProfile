<script setup lang="ts">
// Gives the real product-page components inside this subtree the draft
// content (via the page source's provide), without touching public state.
const props = defineProps<{ content: unknown; provider: (content: never) => void }>()
props.provider(props.content as never)
</script>

<template>
  <slot />
</template>

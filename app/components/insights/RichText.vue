<script setup lang="ts">
// Body text with its inline **bold** / *italic* (inlineParts) — rendered as
// elements, never as HTML.
const props = defineProps<{ text: string }>()
const parts = computed(() => inlineParts(props.text))
</script>

<template>
  <template v-for="(p, i) in parts" :key="i"><strong v-if="p.strong" class="font-semibold text-slateNavy">{{ p.text }}</strong><em v-else-if="p.em">{{ p.text }}</em><template v-else>{{ p.text }}</template></template>
</template>

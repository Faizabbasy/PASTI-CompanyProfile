<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: string
    tight?: boolean
  }>(),
  { as: 'section', tight: false }
)
</script>

<template>
  <component :is="as" :class="tight ? 'py-16 md:py-20' : 'section'">
    <slot />
  </component>
</template>

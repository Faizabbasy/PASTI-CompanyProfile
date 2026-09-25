<script setup lang="ts">
// 12-column macro grid primitive (03-design-system.md §1 / 06-design-
// tokens.json layout.container+gutter). `content` narrows the container to
// the token's 1280px reading-measure cap instead of the 1440px full-bleed
// cap — for sections whose composition wants the tighter measure. Column
// spans/key-line usage per section remain a Homepage Spec decision, not
// this primitive's concern (this only establishes the shared width/gutter
// frame every section's grid lines are measured against).
withDefaults(
  defineProps<{
    content?: boolean
  }>(),
  { content: false }
)
</script>

<template>
  <div :class="content ? 'container-page-content' : 'container-page'">
    <slot />
  </div>
</template>

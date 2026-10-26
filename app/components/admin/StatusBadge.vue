<script setup lang="ts">
import type { PageStatus } from '#shared/utils/aboutSchema'

// Text + shape, never colour alone.
defineProps<{ status: PageStatus }>()
const META: Record<PageStatus, { label: string; cls: string; mark: string }> = {
  draft: { label: 'Draft', cls: 'border-navy-300 bg-white text-navy-700', mark: '○' },
  published: { label: 'Published', cls: 'border-emerald-300 bg-emerald-50 text-emerald-800', mark: '●' },
  archived: { label: 'Archived', cls: 'border-gray-300 bg-gray-100 text-gray-700', mark: '▪' }
}
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold" :class="META[status].cls">
    <span aria-hidden="true">{{ META[status].mark }}</span>
    <span class="sr-only">Status: </span>{{ META[status].label }}
  </span>
</template>

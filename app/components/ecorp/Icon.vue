<script setup lang="ts">
// Line icons for e-CORPORATE capability areas — 1.5px strokes on a 24 grid,
// square caps, to sit with the page's hairline system. Decorative only.
defineProps<{ name: string }>()
const paths: Record<string, string> = {
  workflow: 'M4 6h5v4H4zM15 14h5v4h-5zM9 8h3v8h3',
  approval: 'M5 4h10l4 4v12H5zM9 13l2 2 4-4',
  document: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6',
  dashboard: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z',
  roles: 'M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20v-2a5 5 0 0 1 10 0v2M16 11a2.5 2.5 0 1 0 0-5M17 15a4 4 0 0 1 4 4v1',
  monitoring: 'M3 12h4l2-5 4 10 2-5h6',
  tasks: 'M6 9a6 6 0 0 1 12 0v5l2 3H4l2-3zM10 20h4',
  integration: 'M9 3v5M15 3v5M6 8h12v4a6 6 0 0 1-12 0zM12 18v3'
}
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
    <path :d="paths[name] ?? paths.workflow" />
  </svg>
</template>

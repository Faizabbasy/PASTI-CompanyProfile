<script setup lang="ts">
import type { NavIconName } from '~/composables/useNavigation'

// Line icons for the nav dropdown tiles (owner reference 2026-10-19):
// 24px grid, 1.6 stroke, currentColor. One glyph per child page.
defineProps<{ name: NavIconName }>()
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <!-- Technology: code brackets -->
    <template v-if="name === 'technology'">
      <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.2 6.5l-2.4 11" />
    </template>
    <!-- Creative: pen nib -->
    <template v-else-if="name === 'creative'">
      <path d="M12 3.5 6.5 9l2 9h7l2-9z" /><path d="M12 3.5v7.5" /><circle cx="12" cy="12.5" r="1.4" /><path d="M8.5 20.5h7" />
    </template>
    <!-- OPEN: procurement network (one source, two branches) -->
    <template v-else-if="name === 'open'">
      <circle cx="12" cy="6" r="2" /><circle cx="6.5" cy="17.5" r="2" /><circle cx="17.5" cy="17.5" r="2" /><path d="M12 8v3.5M6.5 15.5v-2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2" />
    </template>
    <!-- SHIFTLY: people -->
    <template v-else-if="name === 'shiftly'">
      <circle cx="9" cy="8.5" r="3" /><circle cx="16.5" cy="9" r="2.5" /><path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8M15 14.4c2.6-.3 4.8 1.3 5.5 4.6" />
    </template>
    <!-- e-CORPORATE: enterprise building -->
    <template v-else-if="name === 'ecorp'">
      <path d="M4 20h16M6 20V5.5h7.5V20M13.5 10H18v10" /><path d="M9 9h1.5M9 12.5h1.5M9 16h1.5" />
    </template>
    <!-- FAST: calendar + clock -->
    <template v-else-if="name === 'fast'">
      <path d="M11 19.5H6a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 6 5.5h11A1.5 1.5 0 0 1 18.5 7v3.5M8 3.5v4M15 3.5v4M4.5 10h14" /><circle cx="16.5" cy="16.5" r="3.5" /><path d="M16.5 15v1.7l1.1.8" />
    </template>
    <!-- MATRIX: storage rack with one located bin -->
    <template v-else-if="name === 'matrix'">
      <path d="M4 20V4.5M20 20V4.5M4 9.5h16M4 14.5h16M4 19.5h16" /><rect x="13.5" y="10.8" width="4" height="2.4" rx=".6" fill="currentColor" stroke="none" />
    </template>
    <!-- DORA: document scan frame -->
    <template v-else-if="name === 'dora'">
      <path d="M4.5 8.5v-2a2 2 0 0 1 2-2h2M15.5 4.5h2a2 2 0 0 1 2 2v2M19.5 15.5v2a2 2 0 0 1-2 2h-2M8.5 19.5h-2a2 2 0 0 1-2-2v-2" /><path d="M9 9.5h6M8 12h8M9 14.5h4" />
    </template>
  </svg>
</template>

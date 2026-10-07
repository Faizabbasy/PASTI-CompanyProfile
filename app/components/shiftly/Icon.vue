<script setup lang="ts">
// Line icons for /shiftly (1.6 stroke, currentColor). Keyed by name.
defineProps<{ name: string }>()
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'fingerprint'"><path d="M12 11v3a6 6 0 0 1-1.5 4" /><path d="M8.5 12a3.5 3.5 0 0 1 7 0v2a9 9 0 0 1-1 4" /><path d="M6 13v-1a6 6 0 0 1 12 0v1.5" /><path d="M4 11a8 8 0 0 1 13-6" /></template>
    <template v-else-if="name === 'face'"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M9 10h.01M15 10h.01" /><path d="M9.5 15a3.5 3.5 0 0 0 5 0" /></template>
    <template v-else-if="name === 'lock'"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /><path d="M12 15v2" /></template>
    <template v-else-if="name === 'sensor'"><circle cx="12" cy="12" r="2" /><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8" /></template>
    <template v-else-if="name === 'people'"><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6" /></template>
    <template v-else-if="name === 'process'"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" /></template>
    <template v-else-if="name === 'data'"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></template>
    <template v-else-if="name === 'technology'"><path d="M7 18a5 5 0 0 1-.5-10A6 6 0 0 1 18 8.5a4.5 4.5 0 0 1-.5 9.5Z" /></template>
    <template v-else-if="name === 'check'"><path d="M4 12.5l5 5L20 6.5" /></template>
    <template v-else-if="name === 'limited'"><circle cx="12" cy="12" r="7" /></template>
    <template v-else-if="name === 'none'"><path d="M6 6l12 12M18 6L6 18" /></template>
    <template v-else-if="name === 'plus'"><path d="M12 5v14M5 12h14" /></template>
    <template v-else-if="name === 'web'"><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></template>
    <template v-else-if="name === 'mobile'"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></template>
    <template v-else-if="name === 'systems'"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M17.5 14v7M14 17.5h7" /></template>
    <template v-else-if="name === 'hr'"><rect x="4" y="3" width="16" height="18" rx="2" /><circle cx="12" cy="10" r="2.5" /><path d="M8 17a4 4 0 0 1 8 0" /></template>
    <template v-else-if="name === 'devices'"><rect x="3" y="6" width="8" height="12" rx="1.5" /><rect x="14" y="3" width="7" height="18" rx="1.5" /><path d="M7 15h.01M17.5 17h.01" /></template>
    <template v-else><circle cx="12" cy="12" r="8" /></template>
  </svg>
</template>

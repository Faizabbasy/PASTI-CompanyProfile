<script setup lang="ts">
import type { SocialKey } from '~/composables/useFooter'

// Inline 24x24 social glyphs (currentColor) — no icon library dependency.
defineProps<{ name: SocialKey }>()
</script>

<template>
  <svg viewBox="0 0 24 24" aria-hidden="true" class="h-full w-full">
    <g v-if="name === 'linkedin'" fill="currentColor">
      <rect x="3.5" y="9" width="3.4" height="11.5" rx="0.6" />
      <circle cx="5.2" cy="5.3" r="2" />
      <path d="M9.6 9h3.3v1.6c.6-1.1 1.9-1.9 3.7-1.9 3.1 0 3.9 2 3.9 4.8v7h-3.4v-6.2c0-1.5-.2-2.9-2-2.9s-2.1 1.4-2.1 2.8v6.3H9.6z" />
    </g>
    <g v-else-if="name === 'instagram'" fill="none" stroke="currentColor" stroke-width="1.8">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </g>
    <g v-else-if="name === 'whatsapp'">
      <path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      <path
        fill="currentColor"
        d="M9.1 7.9c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .6.5l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.2-.2.3-.1.5.5.9 1.3 1.7 2.3 2.2.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.6-.1l1.7.8c.3.1.4.3.4.5 0 .6-.3 1.3-.9 1.7-.7.4-1.6.4-2.9-.1-2.1-.9-3.7-2.6-4.5-4.4-.6-1.2-.4-2.4.4-3.3z"
      />
    </g>
    <path
      v-else-if="name === 'tiktok'"
      fill="currentColor"
      d="M14.2 3h3c.2 1.9 1.5 3.4 3.3 3.6v3.1a7 7 0 0 1-3.3-1v6.1a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3.2a2.5 2.5 0 1 0 1.7 2.3z"
    />
    <g v-else-if="name === 'youtube'">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="currentColor" />
      <path d="M10.2 9.3v5.4l4.6-2.7z" class="fill-slateNavy" />
    </g>
  </svg>
</template>

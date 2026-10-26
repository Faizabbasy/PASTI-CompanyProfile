<script setup lang="ts">
import type { EditorNotice } from '~/composables/useSingletonEditor'

// Notice area for pages without an action bar (create forms).
defineProps<{ notice: EditorNotice | null }>()
</script>

<template>
  <div aria-live="polite" class="mt-4">
    <div
      v-if="notice"
      :role="notice.kind === 'error' ? 'alert' : 'status'"
      class="rounded-md border px-4 py-3 text-sm"
      :class="{
        'border-emerald-200 bg-emerald-50 text-emerald-900': notice.kind === 'success',
        'border-red-200 bg-red-50 text-red-800': notice.kind === 'error',
        'border-amber-200 bg-amber-50 text-amber-900': notice.kind === 'warning'
      }"
    >
      <span class="font-semibold">{{ notice.kind === 'error' ? 'Error.' : notice.kind === 'success' ? 'Done.' : 'Note.' }}</span>
      {{ notice.text }}
    </div>
  </div>
</template>

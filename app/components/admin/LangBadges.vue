<script setup lang="ts">
import type { PageStatus, RecordLangStates } from '#shared/cms/fields'

// Per-language status of one collection item (list rows): "ID ● EN ○".
// Text + shape, never colour alone (same marks as AdminStatusBadge).
defineProps<{ languages: RecordLangStates }>()
const MARK: Record<PageStatus, { mark: string; label: string; cls: string }> = {
  draft: { mark: '○', label: 'Draft', cls: 'text-navy-600' },
  published: { mark: '●', label: 'Published', cls: 'text-emerald-700' },
  archived: { mark: '▪', label: 'Archived', cls: 'text-gray-500' }
}
const NAME = { id: 'Indonesia', en: 'English' } as const
</script>

<template>
  <span class="inline-flex gap-2 text-[11px] font-semibold">
    <span v-for="l in (['id', 'en'] as const)" :key="l" :class="languages[l] ? MARK[languages[l]!.status].cls : 'text-navy-400'" :title="`${NAME[l]}: ${languages[l] ? MARK[languages[l]!.status].label + (languages[l]!.hasUnpublishedChanges && languages[l]!.status !== 'archived' ? ', ada perubahan belum di-publish' : '') : 'belum ada'}`">
      {{ l.toUpperCase() }} <span aria-hidden="true">{{ languages[l] ? MARK[languages[l]!.status].mark : '–' }}</span><span v-if="languages[l]?.hasUnpublishedChanges && languages[l]?.status === 'published'" aria-hidden="true">*</span>
      <span class="sr-only">{{ NAME[l] }}: {{ languages[l] ? MARK[languages[l]!.status].label : 'belum ada' }}</span>
    </span>
  </span>
</template>

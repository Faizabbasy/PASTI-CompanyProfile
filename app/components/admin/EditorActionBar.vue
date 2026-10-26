<script setup lang="ts">
import type { PageStatus, ActorRef } from '#shared/cms/fields'
import type { EditorBusy, EditorNotice } from '~/composables/useSingletonEditor'

// Sticky status + action bar of a singleton page editor, plus its notice
// area. Buttons are only shown when the role allows them; the server still
// enforces every permission.
defineProps<{
  state: {
    status: PageStatus
    hasUnpublishedChanges: boolean
    draft: { version: number; updatedAt: string; updatedBy: ActorRef }
    published: { version: number; publishedAt: string; publishedBy: ActorRef } | null
  }
  dirty: boolean
  busy: EditorBusy
  previewHref: string
  canPublish: boolean
  canUnpublish: boolean
  canArchive: boolean
  publishDisabledReason: string
  notice: EditorNotice | null
  sessionExpired: boolean
}>()

defineEmits<{ save: []; status: [kind: 'publish' | 'unpublish' | 'archive'] }>()
</script>

<template>
  <div class="sticky top-16 z-10 -mx-4 mt-5 border-y border-navy-100 bg-white/95 px-4 py-3 tablet:-mx-8 tablet:px-8">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <AdminStatusBadge :status="state.status" />
      <dl class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-600">
        <div><dt class="inline font-semibold">Draft:</dt> <dd class="ml-1 inline">v{{ state.draft.version }}<template v-if="state.hasUnpublishedChanges"> (unpublished changes)</template></dd></div>
        <div><dt class="inline font-semibold">Last edited:</dt> <dd class="ml-1 inline">{{ fmtCmsTime(state.draft.updatedAt) }} by {{ state.draft.updatedBy.name }}</dd></div>
        <div>
          <dt class="inline font-semibold">Published:</dt>
          <dd class="ml-1 inline">
            <template v-if="state.published">v{{ state.published.version }} · {{ fmtCmsTime(state.published.publishedAt) }} by {{ state.published.publishedBy.name }}<template v-if="state.status !== 'published'"> (not live)</template></template>
            <template v-else>never</template>
          </dd>
        </div>
      </dl>
      <span v-if="dirty" class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900" role="status">
        <span aria-hidden="true">●</span> Unsaved changes
      </span>

      <div class="ml-auto flex flex-wrap items-center gap-2">
        <a :href="previewHref" target="_blank" rel="noopener" class="rounded-md border border-navy-200 px-3 py-1.5 text-sm font-medium hover:bg-navy-50">
          {{ dirty ? 'Preview saved draft' : 'Preview' }}<span class="sr-only"> (opens in a new tab)</span>
        </a>
        <button
          type="button"
          class="rounded-md bg-slateNavy px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
          :disabled="busy !== null"
          :aria-busy="busy === 'save'"
          @click="$emit('save')"
        >{{ busy === 'save' ? 'Saving…' : 'Save draft' }}</button>
        <template v-if="canPublish">
          <button
            type="button"
            class="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="busy !== null || !!publishDisabledReason"
            :title="publishDisabledReason || undefined"
            :aria-describedby="publishDisabledReason ? 'publish-reason' : undefined"
            @click="$emit('status', 'publish')"
          >{{ busy === 'publish' ? 'Publishing…' : 'Publish' }}</button>
          <span v-if="publishDisabledReason" id="publish-reason" class="sr-only">{{ publishDisabledReason }}</span>
        </template>
        <button
          v-if="canUnpublish"
          type="button"
          class="rounded-md border border-navy-200 px-3 py-1.5 text-sm hover:bg-navy-50 disabled:opacity-60"
          :disabled="busy !== null"
          @click="$emit('status', 'unpublish')"
        >{{ state.status === 'archived' ? 'Restore to draft' : 'Unpublish' }}</button>
        <button
          v-if="canArchive"
          type="button"
          class="rounded-md border border-navy-200 px-3 py-1.5 text-sm hover:bg-navy-50 disabled:opacity-60"
          :disabled="busy !== null"
          @click="$emit('status', 'archive')"
        >Archive</button>
      </div>
    </div>
    <p v-if="!canPublish" class="mt-2 text-xs text-navy-500">Editors can save drafts and preview. An admin publishes.</p>
  </div>

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
      <span class="font-semibold">{{ notice.kind === 'success' ? 'Done.' : notice.kind === 'error' ? 'Error.' : 'Note.' }}</span>
      {{ notice.text }}
      <a v-if="sessionExpired" href="/admin/login" target="_blank" rel="noopener" class="ml-1 font-semibold underline">Sign in (new tab)</a>
    </div>
  </div>
</template>

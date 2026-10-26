<script setup lang="ts">
import type { CollectionAdminState } from '#shared/cms/fields'
import { CATEGORY_LIMITS as LIM, type CategoryContent, type CategoryExtra } from '#shared/utils/insightsSchema'

// Category record editor (name, slug, description, active).
definePageMeta({ layout: 'admin' })

type CategoryState = CollectionAdminState<CategoryContent, CategoryExtra>
const id = useRoute().params.id as string

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<CategoryState, CategoryForm>({
  name: 'this category',
  endpoint: `/api/admin/insights/categories/${id}`,
  asyncKey: `admin-insights-category-${id}`,
  tabs: CATEGORY_TABS,
  toForm: toCategoryForm,
  toPayload: toCategoryPayload,
  validate: validateCategoryForm
})
useHead({ title: computed(() => `${state.value?.draft.content.name ?? 'Category'} · Categories`) })
const { canDelete, remove, deleting, deleteError } = useRecordDelete(`/api/admin/insights/categories/${id}`, '/admin/insights/categories', () => state.value?.draft.content.name ?? id)
const slugChanged = computed(() => !!state.value?.extra.publishedSlug && form.value?.slug !== state.value.extra.publishedSlug)
</script>

<template>
  <section>
    <nav aria-label="Breadcrumb" class="text-xs text-navy-500">
      <NuxtLink to="/admin/insights" class="hover:underline">Insights</NuxtLink> <span aria-hidden="true">/</span>
      <NuxtLink to="/admin/insights/categories" class="hover:underline">Categories</NuxtLink> <span aria-hidden="true">/</span> {{ state?.draft.content.name ?? id }}
    </nav>
    <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Loading category…</div>
    <div v-else-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError.statusCode === 404 ? 'This category does not exist.' : 'Could not load the category.' }}
      <button v-if="loadError.statusCode !== 404" type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>
    <template v-else-if="form && state">
      <div class="mt-1 flex flex-wrap items-center gap-3">
        <h1 class="text-2xl font-bold">{{ state.draft.content.name }}</h1>
        <span v-if="state.dummy" class="rounded-full border border-dashed border-navy-300 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">Dummy data</span>
        <span class="text-sm text-navy-500">{{ state.extra.articleCount }} article(s)</span>
      </div>
      <AdminEditorActionBar
        :state="state"
        :dirty="dirty"
        :busy="busy"
        preview-href="/admin/preview/insights"
        :can-publish="canPublish"
        :can-unpublish="canUnpublish"
        :can-archive="canArchive"
        :publish-disabled-reason="publishDisabledReason"
        :notice="notice"
        :session-expired="sessionExpired"
        @save="saveDraft"
        @status="runStatusAction"
      />
      <AdminEditorTabs v-model="activeTab" :tabs="CATEGORY_TABS" label="Category sections" :error-count="errorCount" />
      <div id="panel-details" role="tabpanel" aria-labelledby="tab-details" class="mt-6 grid max-w-3xl gap-5">
        <AdminFormField :id="fieldId('name')" v-model="form.name" label="Name" :maxlength="LIM.name" required hint="Shown as the filter chip and the article topic." :error="err('name')" />
        <div>
          <AdminFormField :id="fieldId('slug')" v-model="form.slug" label="Slug" :maxlength="60" required :error="err('slug')" />
          <p v-if="slugChanged" class="mt-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900" role="alert">The published slug is “{{ state.extra.publishedSlug }}”.</p>
        </div>
        <AdminFormField :id="fieldId('description')" v-model="form.description" label="Description (optional, internal)" multiline :maxlength="LIM.description" :error="err('description')" />
        <label class="inline-flex items-center gap-2 text-sm">
          <input v-model="form.active" type="checkbox" class="h-4 w-4">
          Active — offered publicly (filter and article topic) once published
        </label>
        <div v-if="canDelete(state)" class="rounded-lg border border-red-200 bg-red-50/50 p-4 text-sm">
          <h2 class="font-semibold text-red-800">Delete draft</h2>
          <p class="mt-1 text-navy-600">Never published and only possible while no article or the Insights page uses it.</p>
          <button type="button" class="mt-2 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-60" :disabled="deleting" @click="remove">{{ deleting ? 'Deleting…' : 'Delete category' }}</button>
          <p v-if="deleteError" class="mt-2 text-xs text-red-700" role="alert">{{ deleteError }}</p>
        </div>
      </div>
      <AdminPublishedVersions :revisions="state.revisions" />
    </template>
  </section>
</template>

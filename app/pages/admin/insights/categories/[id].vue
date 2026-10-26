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
  name: 'topik ini',
  endpoint: `/api/admin/insights/categories/${id}`,
  asyncKey: `admin-insights-category-${id}`,
  tabs: CATEGORY_TABS,
  toForm: toCategoryForm,
  toPayload: toCategoryPayload,
  validate: validateCategoryForm
})
useHead({ title: computed(() => `${state.value?.draft.content.name ?? 'Topik'} · Categories`) })
const { canDelete, remove, deleting, deleteError } = useRecordDelete(`/api/admin/insights/categories/${id}`, '/admin/insights/categories', () => state.value?.draft.content.name ?? id)
const slugChanged = computed(() => !!state.value?.extra.publishedSlug && form.value?.slug !== state.value.extra.publishedSlug)
</script>

<template>
  <div>
    <div v-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError.statusCode === 404 ? 'Topik ini tidak ada.' : 'Topik gagal dimuat.' }}
      <button v-if="loadError.statusCode !== 404" type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
      <NuxtLink v-else to="/admin/insights/categories" class="ml-2 font-semibold underline">Kembali ke daftar topik</NuxtLink>
    </div>

    <AdminEditorFrame
      v-else
      v-model:active-tab="activeTab"
      :title="state?.draft.content.name || 'Topik'"
      crumb="Insights · Categories"
      crumb-to="/admin/insights/categories"
      :tabs="CATEGORY_TABS"
      preview-path="/admin/preview/insights"
      :code-managed="[]"
      :dummy="!!state?.dummy"
      :dirty="dirty"
      :error-count="errorCount"
      :ready="!!(form && state)"
      :how-to="['Topik yang sedang dipakai artikel atau halaman Insights tidak bisa diarsipkan atau dihapus.']"
    >
      <template #badges>
        <span v-if="state" class="text-sm text-navy-500">Dipakai {{ state.extra.articleCount }} artikel</span>
      </template>
      <template #status>
        <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat topik…</div>
      </template>

      <template #actions>
        <AdminEditorActionBar
          v-if="form && state"
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
      </template>

      <div v-if="form && state" class="grid gap-5">
        <AdminFormField :id="fieldId('name')" v-model="form.name" label="Nama topik" :maxlength="LIM.name" required hint="Tampil sebagai tombol filter dan sebagai topik artikel." :error="err('name')" />
        <div>
          <AdminFormField :id="fieldId('slug')" v-model="form.slug" label="Slug (alamat)" :maxlength="60" required hint="Huruf kecil-dengan-tanda-hubung, unik." :error="err('slug')" />
          <p v-if="slugChanged" class="mt-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900" role="alert">Slug yang sudah tayang: “{{ state.extra.publishedSlug }}”.</p>
        </div>
        <AdminFormField :id="fieldId('description')" v-model="form.description" label="Keterangan (opsional, hanya untuk internal)" multiline :maxlength="LIM.description" :error="err('description')" />
        <label class="inline-flex items-center gap-2 text-sm">
          <input v-model="form.active" type="checkbox" class="h-4 w-4">
          Tampilkan — dipakai di website (filter & topik artikel) setelah di-publish
        </label>
        <div v-if="canDelete(state)" class="rounded-lg border border-red-200 bg-red-50/50 p-4 text-sm">
          <h3 class="font-semibold text-red-800">Hapus draft</h3>
          <p class="mt-1 text-navy-600">Hanya bisa kalau topik ini belum pernah tayang dan tidak dipakai artikel atau halaman Insights.</p>
          <button type="button" class="mt-2 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-60" :disabled="deleting" @click="remove">{{ deleting ? 'Menghapus…' : 'Hapus topik' }}</button>
          <p v-if="deleteError" class="mt-2 text-xs text-red-700" role="alert">{{ deleteError }}</p>
        </div>
      </div>

      <template #after>
        <AdminPublishedVersions v-if="state" :revisions="state.revisions" />
      </template>
    </AdminEditorFrame>
  </div>
</template>

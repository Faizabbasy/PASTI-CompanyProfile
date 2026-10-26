<script setup lang="ts">
import type { CollectionAdminState } from '#shared/cms/fields'
import type { ArticleContent, ArticleExtra, CategoryListRow } from '#shared/utils/insightsSchema'

// Article record editor. Unsaved-change protection, optimistic locking and
// the publish workflow come from useSingletonEditor.
definePageMeta({ layout: 'admin' })

type ArticleState = CollectionAdminState<ArticleContent, ArticleExtra>
const id = useRoute().params.id as string
const { cmsFetch } = useCmsSession()
const { data: categories } = await useAsyncData(`admin-insights-article-${id}-cats`, () => cmsFetch<CategoryListRow[]>('/api/admin/insights/categories'))

const {
  loadStatus, loadError, refresh, form, state, dirty, activeTab, errorCount, err, notice, sessionExpired, busy,
  saveDraft, runStatusAction, canPublish, canUnpublish, canArchive, publishDisabledReason
} = await useSingletonEditor<ArticleState, ArticleForm>({
  name: 'artikel ini',
  endpoint: `/api/admin/insights/articles/${id}`,
  asyncKey: `admin-insights-article-${id}`,
  tabs: ARTICLE_TABS,
  toForm: toArticleForm,
  toPayload: toArticlePayload,
  validate: validateArticleForm
})
useHead({ title: computed(() => `${state.value?.draft.content.title ?? 'Artikel'} · Articles`) })
const { canDelete, remove, deleting, deleteError } = useRecordDelete(`/api/admin/insights/articles/${id}`, '/admin/insights/articles', () => state.value?.draft.content.title ?? id)

const codeManaged = [
  'Desain baris artikel, pratinjau, pembaca layar penuh dan animasinya.',
  'Teks kecil antarmuka: “Read insight”, “In this insight”, “Next”, “View full poster”, “Now showing”.',
  'Isi kutipan “PASTI perspective” — diambil dari data perusahaan; di sini hanya memilih sumbernya.',
  'Urutan artikel dan apakah artikel tampil — diatur di Insights → Insights page.'
]
</script>

<template>
  <div>
    <div v-if="loadError && !form" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError.statusCode === 404 ? 'Artikel ini tidak ada.' : 'Artikel gagal dimuat.' }}
      <button v-if="loadError.statusCode !== 404" type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
      <NuxtLink v-else to="/admin/insights/articles" class="ml-2 font-semibold underline">Kembali ke daftar artikel</NuxtLink>
    </div>

    <AdminEditorFrame
      v-else
      v-model:active-tab="activeTab"
      :title="state?.draft.content.title || 'Artikel'"
      crumb="Insights · Articles"
      crumb-to="/admin/insights/articles"
      :tabs="ARTICLE_TABS"
      :preview-path="`/admin/preview/insights/articles/${id}`"
      :code-managed="codeManaged"
      :dummy="!!state?.dummy"
      :migrated-version="state?.source.kind === 'migration' ? state.source.version : null"
      :dirty="dirty"
      :error-count="errorCount"
      :ready="!!(form && state)"
      :how-to="['Artikel baru tampil di /insights setelah di-publish DAN dipilih di Insights → Insights page.', 'Artikel yang sudah pernah tayang tidak bisa dihapus — pakai Archive untuk menurunkannya.']"
    >
      <template #status>
        <div v-if="loadStatus === 'pending' && !form" class="mt-6 text-sm text-navy-500" role="status">Memuat artikel…</div>
      </template>

      <template #actions>
        <AdminEditorActionBar
          v-if="form && state"
          :state="state"
          :dirty="dirty"
          :busy="busy"
          :preview-href="`/admin/preview/insights/articles/${id}`"
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

      <template v-if="form && state" #default>
        <div v-for="t in (['basics', 'content', 'media', 'body'] as const)" v-show="activeTab === t" :key="t">
          <AdminInsightsArticleFields :form="form" :err="err" :categories="categories ?? []" :tab="t" :published-slug="state.extra.publishedSlug" />
        </div>
        <div v-show="activeTab === 'relations'" class="grid gap-4 text-sm">
          <div class="rounded-lg border border-navy-100 bg-white p-4">
            <h3 class="font-semibold">Di halaman Insights</h3>
            <p class="mt-1 text-navy-600">
              Draft halaman: {{ state.extra.usedInLanding.draft ? 'dipilih' : 'tidak dipilih' }} · Website sekarang: {{ state.extra.usedInLanding.published ? 'tampil' : 'tidak tampil' }}.
              Urutan dan tampil/tidaknya diatur di <NuxtLink to="/admin/insights" class="underline">Insights → Insights page</NuxtLink>.
            </p>
            <p class="mt-1 text-xs text-navy-500">Tombol “Next” di pembaca artikel mengikuti urutan di halaman Insights (diatur di kode); desain sekarang tidak punya blok artikel terkait.</p>
          </div>
          <div v-if="canDelete(state)" class="rounded-lg border border-red-200 bg-red-50/50 p-4">
            <h3 class="font-semibold text-red-800">Hapus draft</h3>
            <p class="mt-1 text-navy-600">Artikel ini belum pernah tayang, jadi bisa dihapus permanen.</p>
            <button type="button" class="mt-2 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-60" :disabled="deleting" @click="remove">{{ deleting ? 'Menghapus…' : 'Hapus artikel' }}</button>
            <p v-if="deleteError" class="mt-2 text-xs text-red-700" role="alert">{{ deleteError }}</p>
          </div>
        </div>
      </template>

      <template #after>
        <AdminPublishedVersions v-if="state" :revisions="state.revisions" />
      </template>
    </AdminEditorFrame>
  </div>
</template>

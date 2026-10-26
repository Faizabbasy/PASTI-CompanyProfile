<script setup lang="ts">
import type { CategoryListRow } from '#shared/utils/insightsSchema'
import type { CollectionAdminStateLike } from '~/composables/useCollectionRecord'

// Create an article as an unpublished draft, then continue in its editor.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Artikel baru · Insights' })

const { cmsFetch } = useCmsSession()
const { data: categories } = await useAsyncData('admin-insights-new-article-cats', () => cmsFetch<CategoryListRow[]>('/api/admin/insights/categories'))
const form = ref<ArticleForm>(emptyArticle())
const { errors, err, notice, busy, submit } = useCollectionCreate()

// Only the groups needed to create; the full body comes later in the editor.
const TABS = ARTICLE_TABS.filter((t) => t.key === 'basics' || t.key === 'content' || t.key === 'media')
const activeTab = ref<string>('basics')
const errorCount = (key: string) => Object.keys(errors.value).filter((p) => tabForPathIn(TABS, p) === key).length
// Open the group holding the first error before it gets focused.
watch(errors, (e) => {
  const first = Object.keys(e)[0]
  const tab = first ? tabForPathIn(TABS, first) : null
  if (tab) activeTab.value = tab
}, { flush: 'sync' })

async function create() {
  await submit({
    validate: () => validateArticleForm(form.value),
    request: () => cmsFetch<{ state: CollectionAdminStateLike }>('/api/admin/insights/articles', { method: 'POST', body: { content: toArticlePayload(form.value) }, keepOn401: true }),
    then: (res) => navigateTo(`/admin/insights/articles/${res.state.id}`)
  })
}
</script>

<template>
  <AdminEditorFrame
    v-model:active-tab="activeTab"
    title="Artikel baru"
    crumb="Insights · Articles"
    crumb-to="/admin/insights/articles"
    :tabs="TABS"
    :code-managed="[]"
    :error-count="errorCount"
    ready
    :how-to="['Isi ketiga bagian di kiri, lalu klik Buat draft. Isi lengkap artikel bisa ditambahkan setelahnya.', 'Artikel tampil di /insights hanya setelah di-publish admin DAN dipilih di Insights → Insights page.']"
  >
    <template #actions>
      <div class="sticky top-16 z-10 -mx-4 mt-5 flex flex-wrap items-center gap-3 border-y border-navy-100 bg-white/95 px-4 py-3 tablet:-mx-8 tablet:px-8">
        <span class="text-sm text-navy-600">Artikel baru disimpan sebagai <strong>draft</strong> (belum tampil di website).</span>
        <button type="button" class="ml-auto rounded-md bg-slateNavy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60" :disabled="busy" @click="create">{{ busy ? 'Membuat…' : 'Buat draft' }}</button>
      </div>
      <AdminEditorNotice :notice="notice" />
      <p v-if="Object.keys(errors).length" class="mt-3 text-sm text-red-700" role="alert">Perbaiki kolom yang ditandai merah (jumlah error tampil di daftar bagian kiri).</p>
    </template>

    <form novalidate @submit.prevent="create">
      <div v-for="t in (['basics', 'content', 'media'] as const)" v-show="activeTab === t" :key="t">
        <AdminInsightsArticleFields :form="form" :err="err" :categories="categories ?? []" :tab="t" />
      </div>
    </form>
  </AdminEditorFrame>
</template>

<script setup lang="ts">
import type { PageStatus } from '#shared/cms/fields'
import { resolveInsightsView, type InsightsPageContent } from '#shared/utils/insightsPublic'
import type { ArticleContent, CategoryContent, InsightsContent } from '#shared/utils/insightsSchema'

// Authenticated draft preview of /insights (ADMIN + EDITOR). Lives under
// /admin (session gate, no-store, noindex); data comes from
// /api/admin/insights/preview, never from /api/public. The landing draft is
// joined with the DRAFTS of its articles / categories through the same
// resolver and adapter the public page uses and rendered with the REAL
// Insights sections.
definePageMeta({ layout: false })
// Bilingual: which language record is being edited / previewed (?lang=, default Indonesian).
const lang = useEditorLang()
useHead({ title: 'Preview · Insights (draft) · PASTI CMS', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

interface Src<C> { id: string; status: PageStatus; content: C }
interface PreviewResponse {
  insights: { version: number; revision: number; status: PageStatus; updatedAt: string; content: InsightsContent }
  articles: Src<ArticleContent>[]
  categories: Src<CategoryContent>[]
}

const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData(`admin-insights-preview-${lang}`, () => cmsFetch<PreviewResponse>('/api/admin/insights/preview', { query: { lang } }))
const legacy = buildLegacyInsightsContent()

const preview = computed<InsightsPageContent | null>(() => {
  const d = data.value
  if (!d) return null
  const { counts: _c, ...content } = resolveInsightsView(d.insights.content, d.articles, d.categories)
  return adaptInsightsCms(legacy, { version: d.insights.version, content })
})
const mainRef = ref<HTMLElement | null>(null)
usePreviewJump(mainRef)

// Klik teks untuk edit: landing texts open the Insights page editor, article
// texts open that article's editor (found by slug among the drafts).
provideCmsMarks({
  href: (record, path) => {
    if (!record) return cmsFieldHref('/admin/insights', lang, path)
    const slug = record.replace(/^article:/, '')
    const a = data.value?.articles.find((x) => x.content.slug === slug)
    return a ? cmsFieldHref(`/admin/insights/articles/${a.id}`, lang, path) : null
  }
})
// "Read the full article" in the Reader opens that draft's article-page preview.
provideInsightArticleLink((a) => {
  const rec = data.value?.articles.find((x) => x.content.slug === a.slug)
  return rec ? `/admin/preview/insights/articles/${rec.id}?lang=${lang}&view=page` : '#'
})
const notLive = computed(() => {
  const d = data.value
  if (!d) return 0
  const ids = new Set([...d.insights.content.contents.items.filter((i) => i.active).map((i) => i.articleId), ...d.insights.content.filters.items.filter((i) => i.active).map((i) => i.categoryId)])
  return [...d.articles, ...d.categories].filter((r) => ids.has(r.id) && r.status !== 'published').length
})
</script>

<template>
  <div class="min-h-screen bg-pureWhite">
    <div class="sticky top-0 z-[60] border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 tablet:px-8" role="note">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
        <strong>Preview draft — belum tampil di website</strong>
        <span v-if="data">Insights · draft v{{ data.insights.version }} · disimpan {{ fmtCmsTime(data.insights.updatedAt) }} · status: {{ data.insights.status }}</span>
        <span v-if="notLive" class="text-xs">{{ notLive }} artikel/topik yang dipilih belum di-publish</span>
        <span class="text-xs">Arahkan kursor ke teks untuk melihat kolomnya, klik untuk langsung mengeditnya. Klik panah bulat di ujung baris untuk membuka pembaca artikel; matikan tombol ✎ untuk mencoba halaman seperti biasa.</span>
        <span v-if="preview?.source === 'legacy'" class="text-xs font-semibold">Tidak ada artikel yang bisa ditampilkan — halaman publik akan tetap memakai konten bawaan.</span>
        <span class="ml-auto inline-flex items-center gap-2"><AdminCmsPicker v-if="preview" /><button type="button" class="rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Muat ulang draft</button></span>
      </div>
    </div>
    <p v-if="status === 'pending'" class="p-8 text-sm" role="status">Memuat draft…</p>
    <div v-else-if="error" class="mx-auto max-w-xl p-8" role="alert">
      <p class="font-semibold">Preview tidak tersedia.</p>
      <p class="mt-1 text-sm text-navy-600">{{ error.statusCode === 403 ? 'Role kamu tidak bisa membuka preview ini.' : 'Draft gagal dimuat. Mungkin sesi login sudah habis.' }}</p>
      <a :href="`/admin/insights?lang=${lang}`" class="mt-3 inline-block text-sm font-semibold underline">Kembali ke editor</a>
    </div>
    <main v-else-if="preview" ref="mainRef">
      <AdminInsightsPreviewScope :key="`${data?.insights.version}-${data?.insights.revision}-${data?.insights.updatedAt}`" :content="preview">
        <InsightsMasthead />
        <InsightsContents />
      </AdminInsightsPreviewScope>
    </main>
  </div>
</template>

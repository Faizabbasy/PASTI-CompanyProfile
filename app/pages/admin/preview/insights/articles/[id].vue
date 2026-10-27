<script setup lang="ts">
import type { PageStatus } from '#shared/cms/fields'
import { resolveArticlePage, resolveInsightsView, type InsightsArticleView, type InsightsPageContent } from '#shared/utils/insightsPublic'
import type { ArticleContent, CategoryContent } from '#shared/utils/insightsSchema'

// Authenticated draft preview of ONE article (ADMIN + EDITOR, noindex,
// no-store), two views (?view=):
//   page   — its own page /insights/:slug, with the issue's Next / More
//            (default once the article has a body)
//   reader — the real Contents list + Reader (click the row to open it)
definePageMeta({ layout: false })
// Bilingual: which language record is being edited / previewed (?lang=, default Indonesian).
const lang = useEditorLang()
useHead({ title: 'Preview · Article (draft) · PASTI CMS', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

interface PreviewResponse {
  record: { id: string; status: PageStatus; version: number; updatedAt: string; content: ArticleContent }
  categories: { id: string; status: PageStatus; content: CategoryContent }[]
  issue: { id: string; articleId: string; sortOrder: number; active: boolean }[]
  articles: { id: string; content: ArticleContent }[]
}

const id = useRoute().params.id as string
const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData(`admin-insights-article-preview-${id}-${lang}`, () => cmsFetch<PreviewResponse>(`/api/admin/insights/articles/${id}/preview`, { query: { lang } }))
const legacy = buildLegacyInsightsContent()

const preview = computed<InsightsPageContent | null>(() => {
  const d = data.value
  if (!d) return null
  const landing = {
    hero: { eyebrow: '', headline: '-', lede: '', primaryCtaLabel: '', secondaryCtaLabel: '', secondaryCtaUrl: '' },
    contents: { sectionLabel: legacy.contents.sectionLabel, title: legacy.contents.title, items: [{ id: 'preview', articleId: d.record.id, sortOrder: 1, active: true }] },
    filters: { items: d.record.content.categoryIds.map((categoryId, i) => ({ id: `f${i}`, categoryId, sortOrder: i + 1, active: true })) },
    seo: { metaTitle: '', metaDescription: '', ogImage: '', canonicalUrl: '', noIndex: true }
  }
  const r = resolveInsightsView(landing, [d.record], d.categories)
  return { ...legacy, contents: { ...legacy.contents, topics: r.filters, articles: toInsightsArticleViews(r.contents.articles) } }
})
const route = useRoute()
const hasBody = computed(() => !!data.value?.record.content.body.length)
const view = computed<'page' | 'reader'>(() => (route.query.view === 'reader' || (route.query.view !== 'page' && !hasBody.value) ? 'reader' : 'page'))
const viewHref = (v: 'page' | 'reader') => `/admin/preview/insights/articles/${id}?lang=${lang}&view=${v}`
const articlePage = computed(() => {
  const d = data.value
  if (!d) return null
  const r = resolveArticlePage({ contents: { items: d.issue } }, [d.record, ...d.articles], d.categories, d.record.content.slug, { requireBody: false })
  return r ? toArticlePageView(r) : null
})
// Article links inside the preview open the other drafts' previews.
provideInsightArticleLink((a: InsightsArticleView) => {
  if (a.slug === data.value?.record.content.slug) return viewHref('page')
  const other = data.value?.articles.find((x) => x.content.slug === a.slug)
  return other ? `/admin/preview/insights/articles/${other.id}?lang=${lang}&view=${a.hasBody ? 'page' : 'reader'}` : viewHref('reader')
})
const mainRef = ref<HTMLElement | null>(null)
usePreviewJump(mainRef)

// Klik teks untuk edit: article texts open this article's editor; list
// heading / filters open the Insights page editor.
provideCmsMarks({
  href: (record, path) => {
    if (!record) return cmsFieldHref('/admin/insights', lang, path)
    return data.value && record === `article:${data.value.record.content.slug}` ? cmsFieldHref(`/admin/insights/articles/${id}`, lang, path) : null
  }
})
</script>

<template>
  <div class="min-h-screen bg-pureWhite">
    <div class="sticky top-0 z-[60] border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 tablet:px-8" role="note">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
        <strong>Preview draft — belum tampil di website</strong>
        <span v-if="data">Artikel · draft v{{ data.record.version }} · disimpan {{ fmtCmsTime(data.record.updatedAt) }} · status: {{ data.record.status }}</span>
        <span class="inline-flex overflow-hidden rounded border border-amber-400 text-xs font-semibold" role="group" aria-label="Tampilan preview">
          <NuxtLink :to="viewHref('page')" class="px-2 py-0.5" :class="view === 'page' ? 'bg-amber-400 text-amber-950' : 'hover:bg-amber-100'">Halaman artikel</NuxtLink>
          <NuxtLink :to="viewHref('reader')" class="border-l border-amber-400 px-2 py-0.5" :class="view === 'reader' ? 'bg-amber-400 text-amber-950' : 'hover:bg-amber-100'">Daftar + pembaca</NuxtLink>
        </span>
        <span v-if="view === 'page' && !hasBody" class="text-xs font-semibold">Isi lengkap masih kosong — halaman ini baru tampil di website setelah tab “Isi lengkap” diisi.</span>
        <span class="text-xs">Arahkan kursor ke teks untuk melihat kolomnya, klik untuk langsung mengeditnya.<template v-if="view === 'reader'"> Untuk membuka pembaca artikel, klik tombol panah bulat di ujung baris artikel.</template></span>
        <span class="ml-auto inline-flex items-center gap-2"><AdminCmsPicker v-if="preview" /><button type="button" class="rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Muat ulang draft</button></span>
      </div>
    </div>
    <p v-if="status === 'pending'" class="p-8 text-sm" role="status">Memuat draft…</p>
    <div v-else-if="error" class="mx-auto max-w-xl p-8" role="alert">
      <p class="font-semibold">Preview tidak tersedia.</p>
      <p class="mt-1 text-sm text-navy-600">{{ error.statusCode === 403 ? 'Role kamu tidak bisa membuka preview ini.' : 'Draft gagal dimuat. Mungkin sesi login sudah habis.' }}</p>
      <a :href="`/admin/insights/articles/${id}?lang=${lang}`" class="mt-3 inline-block text-sm font-semibold underline">Kembali ke editor</a>
    </div>
    <main v-else-if="preview" ref="mainRef">
      <AdminInsightsPreviewScope :key="`${data?.record.version}-${data?.record.updatedAt}`" :content="preview">
        <InsightsArticle v-if="view === 'page' && articlePage" :key="`page-${data?.record.updatedAt}`" :page="articlePage" />
        <InsightsContents v-else />
      </AdminInsightsPreviewScope>
    </main>
  </div>
</template>

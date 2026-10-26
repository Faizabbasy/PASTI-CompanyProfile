<script setup lang="ts">
import type { PageStatus } from '#shared/cms/fields'
import { resolveInsightsView, type InsightsPageContent } from '#shared/utils/insightsPublic'
import type { ArticleContent, CategoryContent } from '#shared/utils/insightsSchema'

// Authenticated draft preview of ONE article in the real Contents list +
// Reader (ADMIN + EDITOR, noindex, no-store). Click the row to open it.
definePageMeta({ layout: false })
useHead({ title: 'Preview · Article (draft) · PASTI CMS', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

interface PreviewResponse {
  record: { id: string; status: PageStatus; version: number; updatedAt: string; content: ArticleContent }
  categories: { id: string; status: PageStatus; content: CategoryContent }[]
}

const id = useRoute().params.id as string
const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData(`admin-insights-article-preview-${id}`, () => cmsFetch<PreviewResponse>(`/api/admin/insights/articles/${id}/preview`))
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
</script>

<template>
  <div class="min-h-screen bg-pureWhite">
    <div class="sticky top-0 z-[60] border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 tablet:px-8" role="note">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
        <strong>Draft preview — not public</strong>
        <span v-if="data">Article · draft v{{ data.record.version }} · saved {{ fmtCmsTime(data.record.updatedAt) }} · status: {{ data.record.status }}</span>
        <span class="text-xs">Click the row to open the reader. Body blocks are not shown yet (no article page).</span>
        <button type="button" class="ml-auto rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Reload draft</button>
      </div>
    </div>
    <p v-if="status === 'pending'" class="p-8 text-sm" role="status">Loading draft…</p>
    <div v-else-if="error" class="mx-auto max-w-xl p-8" role="alert">
      <p class="font-semibold">Preview unavailable.</p>
      <p class="mt-1 text-sm text-navy-600">{{ error.statusCode === 403 ? 'Your role cannot preview this record.' : 'The draft could not be loaded.' }}</p>
      <a :href="`/admin/insights/articles/${id}`" class="mt-3 inline-block text-sm font-semibold underline">Back to the editor</a>
    </div>
    <main v-else-if="preview">
      <AdminInsightsPreviewScope :key="`${data?.record.version}-${data?.record.updatedAt}`" :content="preview">
        <InsightsContents />
      </AdminInsightsPreviewScope>
    </main>
  </div>
</template>

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
useHead({ title: 'Preview · Insights (draft) · PASTI CMS', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

interface Src<C> { id: string; status: PageStatus; content: C }
interface PreviewResponse {
  insights: { version: number; revision: number; status: PageStatus; updatedAt: string; content: InsightsContent }
  articles: Src<ArticleContent>[]
  categories: Src<CategoryContent>[]
}

const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData('admin-insights-preview', () => cmsFetch<PreviewResponse>('/api/admin/insights/preview'))
const legacy = buildLegacyInsightsContent()

const preview = computed<InsightsPageContent | null>(() => {
  const d = data.value
  if (!d) return null
  const { counts: _c, ...content } = resolveInsightsView(d.insights.content, d.articles, d.categories)
  return adaptInsightsCms(legacy, { version: d.insights.version, content })
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
        <strong>Draft preview — not public</strong>
        <span v-if="data">Insights · draft v{{ data.insights.version }} · saved {{ fmtCmsTime(data.insights.updatedAt) }} · page status: {{ data.insights.status }}</span>
        <span v-if="notLive" class="text-xs">{{ notLive }} selected record(s) not published yet</span>
        <span v-if="preview?.source === 'legacy'" class="text-xs font-semibold">No listed article resolves — the public page would keep its code content.</span>
        <button type="button" class="ml-auto rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Reload draft</button>
      </div>
    </div>
    <p v-if="status === 'pending'" class="p-8 text-sm" role="status">Loading draft…</p>
    <div v-else-if="error" class="mx-auto max-w-xl p-8" role="alert">
      <p class="font-semibold">Preview unavailable.</p>
      <p class="mt-1 text-sm text-navy-600">{{ error.statusCode === 403 ? 'Your role cannot preview this page.' : 'The draft could not be loaded. Your session may have expired.' }}</p>
      <a href="/admin/insights" class="mt-3 inline-block text-sm font-semibold underline">Back to the editor</a>
    </div>
    <main v-else-if="preview">
      <AdminInsightsPreviewScope :key="`${data?.insights.version}-${data?.insights.revision}-${data?.insights.updatedAt}`" :content="preview">
        <InsightsMasthead />
        <InsightsContents />
      </AdminInsightsPreviewScope>
    </main>
  </div>
</template>

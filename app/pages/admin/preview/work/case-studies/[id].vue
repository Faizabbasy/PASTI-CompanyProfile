<script setup lang="ts">
import type { PageStatus } from '#shared/cms/fields'
import type { CaseStudyContent } from '#shared/utils/caseStudySchema'
import type { ProjectContent } from '#shared/utils/projectSchema'
import { resolveWorkView, type WorkPageContent } from '#shared/utils/workPublic'

// Authenticated draft preview of ONE case study in the real Featured Case
// Studies section (ADMIN + EDITOR, noindex, no-store). Same public filter as
// the live page: only confirmed metrics / images are shown.
definePageMeta({ layout: false })
useHead({ title: 'Preview · Case study (draft) · PASTI CMS', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

interface Rec<C> { id: string; meta: Record<string, string>; status: PageStatus; content: C }
interface PreviewResponse {
  record: Rec<CaseStudyContent> & { version: number; updatedAt: string }
  project: Rec<ProjectContent> | null
}

const id = useRoute().params.id as string
const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData(`admin-work-case-preview-${id}`, () => cmsFetch<PreviewResponse>(`/api/admin/work/case-studies/${id}/preview`))
const legacy = buildLegacyWorkContent()

const resolved = computed(() => {
  const d = data.value
  if (!d?.project) return null
  const work = {
    hero: { eyebrow: '', headlineLine1: '-', headlineLine2: '-', lede: '', primaryCtaLabel: '', secondaryCtaLabel: '', secondaryCtaUrl: '' },
    projectIndex: { sectionLabel: '', items: [] },
    featuredCases: { ...legacy.cases, items: [{ id: 'preview', caseStudyId: d.record.id, sortOrder: 1, active: true }] },
    seo: { metaTitle: '', metaDescription: '', ogImage: '', canonicalUrl: '', noIndex: true }
  }
  return resolveWorkView(work, [d.project], [d.record])
})
const preview = computed<WorkPageContent | null>(() => {
  const r = resolved.value
  if (!r || !r.featuredCases.cases.length) return null
  return { ...legacy, cases: { ...legacy.cases, items: toWorkCaseViews(r.featuredCases.cases) } }
})
</script>

<template>
  <div class="min-h-screen bg-slateNavy">
    <div class="sticky top-0 z-[60] border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 tablet:px-8" role="note">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
        <strong>Draft preview — not public</strong>
        <span v-if="data">Case study · draft v{{ data.record.version }} · saved {{ fmtCmsTime(data.record.updatedAt) }} · status: {{ data.record.status }}</span>
        <span v-if="resolved?.counts.claimsWithheld || resolved?.counts.mediaWithheld" class="text-xs">
          Not shown (awaiting approval / hidden): {{ resolved.counts.claimsWithheld }} metric(s), {{ resolved.counts.mediaWithheld }} image(s)
        </span>
        <button type="button" class="ml-auto rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Reload draft</button>
      </div>
    </div>
    <p v-if="status === 'pending'" class="bg-paper p-8 text-sm" role="status">Loading draft…</p>
    <div v-else-if="error || (data && !data.project)" class="mx-auto max-w-xl bg-paper p-8" role="alert">
      <p class="font-semibold">Preview unavailable.</p>
      <p class="mt-1 text-sm text-navy-600">{{ data && !data.project ? 'The linked project does not exist.' : error?.statusCode === 403 ? 'Your role cannot preview this record.' : 'The draft could not be loaded.' }}</p>
      <a :href="`/admin/work/case-studies/${id}`" class="mt-3 inline-block text-sm font-semibold underline">Back to the editor</a>
    </div>
    <main v-else-if="preview">
      <AdminWorkPreviewScope :key="`${data?.record.version}-${data?.record.updatedAt}`" :content="preview">
        <WorkFeaturedCases />
      </AdminWorkPreviewScope>
    </main>
  </div>
</template>

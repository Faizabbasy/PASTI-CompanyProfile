<script setup lang="ts">
import type { PageStatus } from '#shared/cms/fields'
import type { CaseStudyContent } from '#shared/utils/caseStudySchema'
import type { ProjectContent } from '#shared/utils/projectSchema'
import { resolveWorkView, type WorkPageContent } from '#shared/utils/workPublic'

// Authenticated draft preview of ONE case study in the real Featured Case
// Studies section (ADMIN + EDITOR, noindex, no-store). Same public filter as
// the live page: only confirmed metrics / images are shown.
definePageMeta({ layout: false })
// Bilingual: which language record is being edited / previewed (?lang=, default Indonesian).
const lang = useEditorLang()
useHead({ title: 'Preview · Case study (draft) · PASTI CMS', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

interface Rec<C> { id: string; meta: Record<string, string>; status: PageStatus; content: C }
interface PreviewResponse {
  record: Rec<CaseStudyContent> & { version: number; updatedAt: string }
  project: Rec<ProjectContent> | null
}

const id = useRoute().params.id as string
const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData(`admin-work-case-preview-${id}-${lang}`, () => cmsFetch<PreviewResponse>(`/api/admin/work/case-studies/${id}/preview`, { query: { lang } }))
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
// Klik teks untuk edit: this case study's editor (name, client, year → its project).
provideWorkCmsMarks(lang, () => ({ projects: data.value?.project ? [data.value.project] : [], cases: data.value ? [data.value.record] : [] }))
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
        <strong>Preview draft — belum tampil di website</strong>
        <span v-if="data">Studi kasus · draft v{{ data.record.version }} · disimpan {{ fmtCmsTime(data.record.updatedAt) }} · status: {{ data.record.status }}</span>
        <span v-if="resolved?.counts.claimsWithheld || resolved?.counts.mediaWithheld" class="text-xs">
          Tidak ditampilkan (belum disetujui / disembunyikan): {{ resolved.counts.claimsWithheld }} angka, {{ resolved.counts.mediaWithheld }} gambar
        </span>
        <span class="text-xs">Arahkan kursor ke teks untuk melihat kolomnya, klik untuk langsung mengeditnya. Matikan tombol ✎ untuk mencoba halaman seperti biasa.</span>
        <span class="ml-auto inline-flex items-center gap-2"><AdminCmsPicker v-if="preview" /><button type="button" class="rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Muat ulang draft</button></span>
      </div>
    </div>
    <p v-if="status === 'pending'" class="bg-paper p-8 text-sm" role="status">Memuat draft…</p>
    <div v-else-if="error || (data && !data.project)" class="mx-auto max-w-xl bg-paper p-8" role="alert">
      <p class="font-semibold">Preview tidak tersedia.</p>
      <p class="mt-1 text-sm text-navy-600">{{ data && !data.project ? 'Proyek yang ditautkan tidak ada.' : error?.statusCode === 403 ? 'Role kamu tidak bisa membuka preview ini.' : 'Draft gagal dimuat.' }}</p>
      <a :href="`/admin/work/case-studies/${id}?lang=${lang}`" class="mt-3 inline-block text-sm font-semibold underline">Kembali ke editor</a>
    </div>
    <main v-else-if="preview">
      <AdminWorkPreviewScope :key="`${data?.record.version}-${data?.record.updatedAt}`" :content="preview">
        <WorkFeaturedCases />
      </AdminWorkPreviewScope>
    </main>
  </div>
</template>

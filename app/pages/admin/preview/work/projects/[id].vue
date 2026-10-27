<script setup lang="ts">
import type { PageStatus } from '#shared/cms/fields'
import type { ProjectContent } from '#shared/utils/projectSchema'
import { resolveWorkView, type WorkPageContent } from '#shared/utils/workPublic'

// Authenticated draft preview of ONE project card in the real Project Index
// (ADMIN + EDITOR, noindex, no-store).
definePageMeta({ layout: false })
// Bilingual: which language record is being edited / previewed (?lang=, default Indonesian).
const lang = useEditorLang()
useHead({ title: 'Preview · Project (draft) · PASTI CMS', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

interface PreviewResponse {
  record: { id: string; meta: Record<string, string>; status: PageStatus; version: number; updatedAt: string; content: ProjectContent }
}

const id = useRoute().params.id as string
const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData(`admin-work-project-preview-${id}-${lang}`, () => cmsFetch<PreviewResponse>(`/api/admin/work/projects/${id}/preview`, { query: { lang } }))
const legacy = buildLegacyWorkContent()

// Klik teks untuk edit: this project's editor.
provideWorkCmsMarks(lang, () => ({ projects: data.value ? [data.value.record] : [], cases: [] }))
const preview = computed<WorkPageContent | null>(() => {
  const d = data.value
  if (!d) return null
  const work = {
    hero: { eyebrow: '', headlineLine1: '-', headlineLine2: '-', lede: '', primaryCtaLabel: '', secondaryCtaLabel: '', secondaryCtaUrl: '' },
    projectIndex: { sectionLabel: legacy.index.sectionLabel, items: [{ id: 'preview', projectId: d.record.id, sortOrder: 1, active: true }] },
    featuredCases: { sectionLabel: '', titleLead: '', titleAccent: '', supportingCopy: '', items: [] },
    seo: { metaTitle: '', metaDescription: '', ogImage: '', canonicalUrl: '', noIndex: true }
  }
  const projects = toWorkProjectCards(resolveWorkView(work, [d.record], []).projectIndex.projects)
  return { ...legacy, index: { ...legacy.index, projects, groups: ['All', ...new Set(projects.map((p) => p.group))] } }
})
</script>

<template>
  <div class="min-h-screen bg-pureWhite">
    <div class="sticky top-0 z-[60] border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 tablet:px-8" role="note">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
        <strong>Preview draft — belum tampil di website</strong>
        <span v-if="data">Proyek · draft v{{ data.record.version }} · disimpan {{ fmtCmsTime(data.record.updatedAt) }} · status: {{ data.record.status }}</span>
        <span class="text-xs">Ditampilkan sendiri; tanda studi kasus muncul di /work hanya kalau studi kasusnya ikut ditampilkan.</span>
        <span class="text-xs">Arahkan kursor ke teks untuk melihat kolomnya, klik untuk langsung mengeditnya. Matikan tombol ✎ untuk mencoba halaman seperti biasa.</span>
        <span class="ml-auto inline-flex items-center gap-2"><AdminCmsPicker v-if="preview" /><button type="button" class="rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Muat ulang draft</button></span>
      </div>
    </div>
    <p v-if="status === 'pending'" class="p-8 text-sm" role="status">Memuat draft…</p>
    <div v-else-if="error" class="mx-auto max-w-xl p-8" role="alert">
      <p class="font-semibold">Preview tidak tersedia.</p>
      <p class="mt-1 text-sm text-navy-600">{{ error.statusCode === 403 ? 'Role kamu tidak bisa membuka preview ini.' : 'Draft gagal dimuat.' }}</p>
      <a :href="`/admin/work/projects/${id}?lang=${lang}`" class="mt-3 inline-block text-sm font-semibold underline">Kembali ke editor</a>
    </div>
    <main v-else-if="preview">
      <AdminWorkPreviewScope :key="`${data?.record.version}-${data?.record.updatedAt}`" :content="preview">
        <WorkProjectIndex />
      </AdminWorkPreviewScope>
    </main>
  </div>
</template>

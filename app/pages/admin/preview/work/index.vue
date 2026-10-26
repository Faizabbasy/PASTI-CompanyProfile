<script setup lang="ts">
import type { PageStatus } from '#shared/cms/fields'
import type { CaseStudyContent } from '#shared/utils/caseStudySchema'
import type { ProjectContent } from '#shared/utils/projectSchema'
import { resolveWorkView, type WorkPageContent } from '#shared/utils/workPublic'
import type { WorkContent } from '#shared/utils/workSchema'

// Authenticated draft preview of /work (ADMIN + EDITOR). Lives under /admin
// (session gate, no-store, noindex); data comes from /api/admin/work/preview,
// never from /api/public. The Work draft is joined with the DRAFTS of its
// projects / case studies through the same resolver and adapter the public
// page uses — so only confirmed claims and images show, exactly as they
// would once published — and rendered with the REAL Work sections.
definePageMeta({ layout: false })
useHead({ title: 'Preview · Work (draft) · PASTI CMS', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

interface Src<C> { id: string; meta: Record<string, string>; status: PageStatus; content: C }
interface PreviewResponse {
  work: { version: number; revision: number; status: PageStatus; updatedAt: string; content: WorkContent }
  projects: Src<ProjectContent>[]
  caseStudies: Src<CaseStudyContent>[]
}

const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData('admin-work-preview', () => cmsFetch<PreviewResponse>('/api/admin/work/preview'))
const legacy = buildLegacyWorkContent()

const resolved = computed(() => (data.value ? resolveWorkView(data.value.work.content, data.value.projects, data.value.caseStudies) : null))
const preview = computed<WorkPageContent | null>(() => {
  const d = data.value
  const r = resolved.value
  if (!d || !r) return null
  const { counts: _c, ...content } = r
  return adaptWorkCms(legacy, { version: d.work.version, content })
})
const mainRef = ref<HTMLElement | null>(null)
usePreviewJump(mainRef)
// Selected records that are not published yet (they would be missing live).
const notLive = computed(() => {
  const d = data.value
  if (!d) return 0
  const ids = new Set([...d.work.content.projectIndex.items.filter((i) => i.active).map((i) => i.projectId), ...d.work.content.featuredCases.items.filter((i) => i.active).map((i) => i.caseStudyId)])
  return [...d.projects, ...d.caseStudies].filter((r) => ids.has(r.id) && r.status !== 'published').length
})
</script>

<template>
  <div class="min-h-screen bg-pureWhite">
    <div class="sticky top-0 z-[60] border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 tablet:px-8" role="note">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
        <strong>Preview draft — belum tampil di website</strong>
        <span v-if="data">Work · draft v{{ data.work.version }} · disimpan {{ fmtCmsTime(data.work.updatedAt) }} · status: {{ data.work.status }}</span>
        <span v-if="notLive" class="text-xs">{{ notLive }} proyek/studi kasus terpilih belum di-publish</span>
        <span v-if="resolved?.counts.claimsWithheld || resolved?.counts.mediaWithheld" class="text-xs">
          Tidak ditampilkan (belum disetujui / disembunyikan): {{ resolved.counts.claimsWithheld }} angka, {{ resolved.counts.mediaWithheld }} gambar
        </span>
        <span v-if="preview?.source === 'legacy'" class="text-xs font-semibold">Tidak ada proyek yang bisa tampil — halaman publik akan tetap memakai konten bawaan.</span>
        <button type="button" class="ml-auto rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Muat ulang draft</button>
      </div>
    </div>

    <p v-if="status === 'pending'" class="p-8 text-sm" role="status">Memuat draft…</p>
    <div v-else-if="error" class="mx-auto max-w-xl p-8" role="alert">
      <p class="font-semibold">Preview tidak tersedia.</p>
      <p class="mt-1 text-sm text-navy-600">{{ error.statusCode === 403 ? 'Role kamu tidak bisa membuka preview ini.' : 'Draft gagal dimuat. Mungkin sesi login sudah habis.' }}</p>
      <a href="/admin/work" class="mt-3 inline-block text-sm font-semibold underline">Kembali ke editor</a>
    </div>

    <main v-else-if="preview" ref="mainRef">
      <AdminWorkPreviewScope :key="`${data?.work.version}-${data?.work.revision}-${data?.work.updatedAt}`" :content="preview">
        <WorkHero />
        <WorkProjectIndex />
        <WorkFeaturedCases />
      </AdminWorkPreviewScope>
    </main>
  </div>
</template>

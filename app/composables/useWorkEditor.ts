import { CaseStudyContentSchema, type CaseStudyContent } from '#shared/utils/caseStudySchema'
import { ProjectContentSchema, type ProjectContent } from '#shared/utils/projectSchema'
import { WorkContentSchema, type WorkContent } from '#shared/utils/workSchema'
import { keyed, unkeyed, zodFieldErrors, type Keyed } from './useSingletonEditor'

// Form state for the Work CMS editors (/admin/work, /admin/work/projects/:id,
// /admin/work/case-studies/:id). Editor logic: useSingletonEditor (record
// endpoints answer the same { state, revision } shape as a singleton page).

// ---- Work page ---------------------------------------------------------------

type ProjectPick = WorkContent['projectIndex']['items'][number]
type CasePick = WorkContent['featuredCases']['items'][number]

export type WorkForm = Omit<WorkContent, 'projectIndex' | 'featuredCases'> & {
  projectIndex: Omit<WorkContent['projectIndex'], 'items'> & { items: Keyed<ProjectPick>[] }
  featuredCases: Omit<WorkContent['featuredCases'], 'items'> & { items: Keyed<CasePick>[] }
}

// Editor sections in page order (AdminEditorFrame). `no` = position on
// /work; `previewIndex` = the section's index in the admin preview.
export const WORK_TABS = [
  { key: 'hero', no: '01', label: 'Hero', where: 'Bagian paling atas: label kecil (jumlah proyek di sebelahnya otomatis), judul dua baris, paragraf, dua tombol, dan tumpukan poster proyek di kanan yang membuka seperti kipas saat disorot.', sections: ['hero'], previewIndex: 0 },
  { key: 'projectIndex', no: '02', label: 'Daftar proyek', where: 'Bagian putih dengan tombol filter dan pilihan Grid / List: kartu poster proyek bernomor (01, 02 …) sesuai urutan di sini.', sections: ['projectIndex'], previewIndex: 1 },
  { key: 'featuredCases', no: '03', label: 'Studi kasus unggulan', where: 'Bagian biru tua: strip-strip gambar studi kasus di kiri; yang dipilih tampil sebagai “berkas” bab demi bab (tantangan, yang dibangun, hasil, angka) di kanan.', sections: ['featuredCases'], previewIndex: 2 },
  { key: 'seo', no: '', label: 'SEO', where: 'Judul & deskripsi yang muncul di Google dan saat link dibagikan. Tidak tampil di halaman.', sections: ['seo'] }
] as const

export function toWorkForm(c: WorkContent): WorkForm {
  const copy = JSON.parse(JSON.stringify(c)) as WorkContent
  return {
    ...copy,
    projectIndex: { ...copy.projectIndex, items: keyed(copy.projectIndex.items) },
    featuredCases: { ...copy.featuredCases, items: keyed(copy.featuredCases.items) }
  }
}

export function toWorkPayload(f: WorkForm) {
  return {
    ...f,
    projectIndex: { ...f.projectIndex, items: unkeyed(f.projectIndex.items) },
    featuredCases: { ...f.featuredCases, items: unkeyed(f.featuredCases.items) }
  }
}

export const validateWorkForm = (f: WorkForm) => zodFieldErrors(WorkContentSchema.safeParse(toWorkPayload(f)))

// ---- Project -----------------------------------------------------------------

export type ProjectForm = ProjectContent

// Project editor groups (AdminEditorFrame). Fields preview in the single
// project card of /admin/preview/work/projects/<id> (index 0).
export const PROJECT_TABS = [
  { key: 'identity', no: '01', label: 'Info dasar', where: 'Nama proyek tampil di kartu poster di /work (daftar proyek dan tumpukan poster di hero); kategori tampil kecil di kartu.', sections: ['name', 'slug', 'clientDisplayName', 'category', 'year'], previewIndex: 0 },
  { key: 'card', no: '02', label: 'Kartu & poster', where: 'Isi kartu proyek di /work: gambar poster (4:5), deskripsi singkat, dan tombol filter tempat proyek ini muncul.', sections: ['shortDescription', 'filterGroup', 'poster', 'posterAlt'], previewIndex: 0 },
  { key: 'relations', no: '03', label: 'Tampil di mana', where: 'Info saja: apakah proyek ini dipilih di halaman Work dan punya studi kasus. Urutan dan tampil/tidaknya diatur di Work → Work page.', sections: [] }
] as const

export const emptyProject = (): ProjectForm => ({
  name: '',
  slug: '',
  clientDisplayName: '',
  category: '',
  filterGroup: '',
  year: '',
  shortDescription: '',
  poster: '',
  posterAlt: ''
})
export const toProjectForm = (c: ProjectContent): ProjectForm => JSON.parse(JSON.stringify(c))
export const toProjectPayload = (f: ProjectForm) => ({ ...f })
export const validateProjectForm = (f: ProjectForm) => zodFieldErrors(ProjectContentSchema.safeParse(toProjectPayload(f)))

// ---- Case study --------------------------------------------------------------

type Metric = CaseStudyContent['metrics'][number]
type GalleryItem = CaseStudyContent['gallery'][number]

export type CaseStudyForm = Omit<CaseStudyContent, 'metrics' | 'gallery'> & {
  metrics: Keyed<Metric>[]
  gallery: Keyed<GalleryItem>[]
}

// Case study editor groups, in the order the case "dossier" reads on /work
// (AdminEditorFrame). All preview in the single case of
// /admin/preview/work/case-studies/<id> (index 0).
export const CASE_TABS = [
  { key: 'header', no: '01', label: 'Proyek & alamat', where: 'Studi kasus ini milik satu proyek (nama, klien, tahun dan poster diambil dari proyek itu). Tampil di bagian “Studi kasus unggulan” (biru tua) di /work.', sections: ['projectId', 'slug', 'categoryOverride'], previewIndex: 0 },
  { key: 'context', no: '02', label: 'Konteks', where: 'Paragraf pembuka di “sampul berkas” studi kasus (sisi kanan bagian biru tua di /work).', sections: ['context'], previewIndex: 0 },
  { key: 'challenge', no: '03', label: 'Tantangan', where: 'Bab “Challenge” di berkas studi kasus: daftar poin. Kosong = bab ini disembunyikan.', sections: ['challenge'], previewIndex: 0 },
  { key: 'approach', no: '04', label: 'Yang dibangun', where: 'Bab “What we built” (atau “What was requested”) di berkas studi kasus: daftar poin.', sections: ['approach'], previewIndex: 0 },
  { key: 'outcome', no: '05', label: 'Hasil', where: 'Bab hasil di berkas studi kasus: poin-poin hasil, lalu satu kalimat insight (opsional).', sections: ['outcome', 'insight'], previewIndex: 0 },
  { key: 'metrics', no: '06', label: 'Angka / metrik', where: 'Angka besar di berkas studi kasus (mis. “30% …”). Hanya angka berstatus Disetujui yang tampil di website.', sections: ['metrics'], previewIndex: 0 },
  { key: 'gallery', no: '07', label: 'Galeri gambar', where: 'Gambar di strip studi kasus (kiri) dan di galeri berkas. Gambar Disetujui yang pertama jadi gambar utama strip.', sections: ['gallery'], previewIndex: 0 },
  { key: 'delivery', no: '08', label: 'Durasi & teknologi', where: 'Bab terakhir berkas studi kasus: durasi pengerjaan per tahap dan label teknologi yang dipakai.', sections: ['timeline', 'technologyLabels'], previewIndex: 0 }
] as const

export const emptyCaseStudy = (projectId = ''): CaseStudyForm => ({
  projectId,
  slug: '',
  categoryOverride: '',
  context: { body: '' },
  challenge: { points: [] },
  approach: { mode: 'solution', points: [] },
  outcome: { points: [] },
  insight: '',
  timeline: { total: '', steps: [] },
  technologyLabels: [],
  metrics: [],
  gallery: []
})

export function toCaseStudyForm(c: CaseStudyContent): CaseStudyForm {
  const copy = JSON.parse(JSON.stringify(c)) as CaseStudyContent
  return { ...copy, metrics: keyed(copy.metrics), gallery: keyed(copy.gallery) }
}

export function toCaseStudyPayload(f: CaseStudyForm) {
  return {
    ...f,
    context: { ...f.context },
    challenge: { points: [...f.challenge.points] },
    approach: { mode: f.approach.mode, points: [...f.approach.points] },
    outcome: { points: [...f.outcome.points] },
    timeline: { total: f.timeline.total, steps: f.timeline.steps.map((s) => ({ ...s })) },
    technologyLabels: [...f.technologyLabels],
    metrics: unkeyed(f.metrics),
    gallery: unkeyed(f.gallery)
  }
}

export const validateCaseStudyForm = (f: CaseStudyForm) => zodFieldErrors(CaseStudyContentSchema.safeParse(toCaseStudyPayload(f)))

export const CLAIM_LABELS = {
  confirmed: { label: 'Disetujui', mark: '✓', cls: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  needs_approval: { label: 'Perlu persetujuan', mark: '!', cls: 'border-amber-300 bg-amber-50 text-amber-900' },
  hidden: { label: 'Disembunyikan', mark: '–', cls: 'border-gray-300 bg-gray-100 text-gray-700' }
} as const

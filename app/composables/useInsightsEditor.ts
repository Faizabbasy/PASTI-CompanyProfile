import {
  ArticleContentSchema,
  CategoryContentSchema,
  InsightsContentSchema,
  type ArticleContent,
  type CategoryContent,
  type InsightsContent
} from '#shared/utils/insightsSchema'
import { keyed, unkeyed, zodFieldErrors, type Keyed } from './useSingletonEditor'

// Form state for the Insights CMS editors (/admin/insights, articles,
// categories). Editor logic: useSingletonEditor (record endpoints answer the
// same { state, revision } shape as a singleton page).

// ---- Landing -----------------------------------------------------------------

type ArticlePick = InsightsContent['contents']['items'][number]
type FilterPick = InsightsContent['filters']['items'][number]
export type InsightsForm = Omit<InsightsContent, 'contents' | 'filters'> & {
  contents: Omit<InsightsContent['contents'], 'items'> & { items: Keyed<ArticlePick>[] }
  filters: { items: Keyed<FilterPick>[] }
}

// Editor sections in page order (AdminEditorFrame). `no` = position on
// /insights; `previewIndex` = the section's index in the admin preview.
export const INSIGHTS_TABS = [
  { key: 'hero', no: '01', label: 'Hero', where: 'Bagian paling atas: label kecil (dengan jumlah artikel & topik otomatis), kata besar “Insights.” yang hurufnya diisi gambar sampul artikel, paragraf, dan dua tombol.', sections: ['hero'], previewIndex: 0 },
  { key: 'contents', no: '02', label: 'Daftar artikel & topik', where: 'Daftar isi: tombol-tombol topik di atas (setelah “All”), lalu tiap artikel sebagai baris besar bernomor (01, 02 …). Disorot/diketuk → terbuka gambar & ringkasannya; diklik → artikel dibuka layar penuh.', sections: ['contents', 'filters'], previewIndex: 1 },
  { key: 'seo', no: '', label: 'SEO', where: 'Judul & deskripsi yang muncul di Google dan saat link dibagikan. Tidak tampil di halaman.', sections: ['seo'] }
] as const

export function toInsightsForm(c: InsightsContent): InsightsForm {
  const copy = JSON.parse(JSON.stringify(c)) as InsightsContent
  return { ...copy, contents: { ...copy.contents, items: keyed(copy.contents.items) }, filters: { items: keyed(copy.filters.items) } }
}
export function toInsightsPayload(f: InsightsForm) {
  return { ...f, contents: { ...f.contents, items: unkeyed(f.contents.items) }, filters: { items: unkeyed(f.filters.items) } }
}
export const validateInsightsForm = (f: InsightsForm) => zodFieldErrors(InsightsContentSchema.safeParse(toInsightsPayload(f)))

// ---- Article -----------------------------------------------------------------

export type ArticleForm = ArticleContent

// Article editor groups (AdminEditorFrame). `previewIndex` 0 = the article's
// row in the preview (the only section the article preview renders).
export const ARTICLE_TABS = [
  { key: 'header', no: '01', label: 'Judul & label', where: 'Bagian atas artikel, urut dari atas: topik (label kecil bertitik kuning), judul besar dengan bagian kuning, tagline, dan label kecil di pojok sampul. Judul besar juga jadi baris besar di daftar artikel /insights.', sections: ['categoryIds', 'headline', 'tagline', 'kicker'], previewIndex: 0 },
  { key: 'content', no: '02', label: 'Paragraf pembuka & poin', where: 'Paragraf bergaris kuning di bawah judul (juga teks pratinjau saat baris artikel disorot di daftar), lalu kotak bernomor “Dalam insight ini”.', sections: ['excerpt', 'points'], previewIndex: 0 },
  { key: 'media', no: '03', label: 'Gambar sampul', where: 'Poster di kiri pembaca artikel, di daftar artikel, dan di hero /insights (mengisi huruf “Insights.” dan tumpukan poster).', sections: ['coverImage', 'coverImageAlt', 'coverFocus'], previewIndex: 0 },
  { key: 'perspective', no: '04', label: 'Kutipan PASTI & link', where: 'Kutipan dengan tanda kutip kuning besar di bawah poin, lalu baris-baris link berpanah. Opsional.', sections: ['perspective'], previewIndex: 0 },
  { key: 'body', no: '05', label: 'Isi lengkap', where: 'Isi halaman artikel sendiri (/insights/<slug>): teks panjang, penulis dan tanggal. Begitu isinya ada, artikel punya halaman sendiri dan pembaca artikel menampilkan tombol kuning “Baca artikel lengkap”. Kosong = artikel hanya tampil di pembaca.', sections: ['body', 'authorName', 'publishDate'] },
  { key: 'settings', no: '06', label: 'Judul pendek & alamat', where: 'Tidak tampil sebagai teks besar: judul pendek dipakai di “Berikutnya”, “Sedang tampil” di hero /insights dan judul tab browser / Google untuk halaman artikel; slug = alamat artikel (/insights/<slug>).', sections: ['title', 'slug'], previewIndex: 0 },
  { key: 'relations', no: '', label: 'Pemakaian & hapus', where: 'Apakah artikel ini dipilih di halaman Insights, dan tombol hapus untuk draft yang belum pernah tayang.', sections: [] }
] as const

export const emptyArticle = (): ArticleForm => ({
  title: '',
  slug: '',
  kicker: '',
  categoryIds: [],
  headline: { text: '', accent: '' },
  tagline: { text: '', accent: '' },
  excerpt: '',
  points: [],
  coverImage: '',
  coverImageAlt: '',
  coverFocus: '70% 40%',
  perspective: { sourceRef: '', links: [] },
  authorName: '',
  publishDate: '',
  body: []
})
export const toArticleForm = (c: ArticleContent): ArticleForm => JSON.parse(JSON.stringify(c))
export const toArticlePayload = (f: ArticleForm): ArticleContent => JSON.parse(JSON.stringify(f))
export const validateArticleForm = (f: ArticleForm) => zodFieldErrors(ArticleContentSchema.safeParse(toArticlePayload(f)))

// ---- Category ----------------------------------------------------------------

export type CategoryForm = CategoryContent
export const CATEGORY_TABS = [
  {
    key: 'details',
    no: '01',
    label: 'Detail topik',
    where: 'Nama topik tampil sebagai tombol filter di atas daftar artikel /insights (kalau topik dipilih di halaman Insights) dan di label topik tiap artikel.',
    sections: ['name', 'slug', 'description', 'active'],
    previewIndex: 1
  }
] as const
export const emptyCategory = (): CategoryForm => ({ name: '', slug: '', description: '', active: true })
export const toCategoryForm = (c: CategoryContent): CategoryForm => ({ ...c })
export const toCategoryPayload = (f: CategoryForm) => ({ ...f })
export const validateCategoryForm = (f: CategoryForm) => zodFieldErrors(CategoryContentSchema.safeParse(toCategoryPayload(f)))

export const PERSPECTIVE_LABELS: Record<string, string> = {
  'technology:technology-development': 'Technology · Technology Development',
  'technology:custom-built-ai-solutions': 'Technology · Custom Built AI Solutions',
  'technology:enterprise-platforms': 'Technology · Enterprise Platforms',
  'technology:mobile-app-development-mvp': 'Technology · Mobile App Development & MVP',
  'technology:cybersecurity-compliance-architecture': 'Technology · Cybersecurity & Compliance Architecture',
  'technology:system-maintenance-sla-support': 'Technology · System Maintenance & SLA Support',
  'creative:creative-communication': 'Creative · Creative Communication',
  'creative:integrated-campaign-strategy': 'Creative · Integrated Campaign Strategy',
  'creative:social-media-playbooks-management': 'Creative · Social Media Playbooks & Management',
  'creative:vertical-video-development': 'Creative · Vertical Video Development',
  'creative:production-house-services': 'Creative · Production House Services',
  'creative:brand-identity-ui-ux-design': 'Creative · Brand Identity & UI/UX Design',
  'company:vision': 'Company · Vision',
  'company:founder-quote': 'Company · Founder quote'
}

export const slugFrom = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')

import { AboutContentSchema, type AboutAdminState, type AboutContent } from '#shared/utils/aboutSchema'
import { keyed, unkeyed, zodFieldErrors, tabForPathIn, type Keyed } from './useSingletonEditor'

// Form state for /admin/pages/about (editor logic: useSingletonEditor).
export type AboutForm = Omit<AboutContent, 'values' | 'milestones' | 'proof' | 'leadership' | 'mission'> & {
  mission: Omit<AboutContent['mission'], 'points'> & { points: Keyed<AboutContent['mission']['points'][number]>[] }
  values: Keyed<AboutContent['values'][number]>[]
  milestones: Keyed<AboutContent['milestones'][number]>[]
  proof: Keyed<AboutContent['proof'][number]>[]
  leadership: Keyed<AboutContent['leadership'][number]>[]
}

export interface AboutStateResponse {
  state: AboutAdminState
  revision: number
  changedSections?: string[]
}

// Editor sections in page order (AdminEditorFrame). `no` = position on
// /about; `previewIndex` = the section's index in the admin preview.
export const ABOUT_TABS = [
  { key: 'hero', no: '01', label: 'Hero', where: 'Bagian paling atas: label kecil, judul animasi “We turn complexity into certainty.” (dikunci di kode), dan dua tombol.', sections: ['hero'], previewIndex: 0 },
  { key: 'story', no: '02', label: 'Cerita perusahaan', where: 'Paragraf besar yang muncul kata demi kata saat di-scroll, lalu paragraf lanjutan di samping fakta perusahaan, lalu lima langkah cara kerja.', sections: ['story'], previewIndex: 1 },
  { key: 'vm', no: '03', label: 'Visi & Misi', where: 'Bagian biru tua: Visi tampil besar, Misi sebagai paragraf pendukung, dipisah garis kuning.', sections: ['vision', 'mission'], previewIndex: 2 },
  { key: 'values', no: '04', label: 'Standar PASTI', where: 'Bagian “What we stand for”: standar-standar PASTI dengan penjelasan singkat.', sections: ['values'], previewIndex: 3 },
  { key: 'milestones', no: '05', label: 'Perjalanan', where: 'Garis waktu tahun-tahun perjalanan PASTI — horizontal di desktop (menyala saat di-scroll), vertikal di HP.', sections: ['milestones'], previewIndex: 4 },
  { key: 'leadership', no: '06', label: 'Kepemimpinan', where: 'Profil pemimpin: foto besar, nama, jabatan, dan kutipan.', sections: ['leadership'], previewIndex: 5 },
  { key: 'proof', no: '08', label: 'Angka bukti', where: 'Angka-angka yang menghitung naik di samping diagram “Technology × Creative” (dua lingkaran kuning-biru).', sections: ['proof'], previewIndex: 6 },
  { key: 'cta', no: '', label: 'Ajakan (tidak tampil)', where: 'Tidak tampil di website — halaman About memakai ajakan di footer (Shared Content → Global CTAs).', sections: ['cta'], previewIndex: 7 },
  { key: 'seo', no: '', label: 'SEO', where: 'Judul & deskripsi yang muncul di Google dan saat link dibagikan. Tidak tampil di halaman.', sections: ['seo'] }
] as const
export type AboutTabKey = (typeof ABOUT_TABS)[number]['key']

export function toAboutForm(c: AboutContent): AboutForm {
  // JSON round-trip, not structuredClone: `c` is often a reactive proxy
  // (useAsyncData), which structuredClone refuses. Content is plain JSON.
  const copy = JSON.parse(JSON.stringify(c)) as AboutContent
  return {
    ...copy,
    mission: { ...copy.mission, points: keyed(copy.mission.points) },
    values: keyed(copy.values),
    milestones: keyed(copy.milestones),
    proof: keyed(copy.proof),
    leadership: keyed(copy.leadership)
  }
}

export function toAboutPayload(f: AboutForm) {
  return {
    ...f,
    story: { ...f.story, paragraphs: [...f.story.paragraphs] },
    mission: { ...f.mission, points: unkeyed(f.mission.points) },
    values: unkeyed(f.values),
    milestones: unkeyed(f.milestones),
    proof: unkeyed(f.proof),
    leadership: unkeyed(f.leadership)
  }
}

// Same schema the server enforces; returns { 'hero.headline': 'Required.' }.
export function validateAboutForm(f: AboutForm): Record<string, string> {
  return zodFieldErrors(AboutContentSchema.safeParse(toAboutPayload(f)))
}

export function tabForPath(path: string): AboutTabKey | null {
  return tabForPathIn(ABOUT_TABS, path) as AboutTabKey | null
}

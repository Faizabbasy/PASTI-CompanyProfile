import { TechnologyContentSchema, type TechnologyContent } from '#shared/utils/technologySchema'
import { keyed, unkeyed, zodFieldErrors, type Keyed } from './useSingletonEditor'

// Form state for /admin/pages/technology (editor logic: useSingletonEditor).
// Keywords and related links are plain sub-lists inside a capability.

type Capability = TechnologyContent['capabilities']['items'][number]
type WorkItem = TechnologyContent['work']['items'][number]

export type TechnologyForm = Omit<TechnologyContent, 'capabilities' | 'work'> & {
  capabilities: Omit<TechnologyContent['capabilities'], 'items'> & { items: Keyed<Capability>[] }
  work: Omit<TechnologyContent['work'], 'items'> & { items: Keyed<WorkItem>[] }
}

// Editor sections in page order (AdminEditorFrame). `no` = position on
// /technology; `previewIndex` = the section's index in the admin preview.
export const TECHNOLOGY_TABS = [
  { key: 'hero', no: '01', label: 'Hero', where: 'Bagian paling atas berlatar biru tua: label kecil, judul tiga baris (baris ke-3 di atas penanda kuning), paragraf, dua tombol, dan kartu konsol yang mengetik nama layanan.', sections: ['hero'], previewIndex: 0 },
  { key: 'capabilities', no: '03', label: 'Kemampuan', where: 'Daftar kemampuan bernomor (01, 02 …). Di desktop, baris yang disorot berubah biru tua dan gambar mengikuti kursor; di HP tiap baris bisa dibuka seperti akordeon. Pita teks berjalan di atasnya (bagian 02) memakai judul-judul kemampuan ini.', sections: ['capabilities'], previewIndex: 2 },
  { key: 'work', no: '05', label: 'Studi kasus', where: 'Deretan kartu poster proyek yang bergeser ke samping saat di-scroll (di HP bisa digeser dengan jari).', sections: ['work'], previewIndex: 4 },
  { key: 'seo', no: '', label: 'SEO', where: 'Judul & deskripsi yang muncul di Google dan saat link dibagikan. Tidak tampil di halaman.', sections: ['seo'] }
] as const

export function toTechnologyForm(c: TechnologyContent): TechnologyForm {
  // JSON round-trip: `c` is often a reactive proxy (useAsyncData).
  const copy = JSON.parse(JSON.stringify(c)) as TechnologyContent
  return {
    ...copy,
    capabilities: { ...copy.capabilities, items: keyed(copy.capabilities.items) },
    work: { ...copy.work, items: keyed(copy.work.items) }
  }
}

export function toTechnologyPayload(f: TechnologyForm) {
  return {
    ...f,
    capabilities: {
      ...f.capabilities,
      items: unkeyed(f.capabilities.items).map((i) => ({ ...i, keywords: [...i.keywords], related: i.related.map((r) => ({ ...r })) }))
    },
    work: { ...f.work, items: unkeyed(f.work.items) }
  }
}

export function validateTechnologyForm(f: TechnologyForm): Record<string, string> {
  return zodFieldErrors(TechnologyContentSchema.safeParse(toTechnologyPayload(f)))
}

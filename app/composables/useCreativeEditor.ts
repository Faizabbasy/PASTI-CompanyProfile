import { CreativeContentSchema, type CreativeContent } from '#shared/utils/creativeSchema'
import { keyed, unkeyed, zodFieldErrors, type Keyed } from './useSingletonEditor'

// Form state for /admin/pages/creative (editor logic: useSingletonEditor).
// Keywords, related links, challenge/playbook points and the Why PASTI picks
// are plain sub-lists; services, wall visuals and UI/UX picks are id lists.

type Service = CreativeContent['services']['items'][number]
type Visual = CreativeContent['wall']['visuals'][number]
type Uiux = CreativeContent['work']['uiux']['items'][number]

export type CreativeForm = Omit<CreativeContent, 'services' | 'wall' | 'work'> & {
  services: Omit<CreativeContent['services'], 'items'> & { items: Keyed<Service>[] }
  wall: Omit<CreativeContent['wall'], 'visuals'> & { visuals: Keyed<Visual>[] }
  work: Omit<CreativeContent['work'], 'uiux'> & { uiux: Omit<CreativeContent['work']['uiux'], 'items'> & { items: Keyed<Uiux>[] } }
}

// Editor sections in page order (AdminEditorFrame). `no` = position on
// /creative; `previewIndex` = the section's index in the admin preview.
export const CREATIVE_TABS = [
  { key: 'hero', no: '01', label: 'Hero', where: 'Bagian paling atas berlatar kuning: label kecil, judul dua baris (kata terakhir bergaris tepi), paragraf, dua tombol, dan kipas tiga gambar karya. Saat kursor digerakkan muncul jejak gambar.', sections: ['hero'], previewIndex: 0 },
  { key: 'services', no: '03', label: 'Layanan', where: 'Daftar layanan bernomor di kiri (menempel saat di-scroll di desktop) dengan kartu gambar besar di kanan; di HP kartunya bertumpuk. Pita berjalan di atasnya (bagian 02) memakai judul layanan ini.', sections: ['services'], previewIndex: 2 },
  { key: 'wall', no: '04', label: 'Studio Wall', where: 'Papan gambar karya yang bisa digeser ke segala arah (drag), dengan judul yang bagian akhirnya berwarna kuning.', sections: ['wall'], previewIndex: 3 },
  { key: 'work', no: '05', label: 'Karya pilihan', where: 'Studi kasus utama (tantangan, rencana, funnel 4 tahap, playbook), lalu kampanye + testimoni, lalu deretan proyek UI/UX.', sections: ['work'], previewIndex: 4 },
  { key: 'why', no: '06', label: 'Kenapa PASTI', where: 'Pernyataan perusahaan (misi atau visi), standar PASTI, dan garis waktu perjalanan perusahaan.', sections: ['why'], previewIndex: 5 },
  { key: 'seo', no: '', label: 'SEO', where: 'Judul & deskripsi yang muncul di Google dan saat link dibagikan. Tidak tampil di halaman.', sections: ['seo'] }
] as const

export function toCreativeForm(c: CreativeContent): CreativeForm {
  // JSON round-trip: `c` is often a reactive proxy (useAsyncData).
  const copy = JSON.parse(JSON.stringify(c)) as CreativeContent
  return {
    ...copy,
    services: { ...copy.services, items: keyed(copy.services.items) },
    wall: { ...copy.wall, visuals: keyed(copy.wall.visuals) },
    work: { ...copy.work, uiux: { ...copy.work.uiux, items: keyed(copy.work.uiux.items) } }
  }
}

export function toCreativePayload(f: CreativeForm) {
  const w = f.work
  return {
    ...f,
    services: {
      ...f.services,
      items: unkeyed(f.services.items).map((i) => ({ ...i, keywords: [...i.keywords], related: i.related.map((r) => ({ ...r })) }))
    },
    wall: { ...f.wall, visuals: unkeyed(f.wall.visuals) },
    work: {
      ...w,
      feature: { ...w.feature, challenge: [...w.feature.challenge], funnel: w.feature.funnel.map((s) => ({ ...s })), playbook: [...w.feature.playbook] },
      uiux: { ...w.uiux, items: unkeyed(w.uiux.items) }
    },
    why: { ...f.why, standardRefs: [...f.why.standardRefs], milestoneRefs: [...f.why.milestoneRefs] }
  }
}

export function validateCreativeForm(f: CreativeForm): Record<string, string> {
  return zodFieldErrors(CreativeContentSchema.safeParse(toCreativePayload(f)))
}

import type { SingletonAdminState } from '#shared/cms/fields'
import { area, group, image, items, lb, productContentSchema, productSeoSchema, strs, t, tuple, type ProductContent, type ProductTab, type SectionMap } from '#shared/cms/productFields'

// SHIFTLY product page (/shiftly) — field map on the shared product-page
// toolkit (shared/cms/productFields.ts). Content groups mirror useShiftly().
//
// Editable: section headings and copy, every card/list text, the comparison
// table wording, the hero screenshots, SEO. Stays in code (owner: small UI
// text isn't worth editing): the hero headline and buttons, section labels,
// module "standard" flags, icon/id wiring, the comparison icon logic, the
// branding mock-up, the demo form, and the commercial (pricing) data, which
// is never rendered. List counts are fixed: the layouts index them.

const CARD = lb(32, 130, 'Judul', 'Deskripsi', 'name')

const headingFields = (eyebrowMax: number, headlineMax: number, bodyMax: number) => ({
  eyebrow: t('Teks kecil di atas judul', eyebrowMax),
  headline: area('Judul besar', headlineMax, 'Tampil sangat besar. Titik kuning di akhir ditambahkan otomatis.'),
  body: area('Paragraf di bawah judul', bodyMax)
})

export const SHIFTLY_SECTIONS = {
  hero: group('Hero', {
    eyebrow: t('Label kecil di atas judul', 40),
    body: area('Paragraf di bawah judul', 160),
    pillars: strs('Empat tombol kecil (2×2)', 4, 26, 'Tombol', 'Urutannya tetap: 1 → Modules, 2 → Enterprise, 3 → tampilan mobile, 4 → Platform.'),
    dashboard: group('Screenshot dashboard (web)', { src: image('Gambar', '929/442', 'Screenshot layar lebar, rasio ±2:1 (929×442).'), alt: area('Deskripsi gambar (untuk pembaca layar)', 200) }),
    mobile: group('Screenshot aplikasi mobile', { src: image('Gambar', '262/576', 'Screenshot HP tegak, rasio ±1:2,2 (262×576).'), alt: area('Deskripsi gambar (untuk pembaca layar)', 200) })
  }),
  platform: group('Platform', {
    ...headingFields(40, 60, 200),
    layers: items('Empat lapisan (kiri)', 4, { name: t('Nama lapisan', 12, { hint: 'Satu kata pendek — kolomnya sempit.' }), body: area('Keterangan', 70) }),
    capabilities: items('Enam kartu kemampuan', 6, CARD, 'Kartu yang menyala saat lapisan dipilih diatur di kode.')
  }),
  moduleGroups: tuple('Grup modul (4 tab)', [
    group('Tab 1', { label: t('Nama tab', 28), modules: items('Modul', 5, { name: t('Nama modul', 26), body: area('Keterangan', 100) }) }),
    group('Tab 2', { label: t('Nama tab', 28), modules: items('Modul', 3, { name: t('Nama modul', 26), body: area('Keterangan', 100) }) }),
    group('Tab 3', { label: t('Nama tab', 28), modules: items('Modul', 6, { name: t('Nama modul', 26), body: area('Keterangan', 100) }) }),
    group('Tab 4', { label: t('Nama tab', 28), modules: items('Modul', 3, { name: t('Nama modul', 26), body: area('Keterangan', 100) }) })
  ], 'Label “In SHIFTLY Standard / Additional module” tiap modul diatur di kode.'),
  modulesMore: t('Kalimat kecil di kanan atas daftar modul', 90),
  plans: group('Standard vs Enterprise', {
    ...headingFields(60, 60, 260),
    expansion: strs('Daftar layanan enterprise (kotak biru tua)', 6, 36),
    expansionNote: area('Catatan di kotak biru tua', 110),
    why: area('Kalimat penutup (setelah “Why it matters —”)', 140)
  }),
  compare: items('Baris tabel perbandingan', 14, {
    capability: t('Kemampuan', 36),
    standard: group('Kolom Standard', { label: t('Isi', 32) }),
    enterprise: group('Kolom Enterprise', { label: t('Isi', 32, { hint: 'Tulis — (strip) kalau tidak ada. Ikon di tiap sel diatur di kode.' }) })
  }),
  devices: group('Perangkat (IoT)', {
    ...headingFields(40, 50, 200),
    items: items('Empat perangkat', 4, { name: t('Nama perangkat', 26), body: area('Keterangan', 150) }, 'Ikon tiap perangkat diatur di kode.'),
    note: t('Catatan kecil', 60),
    benefits: items('Empat manfaat', 4, lb(22, 120, 'Judul', 'Deskripsi', 'name'))
  }),
  branding: group('Branding suite', {
    ...headingFields(40, 40, 230),
    features: items('Lima fitur branding', 5, lb(24, 90, 'Judul', 'Deskripsi', 'name')),
    tagline: t('Kalimat penutup tebal', 60)
  }),
  why: group('Kenapa SHIFTLY', {
    ...headingFields(40, 60, 220),
    items: items('Delapan kartu keunggulan', 8, lb(26, 100, 'Judul', 'Deskripsi', 'name')),
    statement: group('Pernyataan penutup', { title: t('Judul', 50), body: area('Paragraf', 130) })
  }),
  architecture: group('Arsitektur & integrasi', {
    ...headingFields(40, 60, 200),
    nodes: items('Empat kotak di sekitar SHIFTLY', 4, { name: t('Nama', 20), body: area('Keterangan', 90) }, 'Ikon tiap kotak diatur di kode.'),
    deployment: items('Dua pilihan deployment', 2, lb(26, 60, 'Judul', 'Deskripsi', 'name'))
  }),
  pricing: group('Harga', {
    eyebrow: t('Teks kecil di atas judul', 30),
    headline: area('Judul besar', 64, 'Tampil sangat besar. Titik kuning di akhir ditambahkan otomatis.'),
    plans: tuple('Dua paket', [
      group('Paket 1 (kartu putih)', { name: t('Nama paket', 28), body: area('Deskripsi', 160), points: strs('Poin (centang)', 3, 40, 'Poin') }),
      group('Paket 2 (kartu biru tua)', { name: t('Nama paket', 28), body: area('Deskripsi', 160), points: strs('Poin (plus)', 4, 44, 'Poin') })
    ])
  }),
  demo: group('Form demo', {
    headline: area('Judul besar', 50, 'Titik kuning di akhir ditambahkan otomatis.'),
    body: area('Paragraf', 160),
    challenges: strs('Pilihan “HR challenge”', 8, 36, 'Pilihan')
  })
} satisfies SectionMap

export type ShiftlySectionKey = keyof typeof SHIFTLY_SECTIONS

export const SHIFTLY_TABS: readonly ProductTab[] = [
  { key: 'hero', no: '01', label: 'Hero', where: 'Bagian paling atas berlatar biru tua: judul “Everything HR, Simplified.”, paragraf, empat tombol kecil, dan screenshot dashboard / aplikasi.', sections: ['hero'], previewIndex: 0 },
  { key: 'platform', no: '02', label: 'Platform', where: 'Judul “An Enterprise Workforce Operating Platform.”, empat lapisan di kiri, dan enam kartu kemampuan.', sections: ['platform'], previewIndex: 1 },
  { key: 'modules', no: '03', label: 'Modul', where: 'Bagian biru tua dengan empat tab grup modul; klik modul untuk melihat namanya tampil besar di panel kanan.', sections: ['moduleGroups', 'modulesMore'], previewIndex: 2 },
  { key: 'plans', no: '04', label: 'Standard vs Enterprise', where: 'Judul “Start with the essentials…”, kotak biru tua layanan enterprise, dan tabel perbandingan Standard vs Enterprise.', sections: ['plans', 'compare'], previewIndex: 3 },
  { key: 'devices', no: '05', label: 'Perangkat', where: 'Bagian biru tua: daftar perangkat (fingerprint, face recognition…) dengan garis ke SHIFTLY, lalu empat manfaat.', sections: ['devices'], previewIndex: 4 },
  { key: 'branding', no: '06', label: 'Branding', where: 'Judul “Enterprise Branding Suite.”, daftar fitur di kiri dan contoh tampilan aplikasi di kanan.', sections: ['branding'], previewIndex: 5 },
  { key: 'why', no: '07', label: 'Kenapa SHIFTLY', where: 'Delapan kartu keunggulan bernomor (kartu pertama & terakhir biru tua), lalu pernyataan penutup.', sections: ['why'], previewIndex: 6 },
  { key: 'architecture', no: '08', label: 'Arsitektur', where: 'Bagian biru tua: kartu SHIFTLY di tengah, empat kotak di kiri-kanan, dan dua pilihan deployment di bawah.', sections: ['architecture'], previewIndex: 7 },
  { key: 'pricing', no: '09', label: 'Harga', where: 'Dua kartu paket (putih & biru tua) dengan tombol “Request Pricing”. Harga tidak ditampilkan.', sections: ['pricing'], previewIndex: 8 },
  { key: 'demo', no: '10', label: 'Form demo', where: 'Bagian terakhir: judul ajakan dan form “Request a demo”.', sections: ['demo'], previewIndex: 9 },
  { key: 'seo', no: '', label: 'SEO', where: 'Judul & deskripsi yang muncul di Google dan saat link dibagikan. Tidak tampil di halaman.', sections: ['seo'] }
]

export const SHIFTLY_SEO_DESCRIPTION_MAX = 200
export type ShiftlyContent = ProductContent<ShiftlySectionKey>
export type ShiftlyAdminState = SingletonAdminState<'shiftly', ShiftlyContent>
const shiftlyContentSchema = productContentSchema<ShiftlyContent>(SHIFTLY_SECTIONS, productSeoSchema(SHIFTLY_SEO_DESCRIPTION_MAX))
export const ShiftlyContentSchema = shiftlyContentSchema

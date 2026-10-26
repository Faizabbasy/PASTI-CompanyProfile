import type { SingletonAdminState } from '#shared/cms/fields'
import { area, group, items, lb, productContentSchema, productSeoSchema, strs, t, tuple, type ProductContent, type ProductTab, type SectionMap } from '#shared/cms/productFields'

// FAST product page (/fast) — field map on the shared product-page toolkit
// (shared/cms/productFields.ts). Content groups mirror useFast().
//
// Editable: section eyebrows, headlines and ledes, every card/list text
// (conditions, delivery steps, flow stations, board steps and features, the
// rendered constraint catalogue, readiness pillars, scenarios, views,
// integration chain, enterprise cards), the "Why FAST" chips, the demo copy
// and its challenge options, SEO. Stays in code (owner: small UI text isn't
// worth editing): the hero wordmark, full name, h1 and buttons, the sub-nav,
// the capability register and the unrendered (COMING SOON) constraints,
// all Gantt / sample / illustration data (orders, feed, plan-vs-actual,
// KPI and report labels, readiness states, severity names, scenario
// statuses — the code matches on several of them), view ids, the
// hard/soft names and scope buttons, and the demo form fields. List counts
// are fixed: the layouts index them (9-station line, 7-column grid, 4-beat
// board …).

const HEADLINE_HINT = 'Tampil sangat besar, kata per kata. Titik kuning di akhir ditambahkan otomatis — tidak perlu menulis titik.'

const heading = (eyebrowMax: number, headlineMax: number, ledeMax?: number) => ({
  eyebrow: t('Teks kecil di atas judul', eyebrowMax),
  headline: area('Judul besar', headlineMax, HEADLINE_HINT),
  ...(ledeMax ? { lede: area('Paragraf di bawah judul', ledeMax) } : {})
})

export const FAST_SECTIONS = {
  hero: group('Hero', {
    body: area('Paragraf di bawah judul', 260),
    facts: strs('Tiga label bulat di bawah tombol', 3, 32, 'Label')
  }),
  complexity: group('Kenapa penjadwalan rumit', {
    ...heading(30, 60, 160),
    factors: items('13 kotak kondisi', 13, {
      name: t('Nama kondisi', 26, { hint: 'Juga tampil sangat besar di pita teks berjalan di bawahnya — buat singkat.' }),
      body: area('Keterangan', 75)
    }, 'Angka “13 conditions” di kanan atas dihitung otomatis.')
  }),
  framework: group('Framework Code Product', {
    ...heading(30, 80),
    body: area('Paragraf (kiri)', 300),
    not: strs('Daftar “bukan …” (tanda ✕)', 4, 48),
    adapt: strs('Kotak kuning: yang disesuaikan per organisasi', 13, 34),
    core: strs('Kotak biru tua: inti produk', 6, 32),
    steps: items('Enam langkah delivery', 6, lb(14, 90, 'Nama langkah', 'Keterangan', 'name'))
  }),
  flow: group('Cara kerja FAST', {
    ...heading(30, 60, 170),
    steps: items('Sembilan titik alur', 9, lb(26, 100, 'Nama titik', 'Keterangan', 'name'), 'Kalimat “09 → 04 · the loop…” di bawah diatur di kode.')
  }),
  board: group('Scheduling Board', {
    ...heading(30, 50, 180),
    steps: items('Empat tahap board', 4, lb(14, 130, 'Nama tahap', 'Keterangan', 'name'), 'Urutannya tetap: Queue → Schedule → Validate → Adjust (mengikuti animasi board).'),
    features: strs('Sepuluh fitur (daftar di bawah board)', 10, 48, 'Fitur')
  }),
  constraints: group('Constraint-aware scheduling', {
    ...heading(36, 60, 200),
    modes: tuple('Penjelasan tombol Hard / Soft', [
      group('Saat “Hard” dipilih', { body: area('Penjelasan', 130) }),
      group('Saat “Soft” dipilih', { body: area('Penjelasan', 130) })
    ]),
    catalog: items('13 aturan di katalog', 13, lb(36, 75, 'Nama aturan', 'Keterangan', 'name'), 'Angka “13 rules” dihitung otomatis.'),
    advanced: group('Advanced production logic', {
      title: t('Judul', 40, { hint: 'Titik kuning di akhir ditambahkan otomatis.' }),
      body: area('Paragraf', 140),
      items: items('Empat kartu', 4, lb(36, 120, 'Judul', 'Keterangan', 'name'))
    })
  }),
  readiness: group('Production readiness', {
    ...heading(30, 50, 160),
    pillars: items('Tiga kartu (Material, Capacity, Workforce)', 3, {
      name: t('Judul kartu', 14, { hint: 'Satu kata, tampil besar. Titik kuning ditambahkan otomatis.' }),
      body: area('Keterangan', 110),
      items: strs('Daftar poin', 6, 48, 'Poin')
    }, 'Empat tombol status (Fully available …) di atas kartu diatur di kode.')
  }),
  scenarios: group('Simulasi skenario', {
    ...heading(40, 60, 160),
    list: items('Empat skenario (tombol kiri)', 4, lb(22, 70, 'Nama skenario', 'Keterangan', 'name'), 'Label status (Active / Draft / Simulation) dan grafik diatur di kode.'),
    objectives: strs('Tujuan skenario (label bulat)', 6, 36, 'Tujuan')
  }),
  execution: group('Plan vs actual · Exception Center', {
    ...heading(40, 80, 220),
    categories: strs('Kategori exception (label bulat di bawah)', 9, 30, 'Kategori')
  }),
  visibility: group('Management visibility', {
    ...heading(30, 60, 140),
    views: items('Empat tampilan (tombol kiri)', 4, lb(28, 170, 'Nama tampilan', 'Keterangan', 'name'), 'Isi gambar di panel kanan diatur di kode; urutan tampilannya tetap.')
  }),
  integration: group('Integrasi & enterprise', {
    ...heading(46, 60),
    body: area('Paragraf (kanan judul)', 240),
    chain: items('Tiga kotak alur data', 3, lb(26, 50, 'Nama', 'Keterangan', 'name'), 'Kotak ke-3 (putih) adalah FAST.'),
    note: area('Catatan kecil di bawah alur', 140),
    enterprise: items('Enam kartu enterprise', 6, lb(24, 80, 'Judul', 'Keterangan', 'name'))
  }),
  why: strs('Label “Why FAST” (di atas form)', 12, 34, 'Label'),
  demo: group('Form demo', {
    ...heading(30, 80),
    body: area('Paragraf di bawah judul', 200),
    challenges: strs('Pilihan “Planning challenge”', 7, 40, 'Pilihan', 'Pilihan terakhir sebaiknya tetap “Other”.')
  })
} satisfies SectionMap

export type FastSectionKey = keyof typeof FAST_SECTIONS

// Numbers match the section marks on the page ("FAST · 02 / 12" …).
export const FAST_TABS: readonly ProductTab[] = [
  { key: 'hero', no: '01', label: 'Hero', where: 'Bagian paling atas berlatar biru tua: tulisan FAST, judul “Your Production. Your Rules.”, paragraf, tiga label bulat, dan contoh scheduling board di kanan.', sections: ['hero'], previewIndex: 0 },
  { key: 'complexity', no: '02', label: 'Kenapa rumit', where: 'Judul “Why production scheduling gets complex.”, grid 13 kotak kondisi, lalu pita teks besar yang berjalan berisi nama-nama kondisi.', sections: ['complexity'], previewIndex: 1 },
  { key: 'framework', no: '03', label: 'Framework', where: 'Paragraf dan daftar “Not …” di kiri, kotak kuning (disesuaikan) di atas kotak biru tua (inti produk) di kanan, lalu enam langkah delivery.', sections: ['framework'], previewIndex: 3 },
  { key: 'flow', no: '04', label: 'Cara kerja', where: 'Bagian biru tua: sembilan titik bernomor di satu garis yang terisi kuning saat di-scroll.', sections: ['flow'], previewIndex: 4 },
  { key: 'board', no: '05', label: 'Scheduling Board', where: 'Empat tahap di kiri dan scheduling board interaktif di kanan, lalu daftar sepuluh fitur di bawahnya.', sections: ['board'], previewIndex: 5 },
  { key: 'constraints', no: '06', label: 'Constraints', where: 'Kotak biru tua dengan tombol Hard / Soft, katalog 13 aturan di kanan, lalu “Advanced production logic” dengan empat kartu.', sections: ['constraints'], previewIndex: 6 },
  { key: 'readiness', no: '07', label: 'Readiness', where: 'Judul, meteran status material di kanan, lalu tiga kartu: Material (biru tua), Capacity, Workforce.', sections: ['readiness'], previewIndex: 7 },
  { key: 'scenarios', no: '08', label: 'Skenario', where: 'Bagian biru tua: empat tombol skenario di kiri, grafik perbandingan di kanan, lalu label-label tujuan skenario.', sections: ['scenarios'], previewIndex: 8 },
  { key: 'execution', no: '09', label: 'Plan vs actual', where: 'Papan plan vs actual di kiri, Exception Center biru tua di kanan, lalu label kategori exception.', sections: ['execution'], previewIndex: 9 },
  { key: 'visibility', no: '10', label: 'Visibility', where: 'Empat tombol tampilan di kiri (Executive, Capacity, Scenario, Reports) dan gambar tampilannya di kanan.', sections: ['visibility'], previewIndex: 10 },
  { key: 'integration', no: '11', label: 'Integrasi', where: 'Bagian biru tua: tiga kotak alur data (ERP → staging → FAST), catatan kecil, lalu enam kartu enterprise.', sections: ['integration'], previewIndex: 11 },
  { key: 'demo', no: '12', label: 'Why FAST & demo', where: 'Bagian terakhir: label-label “Why FAST”, judul ajakan, dan form “Request a demo”.', sections: ['why', 'demo'], previewIndex: 12 },
  { key: 'seo', no: '', label: 'SEO', where: 'Judul & deskripsi yang muncul di Google dan saat link dibagikan. Tidak tampil di halaman.', sections: ['seo'] }
]

export const FAST_SEO_DESCRIPTION_MAX = 230
export type FastContent = ProductContent<FastSectionKey>
export type FastAdminState = SingletonAdminState<'fast', FastContent>
const fastContentSchema = productContentSchema<FastContent>(FAST_SECTIONS, productSeoSchema(FAST_SEO_DESCRIPTION_MAX))
export const FastContentSchema = fastContentSchema

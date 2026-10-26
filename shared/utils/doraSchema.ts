import type { SingletonAdminState } from '#shared/cms/fields'
import { area, group, items, lb, productContentSchema, productSeoSchema, strs, t, tuple, type ProductContent, type ProductTab, type SectionMap } from '#shared/cms/productFields'

// DORA product page (/dora) — field map on the shared product-page toolkit
// (shared/cms/productFields.ts). Content groups mirror useDora().
//
// Editable: section eyebrows, headlines and ledes, every card/list text
// (problems, core modules and configuration, FCP path, the ten flow steps,
// extraction capabilities, verification steps, search filters, dashboard
// widget names, roles and principles, integration boundaries and contract,
// why-DORA cells, the demo "what happens next" path), the implementation
// notes, SEO. Stays in code (owner: small UI text isn't worth editing): the
// hero headline, wordmark, full name and buttons, the sub-nav, the internal
// capability register (status-filtered, never rendered), every synthetic
// sample (letter, intake files, text layer, search records + query,
// dashboard figures, Config Model types — the brief keeps those sample type
// names under review), the verification captions (they describe the sample
// letter), card/box labels, the export formats, and the demo form (fields,
// select options, validation, WhatsApp message). List counts are fixed: the
// layouts index them (10-step rail, 5-beat pin, 5 role tabs, 2×4 grid …).

const HEADLINE_HINT = 'Tampil sangat besar, muncul kata per kata. Titik kuning di akhir ditambahkan otomatis — jangan akhiri dengan tanda tanya atau seru.'

const heading = (eyebrowMax: number, headlineMax: number, ledeMax: number) => ({
  eyebrow: t('Teks kecil di atas judul', eyebrowMax),
  headline: area('Judul besar', headlineMax, HEADLINE_HINT),
  lede: area('Paragraf di bawah judul', ledeMax)
})

const role = (n: number) => group(`Peran ${String(n).padStart(2, '0')}`, {
  name: t('Nama peran', 24, { hint: 'Tampil di tab kecil (5 tab berjajar) dan besar di panel.' }),
  body: area('Keterangan', 100)
})

export const DORA_SECTIONS = {
  hero: group('Hero', {
    body: area('Paragraf di bawah judul', 240),
    facts: strs('Tiga label kecil di bawah tombol', 3, 28, 'Label')
  }),
  problem: group('Masalah dokumen', {
    ...heading(30, 70, 140),
    items: items('Delapan masalah bernomor', 8, lb(26, 100, 'Judul', 'Deskripsi', 'name'))
  }),
  core: group('Apa itu DORA', {
    ...heading(30, 60, 200),
    not: area('Catatan di kotak putih (ikon i)', 120),
    config: strs('Konfigurasi per organisasi (kotak garis putus-putus)', 9, 26),
    modules: strs('Enam modul inti DORA (kotak biru tua)', 6, 26, 'Modul'),
    path: items('Jalur FCP (enam tahap)', 6, { name: t('Nama tahap', 12, { hint: 'Satu kata pendek — kolomnya sempit.' }), out: t('Hasil tahap', 30) })
  }),
  flow: group('Cara kerja DORA', {
    ...heading(30, 50, 120),
    steps: items('Sepuluh langkah di jalur', 10, {
      name: t('Nama langkah', 22, { hint: 'Di desktop tampil di kolom sempit (10 kolom berjajar).' }),
      actor: t('Pelaku', 16, { hint: 'Siapa yang mengerjakan, mis. “Verifier” atau “System”.' }),
      body: area('Kegiatan', 80),
      result: area('Hasil', 70)
    })
  }),
  extraction: group('OCR & ekstraksi', {
    ...heading(30, 30, 160),
    caps: items('Lima kemampuan (daftar kiri)', 5, { name: t('Nama kemampuan', 30), body: area('Keterangan', 110, 'Saat tidak dipilih, di desktop hanya satu baris yang terlihat.') }, 'Isi panel biru tua di kanan (contoh surat) diatur di kode.'),
    note: area('Catatan kecil di bawah panel', 150)
  }),
  verify: group('Verifikasi oleh manusia', {
    ...heading(30, 36, 170),
    steps: items('Lima tahap verifikasi', 5, { name: t('Nama tahap', 22), body: area('Keterangan', 80, 'Di desktop hanya satu baris yang terlihat — buat singkat.') }, 'Bagian ini menempel saat di-scroll di desktop; teks keterangan di bawah contoh dokumen diatur di kode.'),
    note: area('Catatan kecil di bawah contoh dokumen', 130)
  }),
  search: group('Pencarian & ekspor', {
    ...heading(30, 40, 190),
    filters: strs('Tujuh filter pencarian (label kanan atas)', 7, 28, 'Filter'),
    note: t('Catatan kecil di bawah', 80, { hint: 'Tampil setelah “Synthetic records ·”.' })
  }),
  dashboard: group('Dashboard', {
    ...heading(30, 50, 160),
    widgets: strs('Enam nama widget (label kanan atas)', 6, 24, 'Widget', 'Angka-angka contoh di dashboard diatur di kode.'),
    note: t('Catatan kecil di bawah', 80, { hint: 'Tampil setelah “Illustrative values ·”.' })
  }),
  model: group('Model dokumen', {
    ...heading(30, 70, 230),
    note: t('Catatan kecil di bawah', 100, { hint: 'Contoh jenis dokumen (Official letter, dll.) diatur di kode.' })
  }),
  governance: group('Akses & governance', {
    ...heading(30, 40, 170),
    principles: strs('Empat prinsip akses (ikon gembok)', 4, 60, 'Prinsip'),
    roles: tuple('Lima peran (tab)', [role(1), role(2), role(3), role(4), role(5)], 'Daftar “Baseline access” tiap peran diatur di kode.'),
    note: t('Catatan kecil di panel peran', 70),
    policy: area('Paragraf “Privacy follows your policy” (kotak biru tua)', 160)
  }),
  integration: group('Integrasi', {
    ...heading(30, 40, 120),
    boundaries: items('Lima sistem di sekitar DORA', 5, { name: t('Nama sistem', 36), body: area('Keterangan', 50) }),
    note: area('Catatan kecil di bawah diagram', 110, 'Tampil setelah “Dashed = agreed data contract ·”.'),
    contract: strs('Daftar “Agreed before build”', 5, 60, 'Poin')
  }),
  why: group('Kenapa DORA', {
    eyebrow: t('Teks kecil di atas judul', 20),
    headline: area('Judul besar', 40, HEADLINE_HINT),
    items: items('Delapan keunggulan (grid 2×4)', 8, lb(28, 50, 'Judul', 'Deskripsi', 'name'))
  }),
  demo: group('Form demo', {
    eyebrow: t('Teks kecil di atas judul', 20),
    headline: area('Judul besar', 45, HEADLINE_HINT),
    body: area('Paragraf di bawah judul', 160),
    next: strs('“What happens next” (enam tahap)', 6, 24, 'Tahap')
  })
} satisfies SectionMap

export type DoraSectionKey = keyof typeof DORA_SECTIONS

// Numbers match the section tags on the page ("DORA · 02 / 13" …).
export const DORA_TABS: readonly ProductTab[] = [
  { key: 'hero', no: '01', label: 'Hero', where: 'Bagian paling atas berlatar biru tua: tulisan DORA, judul “Turn Documents Into Structured, Verifiable Data.”, paragraf, tombol, tiga label kecil, dan contoh layar verifikasi di kanan.', sections: ['hero'], previewIndex: 0 },
  { key: 'problem', no: '02', label: 'Masalah dokumen', where: 'Judul di kiri, delapan masalah bernomor (01–08) di kanan.', sections: ['problem'], previewIndex: 1 },
  { key: 'core', no: '03', label: 'Apa itu DORA', where: 'Judul + catatan di kiri; kotak “Your configuration” (garis putus-putus) dan kotak biru tua modul inti di kanan; di bawahnya jalur FCP enam tahap.', sections: ['core'], previewIndex: 2 },
  { key: 'flow', no: '04', label: 'Cara kerja', where: 'Bagian biru tua: sepuluh langkah bernomor di satu garis; langkah yang dipilih tampil di kartu detail (Actor / Result).', sections: ['flow'], previewIndex: 3 },
  { key: 'extraction', no: '05', label: 'OCR & ekstraksi', where: 'Judul “From page to fields.”, lima kemampuan di kiri, panel biru tua contoh surat di kanan.', sections: ['extraction'], previewIndex: 4 },
  { key: 'verify', no: '06', label: 'Verifikasi', where: 'Bagian biru gelap yang menempel saat di-scroll (desktop): judul “Automation with human control.”, lima tahap di kiri, contoh layar verifikasi di kanan.', sections: ['verify'], previewIndex: 5 },
  { key: 'search', no: '07', label: 'Pencarian & ekspor', where: 'Judul “Find the document. Use the data.”, label filter di kanan, lalu kotak pencarian contoh dengan hasil dan ekspor CSV/Excel/JSON.', sections: ['search'], previewIndex: 6 },
  { key: 'dashboard', no: '08', label: 'Dashboard', where: 'Bagian biru tua: judul, label nama widget di kanan, lalu contoh dashboard (angka, grafik 14 hari, dokumen terbaru).', sections: ['dashboard'], previewIndex: 7 },
  { key: 'model', no: '09', label: 'Model dokumen', where: 'Judul “Different documents. Different fields…”, tab tiga contoh jenis dokumen dengan template field-nya.', sections: ['model'], previewIndex: 8 },
  { key: 'governance', no: '10', label: 'Akses & governance', where: 'Judul + empat prinsip bergembok di kiri; lima tab peran dengan panelnya di kanan; kotak biru tua “Privacy follows your policy”.', sections: ['governance'], previewIndex: 9 },
  { key: 'integration', no: '11', label: 'Integrasi', where: 'Bagian biru tua: lingkaran DORA di tengah dengan lima sistem di kiri-kanan (garis putus-putus), lalu daftar “Agreed before build”.', sections: ['integration'], previewIndex: 10 },
  { key: 'why', no: '12', label: 'Kenapa DORA', where: 'Judul “Documents in. Verified data out.” dan grid delapan keunggulan bernomor.', sections: ['why'], previewIndex: 11 },
  { key: 'demo', no: '13', label: 'Form demo', where: 'Bagian terakhir: judul ajakan, paragraf, tombol “Talk to PASTI”, enam tahap “What happens next”, dan form “Request a demo”.', sections: ['demo'], previewIndex: 12 },
  { key: 'seo', no: '', label: 'SEO', where: 'Judul & deskripsi yang muncul di Google dan saat link dibagikan. Tidak tampil di halaman.', sections: ['seo'] }
]

export type DoraContent = ProductContent<DoraSectionKey>
export type DoraAdminState = SingletonAdminState<'dora', DoraContent>
const doraContentSchema = productContentSchema<DoraContent>(DORA_SECTIONS, productSeoSchema())
export const DoraContentSchema = doraContentSchema

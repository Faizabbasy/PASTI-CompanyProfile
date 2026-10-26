import type { SingletonAdminState } from '#shared/cms/fields'
import { area, group, items, lb, productContentSchema, productSeoSchema, strs, t, tuple, type ProductContent, type ProductTab, type SectionMap } from '#shared/cms/productFields'

// MATRIX product page (/matrix) — field map on the shared product-page
// toolkit (shared/cms/productFields.ts). Content groups mirror useMatrix().
//
// Editable: every section heading (label, headline, paragraph), the hero
// paragraph and fact chips, card/list texts (problems, layers, material
// states, Material 360 steps, execution stations and their controls,
// governance controls and reports, integration lists and phases), the
// closing notes, the "Why MATRIX" chips, the demo copy and its challenge
// options, SEO. Stays in code (owner: small UI text isn't worth editing):
// the hero headline "Material certainty is operational certainty." and the
// full product name, the rack locator and bin labels, the internal
// capability register (status-filtered, never rendered), every piece of
// synthetic sample data (material MTX-0412, stock mix, locations, serials,
// ledger, audit rows, aging items/bands/evidence, warehouse zones and
// restriction labels, incoming supply), state ids, the sample roles, and
// the demo form fields / warehouse-count options. List counts are fixed:
// the layouts and step animations are drawn for them.

const HEAD_HINT = 'Tampil sangat besar, kata demi kata. Pisahkan kata dengan satu spasi. Titik kuning di akhir ditambahkan otomatis.'

const heading = (eyebrowMax: number, headlineMax: number, ledeMax: number, ledeKey: 'lede' | 'body' = 'lede') => ({
  eyebrow: t('Teks kecil di atas judul', eyebrowMax),
  headline: area('Judul besar', headlineMax, HEAD_HINT),
  [ledeKey]: area('Paragraf di bawah judul', ledeMax)
})

const station = (no: string, n: number) =>
  group(`Tahap ${no}`, { name: t('Nama tahap', 20, { hint: 'Pendek — kolomnya sempit di desktop.' }), controls: strs('Kontrol (bulatan bercentang)', n, 44, 'Kontrol') })

const layer = (no: string, n: number) =>
  group(`Lapisan ${no}`, {
    name: t('Nama lapisan', 26),
    out: area('Kalimat hasil', 96),
    scope: strs('Cakupan (kotak-kotak kecil)', n, 22, 'Cakupan')
  })

export const MATRIX_SECTIONS = {
  hero: group('Hero', {
    eyebrow: t('Label kecil di kiri atas', 30),
    body: area('Paragraf di bawah judul', 300),
    facts: strs('Tiga label kecil (kanan bawah)', 3, 24, 'Label')
  }),
  problem: group('Masalah visibilitas', {
    ...heading(40, 80, 170),
    items: items('Tujuh baris masalah bernomor', 7, lb(36, 100, 'Judul', 'Deskripsi', 'name'))
  }),
  layers: group('Tiga lapisan', {
    ...heading(30, 46, 150),
    items: tuple('Tiga lapisan bertingkat', [layer('01', 7), layer('02 (biru tua)', 9), layer('03', 6)]),
    cycle: strs('Siklus kerja (baris berpanah)', 8, 22, 'Langkah'),
    principle: area('Kalimat prinsip di bawah siklus', 190)
  }),
  intelligence: group('Material intelligence', {
    ...heading(30, 64, 110),
    states: items(
      'Sepuluh keadaan material (tombol di kiri)',
      10,
      { label: t('Nama keadaan', 24, { hint: 'Tampil di tombol dan sebagai judul besar panel kanan.' }), body: area('Penjelasan', 100) },
      'Urutan tetap — tampilan panel (bar stok, lokasi, serial, dst.) mengikuti posisinya. Penjelasan keadaan 1–4 di bar (Net available, Reserved, Quarantine, Damaged) juga muncul saat bar di hero disorot.'
    )
  }),
  m360: group('Material 360', {
    ...heading(24, 46, 140),
    steps: items('Enam langkah (daftar bernomor)', 6, lb(24, 84, 'Nama langkah', 'Penjelasan', 'name'), 'Urutan tetap — tiap langkah menyorot bagian kartu material di kanan.')
  }),
  availability: group('Availability to action', {
    ...heading(30, 70, 180),
    note: area('Catatan kecil di bawah', 110, '“Illustrative values.” ditambahkan otomatis di akhir.')
  }),
  aging: group('Aging & surplus', heading(34, 58, 200)),
  execution: group('Warehouse execution', {
    ...heading(28, 54, 130),
    steps: tuple('Delapan tahap gudang', [station('01', 5), station('02', 4), station('03', 4), station('04', 4), station('05', 3), station('06', 3), station('07', 3), station('08', 3)], 'Urutan tetap — garis kuning berjalan melewati tahap 01 → 08.')
  }),
  explorer: group('Warehouse explorer', heading(26, 66, 160)),
  governance: group('Traceability & governance', {
    ...heading(32, 40, 180),
    controls: items('Enam kontrol (kotak biru tua)', 6, lb(26, 72, 'Nama kontrol', 'Penjelasan', 'name')),
    reports: strs('Delapan laporan (daftar kanan)', 8, 32, 'Laporan')
  }),
  integration: group('Integrasi & implementasi', {
    ...heading(34, 58, 170),
    transactions: strs('Enam transaksi (kotak berpanah di tengah)', 6, 22, 'Transaksi'),
    controls: strs('Enam kontrol interface (label kecil)', 6, 18, 'Kontrol'),
    note: area('Catatan di bawah diagram', 190),
    phases: items('Lima fase implementasi', 5, lb(24, 120, 'Nama fase', 'Penjelasan', 'name'))
  }),
  why: strs('Label “Why MATRIX” (bulatan-bulatan)', 13, 30, 'Label'),
  demo: group('Form demo', {
    ...heading(24, 80, 180, 'body'),
    challenges: strs('Pilihan “Inventory / material challenge”', 8, 34, 'Pilihan', 'Pilihan yang dipilih pengunjung ikut terkirim di pesan WhatsApp.')
  })
} satisfies SectionMap

export type MatrixSectionKey = keyof typeof MATRIX_SECTIONS

// Numbers match the bin labels on the page ("LOC A-01" … "C-04" = 01–12).
export const MATRIX_TABS: readonly ProductTab[] = [
  { key: 'hero', no: '01', label: 'Hero', where: 'Bagian paling atas: tulisan besar “Material certainty is operational certainty.”, bar stok yang terbelah, paragraf, dan tiga label kecil.', sections: ['hero'], previewIndex: 0 },
  { key: 'problem', no: '02', label: 'Masalah', where: 'Judul “Having stock is not the same as having material ready…” di kiri dengan bar stok kecil, dan tujuh baris masalah bernomor di kanan.', sections: ['problem'], previewIndex: 1 },
  { key: 'layers', no: '03', label: 'Tiga lapisan', where: 'Tiga lapisan bertumpuk seperti rak (lapisan tengah biru tua), lalu baris siklus kerja berpanah dan kalimat prinsip.', sections: ['layers'], previewIndex: 2 },
  { key: 'intelligence', no: '04', label: 'Material intelligence', where: 'Sepuluh tombol keadaan material di kiri; keadaan yang dipilih tampil besar di panel kanan.', sections: ['intelligence'], previewIndex: 3 },
  { key: 'm360', no: '05', label: 'Material 360', where: 'Bagian biru tua: enam langkah bernomor di kiri dan kartu material (MTX-0412) di kanan yang berganti isi per langkah.', sections: ['m360'], previewIndex: 4 },
  { key: 'availability', no: '06', label: 'Availability', where: 'Judul “See the shortage…”, kartu risiko kekurangan dan kartu rekomendasi biru tua dengan tombol Approve / Return, lalu catatan kecil.', sections: ['availability'], previewIndex: 5 },
  { key: 'aging', no: '07', label: 'Aging & surplus', where: 'Judul “Old stock needs a decision…”, tombol rentang umur stok, daftar barang, dan kartu bukti keputusan. Hanya judulnya yang bisa diubah.', sections: ['aging'], previewIndex: 6 },
  { key: 'execution', no: '08', label: 'Warehouse execution', where: 'Bagian biru tua: delapan tahap bernomor dengan garis kuning berjalan, dan kartu detail berisi kontrol tiap tahap.', sections: ['execution'], previewIndex: 7 },
  { key: 'explorer', no: '09', label: 'Warehouse explorer', where: 'Judul “Know where material is…”, daftar zona gudang dan denah gudang. Hanya judulnya yang bisa diubah.', sections: ['explorer'], previewIndex: 8 },
  { key: 'governance', no: '10', label: 'Governance', where: 'Tabel ledger / audit trail, kotak biru tua berisi enam kontrol, dan daftar laporan.', sections: ['governance'], previewIndex: 9 },
  { key: 'integration', no: '11', label: 'Integrasi', where: 'Bagian biru tua: diagram “Your ERP ⇄ MATRIX” dengan kotak transaksi, catatan, lalu lima fase implementasi.', sections: ['integration'], previewIndex: 10 },
  { key: 'demo', no: '12', label: 'Why MATRIX & demo', where: 'Bagian terakhir: label-label “Why MATRIX”, judul ajakan, paragraf, dan form “Request a demo”.', sections: ['why', 'demo'], previewIndex: 11 },
  { key: 'seo', no: '', label: 'SEO', where: 'Judul & deskripsi yang muncul di Google dan saat link dibagikan. Tidak tampil di halaman.', sections: ['seo'] }
]

export const MATRIX_SEO_DESCRIPTION_MAX = 200
export type MatrixContent = ProductContent<MatrixSectionKey>
export type MatrixAdminState = SingletonAdminState<'matrix', MatrixContent>
const matrixContentSchema = productContentSchema<MatrixContent>(MATRIX_SECTIONS, productSeoSchema(MATRIX_SEO_DESCRIPTION_MAX))
export const MatrixContentSchema = matrixContentSchema

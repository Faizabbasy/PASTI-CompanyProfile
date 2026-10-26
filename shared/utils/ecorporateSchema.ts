import type { SingletonAdminState } from '#shared/cms/fields'
import { area, group, items, lb, productContentSchema, productSeoSchema, strs, t, tuple, type ProductContent, type ProductTab, type SectionMap } from '#shared/cms/productFields'

// e-CORPORATE product page (/e-corporate) — field map on the shared
// product-page toolkit (shared/cms/productFields.ts). Content groups mirror
// useEcorporate().
//
// Editable: the positioning copy, every list/card text, the use-case
// scenarios, the configurable/integration/governance/outcome lists, the demo
// headline, SEO. Stays in code (owner: small UI text isn't worth editing):
// the three hero words (they drive the hero illustration's highlights), the
// section headings and labels, the illustration data (approval trail, hero
// surface), icons/ids, and the demo form. List counts are fixed: the layouts
// are drawn for them (2×3 map, 6-tick bar, 7-step chain, 4-column grid).

const SPLIT_HINT = 'Kata-kata bergaris kuning disambung langsung setelah kalimat sebelumnya.'

export const ECORPORATE_SECTIONS = {
  category: t('Kategori produk (label kecil di hero)', 32),
  short: area('Paragraf hero', 260),
  positioning: strs('Tiga paragraf posisi produk', 3, 260, 'Paragraf', 'Paragraf 1 tampil di “Platform overview”, paragraf 2 di “Configurable”, paragraf 3 di “Problem”.'),
  problems: items('Enam baris masalah → solusi', 6, { problem: t('Masalah (kolom kiri)', 40), answer: t('Solusi (kolom kanan, tebal)', 48) }, 'Teks masalah juga dipakai sebagai pilihan di form demo.'),
  solutionHeadline: t('Judul bagian masalah', 44, { hint: 'Minimal 3 kata. Dua kata pertama polos, sisanya bergaris kuning.' }),
  overviewLead: t('Kalimat kecil di bawah judul overview', 70),
  nodes: items('Enam elemen peta sistem (2 baris × 3)', 6, { title: t('Nama elemen', 14, { hint: 'Tampil besar saat dipilih.' }), body: area('Keterangan', 140) }),
  values: items('Enam nilai utama', 6, {
    title: t('Nama nilai', 11, { hint: 'Satu kata — tampil sangat besar dan berjalan di pita teks.' }),
    sentence: area('Kalimat', 260),
    source: area('Potongan kalimat yang digarisbawahi', 100, 'Harus sama persis dengan potongan dari “Kalimat” di atas; kalau tidak sama, garis bawahnya tidak tampil.')
  }),
  capabilityNote: t('Catatan kecil area kemampuan', 100),
  capabilities: items('Delapan area kemampuan (grid 4 kolom)', 8, lb(40, 110, 'Judul', 'Deskripsi', 'title'), 'Ikon tiap area diatur di kode.'),
  useCaseNote: t('Catatan kecil contoh skenario', 90),
  useCases: tuple('Enam contoh skenario', [
    group('Skenario 01', { title: t('Judul', 34), body: area('Deskripsi', 100), steps: strs('Langkah', 4, 12, 'Langkah') }),
    group('Skenario 02', { title: t('Judul', 34), body: area('Deskripsi', 100), steps: strs('Langkah', 3, 12, 'Langkah') }),
    group('Skenario 03', { title: t('Judul', 34), body: area('Deskripsi', 100), steps: strs('Langkah', 4, 12, 'Langkah') }),
    group('Skenario 04', { title: t('Judul', 34), body: area('Deskripsi', 100), steps: strs('Langkah', 3, 12, 'Langkah') }),
    group('Skenario 05', { title: t('Judul', 34), body: area('Deskripsi', 100), steps: strs('Langkah', 3, 12, 'Langkah') }),
    group('Skenario 06', { title: t('Judul', 34), body: area('Deskripsi', 100), steps: strs('Langkah', 3, 12, 'Langkah') })
  ]),
  configHeadline: group('Judul “Configurable”', { before: t('Bagian awal judul', 50, { spaceAfter: true }), mark: t('Bagian bergaris kuning', 30, { hint: SPLIT_HINT }) }),
  configChain: strs('Rantai tujuh langkah bernomor', 7, 14, 'Langkah'),
  configAdapts: strs('Daftar “Adapts to”', 6, 30),
  integrationBody: area('Paragraf integrasi', 200),
  integrationTargets: strs('Sistem yang terhubung (kotak-kotak)', 5, 28, 'Sistem'),
  integrationNote: t('Catatan kecil di bawah', 100),
  governanceThemes: strs('Daftar tema governance', 7, 30, 'Tema'),
  outcomes: strs('Enam hasil bisnis (teks sangat besar)', 6, 28, 'Hasil'),
  why: items('Lima alasan memilih PASTI', 5, lb(44, 120, 'Judul', 'Deskripsi', 'title')),
  demo: group('Form demo', {
    headline: group('Judul', { before: t('Bagian awal', 30, { spaceAfter: true }), mark: t('Bagian bergaris kuning', 26, { hint: SPLIT_HINT }), after: t('Tanda baca di akhir', 3, { hint: 'Biasanya “?”.' }) }),
    body: area('Paragraf', 160)
  })
} satisfies SectionMap

export type EcorporateSectionKey = keyof typeof ECORPORATE_SECTIONS

// Numbers match the section tags on the page ("02 / 12" …; the hero is 00).
export const ECORPORATE_TABS: readonly ProductTab[] = [
  { key: 'hero', no: '00', label: 'Hero', where: 'Bagian paling atas: tulisan besar “e-CORPORATE”, tiga baris “Connect people. / processes. / information.”, paragraf, dan ilustrasi aplikasi.', sections: ['category', 'short'], previewIndex: 0 },
  { key: 'problem', no: '02', label: 'Masalah → Solusi', where: 'Angka besar “06 → 01”, tabel dua kolom: masalah di kiri, solusi bercentang di kanan.', sections: ['solutionHeadline', 'problems'], previewIndex: 2 },
  { key: 'overview', no: '03', label: 'Platform overview', where: 'Peta sistem dengan enam elemen (2 baris × 3); elemen yang dipilih tampil besar di panel.', sections: ['overviewLead', 'nodes', 'positioning'], previewIndex: 3 },
  { key: 'values', no: '04', label: 'Nilai utama', where: 'Enam nilai: namanya tampil sangat besar (juga di pita teks berjalan di atasnya), dengan kalimat bergaris bawah.', sections: ['values'], previewIndex: 4 },
  { key: 'capabilities', no: '05', label: 'Area kemampuan', where: 'Grid delapan kotak berikon (4 kolom di desktop).', sections: ['capabilityNote', 'capabilities'], previewIndex: 5 },
  { key: 'useCases', no: '06', label: 'Contoh skenario', where: 'Panel-panel skenario yang bergeser ke samping, tiap panel dengan judul, deskripsi, dan rantai langkah.', sections: ['useCaseNote', 'useCases'], previewIndex: 6 },
  { key: 'configurable', no: '07', label: 'Configurable', where: 'Tulisan besar “ADAPT”, judul, rantai tujuh langkah bernomor, dan daftar “Adapts to”.', sections: ['configHeadline', 'configChain', 'configAdapts'], previewIndex: 7 },
  { key: 'integration', no: '08', label: 'Integrasi', where: 'Diagram tiga tingkat: platform di atas, lapisan API, lalu kotak-kotak sistem yang sudah ada.', sections: ['integrationBody', 'integrationTargets', 'integrationNote'], previewIndex: 8 },
  { key: 'governance', no: '09', label: 'Governance', where: 'Daftar tema bernomor di kiri dan kartu “Approval trail” di kanan.', sections: ['governanceThemes'], previewIndex: 9 },
  { key: 'outcomes', no: '10', label: 'Hasil bisnis', where: 'Enam frasa hasil bisnis bertumpuk dengan huruf sangat besar.', sections: ['outcomes'], previewIndex: 10 },
  { key: 'why', no: '11', label: 'Kenapa PASTI', where: 'Daftar bernomor alasan memilih PASTI, dengan tautan “About PASTI”.', sections: ['why'], previewIndex: 11 },
  { key: 'demo', no: '12', label: 'Form demo', where: 'Bagian terakhir: judul ajakan bergaris kuning, paragraf, dan form “Request a demo”.', sections: ['demo'], previewIndex: 12 },
  { key: 'seo', no: '', label: 'SEO', where: 'Judul & deskripsi yang muncul di Google dan saat link dibagikan. Tidak tampil di halaman.', sections: ['seo'] }
]

export type EcorporateContent = ProductContent<EcorporateSectionKey>
export type EcorporateAdminState = SingletonAdminState<'e-corporate', EcorporateContent>
const ecorporateContentSchema = productContentSchema<EcorporateContent>(ECORPORATE_SECTIONS, productSeoSchema())
export const EcorporateContentSchema = ecorporateContentSchema

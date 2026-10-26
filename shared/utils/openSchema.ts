import type { SingletonAdminState } from '#shared/cms/fields'
import { area, cells, group, items, lb, lines, productContentSchema, productSeoSchema, strs, t, tuple, type ProductContent, type ProductTab, type SectionMap } from '#shared/cms/productFields'

// OPEN product page (/open) — field map on the shared product-page toolkit
// (shared/cms/productFields.ts). Content groups mirror useOpen().
//
// Scope (owner decision 2026-10-26): the copy the owner listed — hero, every
// section's titles/copy/lists, and SEO. Stays in code: ids and tab/module
// wiring, section tags, sub-headings, illustration mock-ups, the demo form's
// labels and behaviour, and the O+PEN logo. List counts are fixed.
// Limits were stress-tested at 390/820/1366/1920 with max-length copy.

const CARD = lb(40, 140)

export const OPEN_SECTIONS = {
  hero: group('Hero', {
    origin: t('Teks kecil di atas logo', 70),
    name: t('Nama produk', 20, { hint: 'Dibaca mesin pencari & pembaca layar. Logo O+PEN yang terlihat adalah bagian desain.' }),
    expansion: t('Kepanjangan nama (di bawah logo)', 50),
    statement: area('Judul utama', 110),
    body: area('Paragraf di bawah judul', 300),
    primaryCtaLabel: t('Tombol kuning', 28, { hint: 'Menggulir ke form demo.' }),
    secondaryCtaLabel: t('Tombol kedua (tanpa latar)', 28, { hint: 'Menggulir ke bagian masalah.' }),
    connectsIntro: t('Kalimat di atas garis kata', 80),
    connects: strs('Kata di garis bawah hero', 7, 20, 'Kata')
  }),
  problem: group('Masalah procurement', {
    title: lines('Judul besar', 2, 50),
    intro: area('Paragraf pembuka', 120),
    pressures: strs('Kartu-kartu bertumpuk (“More people.”…)', 6, 24, 'Kartu'),
    symptoms: strs('Label gejala (bulatan kecil)', 5, 30, 'Gejala'),
    verdict: lines('Kalimat penutup (abu-abu)', 2, 45),
    realTitle: lines('Judul kotak biru tua', 2, 45),
    realIntro: t('Kalimat di kotak biru tua', 100),
    questions: items('Kata besar WHO / WHY / … dan pertanyaannya', 5, { key: t('Kata besar', 6, { hint: 'Satu kata pendek — tampil sangat besar.' }), q: t('Pertanyaan', 50) }),
    needsIntro: t('Kalimat “Procurement membutuhkan”', 50),
    needs: strs('Yang dibutuhkan', 3, 30)
  }),
  notSaas: group('Bukan SaaS', {
    title: lines('Judul besar', 2, 40),
    differsIntro: t('Kalimat di atas daftar kanan', 80),
    differs: strs('Daftar kanan', 6, 32),
    differsWord: t('Kata kecil di ujung tiap baris', 20),
    saasLabel: t('Label alur SaaS (dicoret)', 20),
    saas: strs('Alur SaaS (dicoret)', 3, 16, 'Langkah'),
    openLabel: t('Label alur OPEN', 50),
    open: strs('Alur OPEN', 6, 16, 'Langkah'),
    line: lines('Kalimat penutup besar', 2, 60)
  }),
  framework: group('Framework', {
    title: lines('Judul besar', 2, 45),
    intro: area('Paragraf pembuka', 160),
    foundation: strs('Kotak-kotak fondasi (kanan)', 9, 32, 'Kotak'),
    after: area('Paragraf kedua', 200),
    notBlank: t('Kalimat tebal bergaris kuning', 80),
    tagline: lines('Tagline kecil (kanan bawah)', 2, 40),
    layers: items('Tiga kartu lapisan (bawah)', 3, CARD),
    adaptedBy: strs('Label kecil “disesuaikan oleh”', 6, 24, 'Label')
  }),
  ecosystem: group('Ekosistem', {
    title: lines('Judul besar', 2, 45),
    body: area('Paragraf', 200),
    note: area('Catatan bergaris kuning', 220),
    nodes: items('Titik-titik di lingkaran', 10, lb(22, 70, 'Nama titik', 'Keterangan (muncul di tengah)'), 'Tab modul yang dibuka tiap titik diatur di kode.'),
    components: items('Tiga kartu modul (bawah)', 3, lb(32, 90)),
    pillars: items('Pilar (baris paling bawah)', 5, lb(30, 80))
  }),
  modulesIntro: group('Pembuka modul', {
    title: lines('Judul besar', 2, 45),
    body: area('Paragraf kanan', 280)
  }),
  procurement: group('Tab 01 · Procurement', {
    label: t('Nama tab', 30),
    tagline: t('Teks kecil di tab', 50),
    title: lines('Judul panel', 2, 40),
    body: area('Paragraf panel', 220),
    capabilities: strs('Daftar kemampuan (kiri)', 8, 40),
    workflow: items('Alur kerja (12 kotak)', 12, lb(28, 70)),
    methodsIntro: area('Pembuka metode procurement', 240),
    methods: items('Metode procurement', 3, { name: t('Nama metode', 40), body: area('Deskripsi', 140), points: strs('Poin', 4, 70, 'Poin') }, 'Kode metode dan diagram sampul diatur di kode.'),
    methodsManaged: strs('Perbedaan yang dikelola', 4, 40),
    methodsLine: t('Kalimat penutup metode', 60)
  }),
  vendor: group('Tab 02 · Vendor Management', {
    label: t('Nama tab', 30),
    tagline: t('Teks kecil di tab', 50),
    title: lines('Judul panel', 2, 45),
    body: area('Paragraf panel', 220),
    capabilities: strs('Daftar kemampuan', 6, 40),
    lifecycle: items('Siklus vendor (9 langkah)', 9, lb(30, 90)),
    line: lines('Kalimat penutup', 2, 45),
    lineBody: area('Paragraf penutup', 140)
  }),
  catalog: group('Tab 03 · Catalog Management', {
    label: t('Nama tab', 30),
    tagline: t('Teks kecil di tab', 50),
    title: lines('Judul panel', 2, 45),
    body: area('Paragraf panel', 200),
    capabilities: strs('Daftar kemampuan', 6, 40),
    types: tuple('Dua jenis katalog', [
      group('Contract Catalog', { label: t('Judul', 30), body: area('Deskripsi', 120), points: strs('Poin', 3, 45, 'Poin') }),
      group('E-Commerce Catalog', { label: t('Judul', 30), body: area('Deskripsi', 120), flow: strs('Alur', 5, 16, 'Langkah') })
    ]),
    controlled: items('Dikontrol atas', 5, lb(20, 80)),
    controlledLine: area('Kalimat kontrol', 140),
    line: lines('Kalimat penutup', 2, 45)
  }),
  auction: group('e-Auction', {
    title: lines('Judul besar', 2, 40),
    body: area('Paragraf', 180),
    line: lines('Kalimat kuning', 2, 45),
    steps: items('Langkah lelang (yang aktif tampil sangat besar)', 8, { label: t('Nama langkah', 9, { hint: 'Satu kata — langkah aktif tampil sangat besar.' }), body: area('Keterangan', 50) }),
    capabilities: items('Kemampuan utama', 6, lb(40, 70)),
    principles: items('Prinsip', 5, lb(30, 80))
  }),
  governance: group('Governance, approval & audit trail', {
    title: lines('Judul governance', 2, 60),
    body: area('Paragraf governance', 180),
    embedded: items('Garis langkah governance', 5, lb(20, 60)),
    embeddedLine: area('Kalimat di bawah garis', 120),
    capabilities: items('Kartu kemampuan governance', 8, lb(28, 90)),
    approvalTitle: lines('Judul approval', 2, 45),
    approvalBody: area('Paragraf approval', 200),
    approvalQuestionIntro: t('Kalimat sebelum pertanyaan', 50),
    approvalQuestion: t('Pertanyaan dalam kotak kuning', 50),
    approvalShows: strs('“Sistem akan menunjukkan”', 5, 16),
    approvalFlow: items('Contoh alur approval', 6, lb(20, 60)),
    approvalLine: t('Kalimat di bawah alur', 100),
    approvalFeatures: items('Fitur approval', 7, lb(32, 100)),
    auditTitle: lines('Judul audit trail', 2, 45),
    auditIntro: t('Kalimat pembuka audit trail', 100),
    auditFields: strs('Yang dicatat', 7, 24),
    auditQuote: lines('Kutipan besar audit trail', 2, 45),
    auditLine: area('Kalimat penutup audit trail', 160)
  }),
  visibility: group('Monitoring & reporting', {
    title: lines('Judul besar', 2, 45),
    intro: t('Kalimat pembuka', 100),
    items: strs('Daftar yang terpantau', 7, 32),
    line: lines('Kalimat penutup', 2, 45)
  }),
  integration: group('Integrasi', {
    title: lines('Judul kotak biru tua', 2, 45),
    intro: t('Kalimat pembuka', 100),
    targets: items('Sistem yang terhubung (kiri-kanan logo OPEN)', 7, lb(30, 90)),
    approachesIntro: t('Label “Melalui pendekatan”', 40),
    approaches: strs('Pendekatan (label kuning)', 3, 24),
    line: area('Paragraf penutup', 320)
  }),
  security: group('Keamanan', {
    title: lines('Judul besar', 2, 45),
    intro: t('Kalimat pembuka', 60),
    quote: lines('Kutipan', 2, 40),
    items: items('Daftar keamanan', 7, lb(24, 110))
  }),
  customization: group('Customization & implementation', {
    title: lines('Judul customization', 2, 45),
    intro: t('Kalimat pembuka', 60),
    areas: items('Kartu area customization (9)', 9, lb(28, 150)),
    line: lines('Kalimat penutup customization', 2, 70),
    implTitle: lines('Judul implementasi', 2, 40),
    phases: items('Tahap implementasi (garis bernomor)', 6, lb(16, 70)),
    scopeIntro: t('Kalimat cakupan', 80),
    scope: items('Cakupan implementasi', 8, lb(36, 80)),
    implLine: t('Kalimat penutup implementasi', 110)
  }),
  advantage: group('Keunggulan OPEN', {
    title: lines('Judul besar', 2, 45),
    items: items('Enam keunggulan', 6, lb(24, 80)),
    compareTitle: lines('Judul tabel perbandingan', 2, 45),
    columns: strs('Judul kolom tabel', 3, 24, 'Kolom'),
    rows: items('Baris tabel', 7, { label: t('Nama baris', 32), values: cells('Isi tiap kolom', 3, 28, 'Pilih Ya (✓), Tidak (—) atau tulis teks pendek.') }),
    compareNote: t('Catatan di bawah tabel', 100),
    difference: lines('Judul perbedaan', 2, 70),
    saasFlow: items('Alur SaaS', 3, lb(16, 90)),
    openFlow: items('Alur OPEN', 6, lb(16, 90)),
    differenceLine: lines('Kalimat penutup', 2, 40)
  }),
  cta: group('Form demo', {
    title: lines('Judul besar (kiri)', 2, 50),
    body: area('Paragraf (kiri)', 240),
    line: t('Kalimat kuning', 70),
    pillars: strs('Label pilar (kiri bawah)', 4, 30),
    challenges: strs('Pilihan “Tantangan procurement”', 6, 36, 'Pilihan'),
    interests: items('Pilihan “Minat”', 5, { label: t('Label', 30) }, 'Kode pilihan (dipakai tombol “Request a Demo”) diatur di kode.')
  })
} satisfies SectionMap

export type OpenSectionKey = keyof typeof OPEN_SECTIONS
export const OPEN_SECTION_KEYS = Object.keys(OPEN_SECTIONS) as OpenSectionKey[]

// One tab per visible section, in page order (same numbers as the page tags).
export const OPEN_TABS: readonly ProductTab[] = [
  { key: 'hero', no: '01', label: 'Hero', where: 'Bagian paling atas: logo OPEN besar, judul utama, paragraf, dua tombol, dan deretan kata di garis bawah.', sections: ['hero'], previewIndex: 0 },
  { key: 'problem', no: '02', label: 'Masalah', where: 'Judul “Procurement has become…”, kartu-kartu bertumpuk, lalu kotak biru tua berisi kata besar WHO / WHY / WHEN.', sections: ['problem'], previewIndex: 1 },
  { key: 'notSaas', no: '03', label: 'Bukan SaaS', where: 'Judul “OPEN is not another SaaS.”, daftar di kanan, lalu alur SaaS yang dicoret dan alur OPEN bertitik kuning.', sections: ['notSaas'], previewIndex: 2 },
  { key: 'framework', no: '04', label: 'Framework', where: 'Bagian berlatar biru tua: judul framework, kotak-kotak fondasi di kanan, dan tiga kartu lapisan di bawah.', sections: ['framework'], previewIndex: 3 },
  { key: 'ecosystem', no: '05', label: 'Ekosistem', where: 'Lingkaran (dial) dengan 10 titik fungsi, tiga kartu modul, dan baris pilar di bawahnya.', sections: ['ecosystem'], previewIndex: 4 },
  { key: 'modules', no: '06', label: 'Modul', where: 'Judul “Three core procurement ecosystems.” dengan tiga tab: Procurement, Vendor Management, Catalog Management.', sections: ['modulesIntro', 'procurement', 'vendor', 'catalog'], previewIndex: 5 },
  { key: 'auction', no: '07', label: 'e-Auction', where: 'Bagian biru tua: judul e-Auction, langkah lelang dengan nama langkah yang tampil sangat besar, lalu kemampuan dan prinsip.', sections: ['auction'], previewIndex: 6 },
  { key: 'governance', no: '08', label: 'Governance', where: 'Tiga bagian berurutan: governance (garis langkah + kartu), approval (contoh alur), dan audit trail (tabel log).', sections: ['governance'], previewIndex: 7 },
  { key: 'systems', no: '09', label: 'Monitoring · Integrasi · Keamanan', where: 'Dashboard monitoring, kotak biru tua integrasi dengan logo OPEN di tengah, lalu daftar keamanan.', sections: ['visibility', 'integration', 'security'], previewIndex: 8 },
  { key: 'customization', no: '10', label: 'Customization', where: 'Kartu-kartu area customization, lalu garis tahap implementasi bernomor dan cakupannya.', sections: ['customization'], previewIndex: 9 },
  { key: 'advantage', no: '11', label: 'Keunggulan', where: 'Enam keunggulan, tabel perbandingan (kolom OPEN biru tua), dan alur SaaS vs OPEN.', sections: ['advantage'], previewIndex: 10 },
  { key: 'cta', no: '12', label: 'Form demo', where: 'Bagian terakhir berlatar biru tua: judul ajakan di kiri, form “Request a Demo” di kanan.', sections: ['cta'], previewIndex: 11 },
  { key: 'seo', no: '', label: 'SEO', where: 'Judul & deskripsi yang muncul di Google dan saat link dibagikan (WhatsApp, LinkedIn). Tidak tampil di halaman.', sections: ['seo'] }
]

// The current SEO description (185 chars) is longer than the shared 170
// default; OPEN keeps it, so its limit is 200.
export const OPEN_SEO_DESCRIPTION_MAX = 200
export type OpenContent = ProductContent<OpenSectionKey>
export type OpenContentInput = OpenContent
export type OpenAdminState = SingletonAdminState<'open', OpenContent>
const openContentSchema = productContentSchema<OpenContent>(OPEN_SECTIONS, productSeoSchema(OPEN_SEO_DESCRIPTION_MAX))
export const OpenContentSchema = openContentSchema

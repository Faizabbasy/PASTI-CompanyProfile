# OPEN by PASTI — Page Structure (2026)

**Status:** live di `/open` (2026-10-07). Menggantikan struktur 13 section versi brief lama.
**Hierarki sumber:** `OPEN PRODUCT 2026.pdf` (catatan per slide: [`02-open-product-2026-notes.md`](02-open-product-2026-notes.md)) adalah sumber fakta utama. [`00-open-landing-page-brief.md`](00-open-landing-page-brief.md) hanya konteks pendukung; kalau bentrok, ikut PDF 2026.

## Positioning (locked)

- OPEN = **One Procurement Ecosystem Network**: *ready-to-develop procurement framework* yang dikustomisasi mengikuti proses, governance, approval, role, business rules, dan integrasi tiap organisasi.
- Mental model: *Ready foundation. Customized around your organization.* — *The system adapts to your business. Not the other way around.* — *SaaS gives you a product. OPEN gives you a foundation to build your system.*
- e-Procurement adalah bagian dari ekosistem; OPEN bukan "e-Procurement" dan bukan SaaS plug-and-play.

## Bahasa

Keputusan owner (2026-10-07): **tidak full English**. Headline dan label produk pakai bahasa Inggris seperti di deck; copy pendukung pakai Bahasa Indonesia dari deck.

## Konsep visual: "closed loop + trace"

- Motif utama: ring-and-check OPEN. Tag setiap section adalah ring yang terisi sesuai posisi section (n / 12); ring baru penuh dan check-nya muncul di CTA. Sub-nav desktop juga punya ring yang terisi sesuai progres halaman.
- Satu momen signature: **dial ekosistem** (section 06), satu-satunya section yang di-pin.
- Garis trace kuning + check menandai langkah yang selesai. Kuning tidak pernah dipakai sebagai teks di atas putih.
- Bedanya dengan e-CORPORATE: e-CORPORATE pakai blueprint (dot grid, outline). OPEN pakai ruled trace grid 4 kolom (`.op-rules`), ring, dan check.

## Section

| # | Section | Komponen | Slide | Catatan |
|---|---|---|---|---|
| 01 | Global nav | `LayoutHeader` + `OpenSubNav` | — | Sub-nav desktop: Overview / Ecosystem / Modules / Governance / Integration / Demo |
| 02 | Hero / Meet OPEN | `OpenHero` + `OpenRecord` | 1, 3, 4 | H1 = wordmark (ring sebagai "O"). Record UI tanpa angka/nama, berjalan hanya saat terlihat |
| 03 | Procurement problem | `OpenProblem` | 2, 3 | Tumpukan kertas → gejala → verdict → WHO/WHY/WHEN/WHAT/TRACE |
| 04 | Not another SaaS | `OpenNotSaas` | 5 | Dua jalur di satu grid: SaaS berhenti di kolom 3 |
| 05 | Ready-to-develop framework | `OpenFramework` | 6, 7 | Papan fondasi 3×3 + Framework → Your Business → Your System |
| 06 | One procurement ecosystem | `OpenEcosystem` | 8 | Dial 10 node; pin + scrub hanya di ≥1024px dengan motion; di bawah itu list vertikal |
| 07 | Core ecosystems | `OpenModules` + `OpenMethods` | 9, 10, 12, 13 | Tab ARIA: Procurement (workflow 12 langkah + metode 1T1S/1T2S/2T2S), Vendor (lifecycle 9 langkah), Catalog |
| 08 | e-Auction | `OpenAuction` | 11 | Readout langkah dari scroll (tanpa pin) + capability + prinsip |
| 09 | Governance, approval & audit | `OpenGovernance` | 14, 15, 16 | Lane governance, demo approval (Who/What/When/Status/Next Action), audit log ilustratif |
| 10 | Visibility, integration & security | `OpenSystems` | 17, 18, 19 | Dashboard tanpa angka, hub integrasi tanpa logo vendor, 7 langkah keamanan |
| 11 | Customization & implementation | `OpenCustomization` | 20, 21 | 9 area + 6 fase; cakupan implementasi ditulis "dapat meliputi" |
| 12 | Advantage & comparison | `OpenAdvantage` | 23, 24, 25 | 6 keunggulan, tabel perbandingan (stack di HP), SaaS vs OPEN |
| 13 | CTA / demo | `OpenDemo` | 26 | Form → handoff ke WhatsApp (belum ada backend) |
| 14 | Footer | `LayoutFooter` | — | Footer global |

Data dan copy ada di `app/composables/useOpen.ts`; `contentStatus` di sana mencatat apa saja yang `confirmed`, `needs_approval`, atau `placeholder`.

## Dibuang dari versi lama

- e-Procurement sebagai modul 01 "Primary" beserta USP "One Process. Full Visibility. Better Control."
- Contract Management dan Collaborative Procurement/P2P sebagai modul terpisah (di 2026, Contract adalah langkah dalam Procurement).
- Section Cases (BSI, Mandiri, Pelindo, Lintasarta, LPEI), Impact (40/67/35/100%), dan Why PASTI: tidak ada di struktur 14 section dan tidak ada di PDF 2026. Datanya tetap ada di brief lama.

## Motion, performa & aksesibilitas

- Reveal pakai satu class (`is-in`) yang di-set IntersectionObserver (`useOpenInView`), lalu transisi CSS. Tidak ada scroll handler per section.
- GSAP hanya dipakai untuk pin dial (06) dan progres readout e-Auction (08). Loop idle (hero record, demo approval) hanya berjalan saat terlihat.
- Reduced motion: semua state final langsung tampil, tanpa pin, dan dial tetap utuh.
- Tab modul dan radio metode bisa dipakai dengan keyboard (arrow keys). Node dial berupa tombol. Form punya label, error inline dengan `aria-describedby`, dan fokus pindah ke field invalid pertama.

## Open items

1. Screenshot UI asli OPEN (desktop + mobile) untuk menggantikan ilustrasi.
2. Logo SAP di slide 18: konfirmasi kompatibilitas sebelum ditampilkan.
3. Klaim "regulatory compliance" (slide 8) dan baris "Ownership Potential" (slide 24): butuh approval.
4. Tujuan submit form demo (email / CRM / WhatsApp).
5. Copy pendukung yang merupakan restatement (hero body, CTA body, intro modul): perlu review owner.
6. Slide 22 tidak ada di PDF (nomor loncat dari 21 ke 23).

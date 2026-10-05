# OPEN by PASTI — Page Structure

**Status:** struktur halaman `/open`, siap masuk tahap art direction / UI design. Belum ada implementasi.
**Hierarki sumber:** [`00-open-landing-page-brief.md`](00-open-landing-page-brief.md) mengalahkan dokumen ini. Kalau ada yang bentrok, ikuti brief dan flag konfliknya.

Penanda:
- **[BUTUH DATA]**: konten belum ada di brief. Jangan dikarang; pakai placeholder sampai owner kasih data.
- **[BUTUH KONFIRMASI]**: ada di brief tapi maknanya perlu diperjelas sebelum tampil final.

---

## Aturan lintas section

- **Mental model** dipakai di seluruh halaman: *"e-Procurement digitizes the procurement process. OPEN connects the entire procurement ecosystem."* e-Procurement selalu tampil sebagai satu modul, tidak pernah sebagai headline halaman atau pusat diagram.
- **Copy:** pakai kalimat dari brief kalau ada. Body copy yang belum ada di brief pakai placeholder `Lorem ipsum dolor sit amet`. Jangan bikin copy marketing baru.
- **Angka proof** selalu tampil bersama case-nya. Tidak ada angka yang berdiri sendiri sebagai jaminan produk OPEN.
- **Karakter visual:** lanjutan world OPEN di homepage, "Expansive Precision" (`docs/rework-v2/04-homepage-spec.md`, §Platforms). Slate Navy, komposisi lega dan asimetris, satu fragment produk dominan per komposisi, crop agresif. Tanpa browser chrome, laptop mockup, atau kartu dashboard 3D. Cobalt untuk Signal, Cyan selektif (bukan teks di atas putih), Yellow off by default.
- **Motion:** Controlled Momentum (`power3.out` / `power4.out` / `expo.out`). Fade-up bukan bahasa utama. Pin berat hanya di ≥1024px. Mobile pakai stack vertikal atau swipe rail native. Dengan reduced motion, semua konten tetap bisa dibaca.
- **Anti-template:** tidak ada grid kartu SaaS generik, gradient blob, glass card, WebGL dekoratif, atau pricing card.

---

## 1. Global PASTI Navigation
- **Purpose:** OPEN adalah produk PASTI, bukan microsite terpisah.
- **Main content:** `LayoutHeader` yang sudah ada. Opsional: sub-nav lokal OPEN (Ecosystem / Solutions / e-Auction / Integration / Governance / Cases / Demo) yang muncul setelah hero.
- **CTA:** "Request Demo" di sub-nav, anchor ke section 12.
- **Visual:** Header global tidak diubah. Sub-nav berupa baris metadata tipis dengan indikator Cobalt untuk section aktif.
- **Interaction:** Sub-nav sticky setelah hero lewat. Indikator aktif mengikuti ScrollTrigger; klik = scroll lewat Lenis.
- **Notes:** Jangan bikin header khusus OPEN. Saat halaman live, flip `comingSoon` di `usePlatforms.ts` dan `useNavigation.ts`.

## 2. OPEN Hero
- **Purpose:** Langsung menetapkan bahwa OPEN adalah ecosystem, bukan satu aplikasi.
- **Main content:**
  - **OPEN** (oversized visual mass, seperti di Platforms homepage)
  - **One Procurement Ecosystem Network** · by PASTI
  - Positioning (brief §1): *"OPEN connects procurement, sourcing, e-Auction, vendor management, contracts, catalog, workflows, monitoring, and enterprise integrations in one transparent, integrated, and audit-ready procurement ecosystem."*
- **CTA:** Primary "Request Demo". Secondary text-link "Explore the ecosystem" ke section 4.
- **Visual:** Tipografi OPEN raksasa yang bleed di tepi, satu fragment UI dominan ter-crop, negative space lebar. Signal berupa garis network tipis dengan node kecil, sebagai petunjuk awal alur 9 langkah.
- **Interaction:** Entrance lewat page-ready gate (`usePageReady`) dengan mask reveal di judul. Saat scroll keluar, node-node Signal mulai tersambung sebagai handoff ke section 3.
- **Notes:** Kata "e-Procurement" tidak dipakai sebagai headline. Asset UI asli OPEN **[BUTUH DATA]**; referensi lama ada di `docs/legacy/image/OPEN-PFL.PNG` dan `open.PNG`.

## 3. Procurement Problem → OPEN Solution
- **Purpose:** Menjelaskan kenapa butuh ecosystem, bukan sekadar digitalisasi satu proses.
- **Main content:** State "problem" (proses, vendor, approval, kontrak, dan data yang terpisah-pisah) lalu state "solution" (terhubung dalam satu ecosystem). Kalimat problem statement **[BUTUH DATA]**. Sisi solusi boleh pakai mental model dari brief.
- **CTA:** Tidak ada, supaya alur narasi tidak terputus.
- **Visual:** Satu komposisi yang berubah state. Fragmen-fragmen tidak sejajar dan terpisah, lalu tersusun ke satu grid dan disambung garis Signal. Bukan dua kolom kartu.
- **Interaction:** Desktop: pin pendek (sekitar 1,5 viewport) dengan scrub dari "scattered" ke "connected". Mobile: dua state berurutan.
- **Notes:** Jangan karang statistik masalah. Nada kalem, bukan fear-marketing.

## 4. OPEN End-to-End Ecosystem Flow
- **Purpose:** Section inti positioning: alur procurement ujung ke ujung yang dihubungkan OPEN.
- **Main content:** Alur 9 langkah dari brief §3:
  1. Plan / Request
  2. Sourcing
  3. Vendor
  4. e-Auction / Bidding
  5. Evaluation
  6. Approval
  7. Contract
  8. Catalog / P2P
  9. Invoice / Finance

  Ditambah mental model quote, dan satu baris kecil yang menyatakan bahwa alur ini overview dan implementasi tiap client bisa disesuaikan.
- **CTA:** Langkah yang namanya sama dengan modul di section 5 (Vendor, e-Auction / Bidding, Contract, Catalog / P2P) boleh punya text-link ke modulnya. Langkah lain tanpa link.
- **Visual:** Garis alur horizontal 9 titik, bukan siklus bulat generik. Integration / Governance / Auditability digambar sebagai rail di bawah seluruh alur (lapisan yang menopang semua langkah), bukan langkah ke-10. Garis Signal menyambung tiap titik.
- **Interaction:** Desktop: pinned horizontal; langkah aktif satu per satu mengikuti scroll, garis Signal tergambar progresif (scrub). Mobile: alur vertikal dengan garis Signal di kiri dan scroll natural, tanpa pin.
- **Notes:** e-Procurement **tidak** dipetakan sebagai satu langkah atau hub. Penjelasan per langkah **[BUTUH DATA]**; sementara cukup nama langkahnya saja.

## 5. Core Solutions / Modules
- **Purpose:** Detail tiap modul OPEN. e-Procurement tampil sebagai primary solution, tetapi tetap salah satu dari beberapa modul.
- **Main content:**
  - **01 e-Procurement — End-to-End Digital Procurement** (primary, ruang terbesar, default terbuka)
    - USP: **One Process. Full Visibility. Better Control.**
    - Capabilities: Procurement Planning · Sourcing Management · Vendor Management · Digital Approval · Document Management · Procurement Monitoring · Audit Trail · Contract Management
  - **02 Vendor Management**
  - **03 e-Auction / Bidding**
  - **04 Contract Management**
  - **05 Catalog Management**
  - **06 Collaborative Procurement / P2P**

  Untuk modul 02–06, judul diambil dari brief; deskripsi dan capability **[BUTUH DATA]**.
- **CTA:** Text-link "Request Demo" per modul (prefill minat modul di form). Modul e-Auction juga punya link ke section 6.
- **Visual:** Bukan grid 6 kartu. Index list editorial bernomor 01–06; modul aktif membuka panel berisi satu fragment UI ter-crop dan daftar capability.
- **Interaction:** Desktop: list di kiri sticky, panel di kanan berganti saat scroll/hover dengan crop-shift transition (bukan opacity saja). Mobile: accordion atau swipe rail, target sentuh seukuran jempol.
- **Notes:** Vendor Management dan Contract Management muncul sebagai capability e-Procurement **dan** sebagai modul sendiri, sesuai brief. Pertahankan keduanya; di capability list cukup diberi cross-link ke modul penuhnya. Tidak ada pricing atau tier.

## 6. Dedicated e-Auction Experience
- **Purpose:** Momen signature halaman: modul yang paling dinamis secara visual.
- **Main content:** e-Auction / Bidding, posisinya di alur (langkah 4, setelah Vendor dan sebelum Evaluation), dan fragment UI e-Auction asli **[BUTUH DATA]**. Penjelasan alur lelang **[BUTUH DATA]**.
- **CTA:** "Request Demo" (prefill minat: e-Auction).
- **Visual:** Satu fragment dominan besar. Elemen bid/timer jadi detail tipografi metadata. Kalau belum ada UI asli, angka bid jelas berupa dummy atau tidak ada angka sama sekali.
- **Interaction:** Simulasi ringan yang bersifat ilustratif, misalnya urutan bid berganti mengikuti scroll, dengan easing approved dan tanpa efek bounce. Dengan reduced motion: state akhir statis.
- **Notes:** Angka "Up to 40%" untuk e-Auction **tidak** ditaruh di sini sebagai klaim modul; angka itu milik section 10 bersama konteks case-nya.

## 7. Integration & Architecture
- **Purpose:** Menjawab concern IT enterprise: OPEN terhubung ke sistem yang sudah ada.
- **Main content:** "Enterprise integrations" (dari teks positioning) dan pilar Integration (brief §1). Daftar sistem, arsitektur, dan deployment model **[BUTUH DATA]**.
- **CTA:** Text-link "Talk to our team" ke section 12.
- **Visual:** Diagram arsitektur berlapis, dengan OPEN di tengah dan sistem eksternal sebagai slot generik berlabel placeholder. Garis tipis Cobalt di grid presisi. Tanpa logo pihak ketiga.
- **Interaction:** Garis koneksi tergambar saat masuk viewport; hover di satu layer menyorot jalurnya.
- **Notes:** Jangan sebut nama vendor ERP sebelum dikonfirmasi. Visualnya teknis, tapi bukan "cyberpunk control room".

## 8. Governance, Security & Auditability
- **Purpose:** Lapisan kepercayaan: kontrol, keamanan, jejak audit.
- **Main content:** Dari brief: Governance, Auditability, Audit Trail, Digital Approval, "transparent, integrated, and audit-ready". Detail standar keamanan dan sertifikasi **[BUTUH DATA]**.
- **CTA:** Tidak ada.
- **Visual:** Ledger audit trail sebagai elemen utama (baris log ter-crop dengan timestamp placeholder), bukan ikon gembok.
- **Interaction:** Baris log muncul berurutan mengikuti scroll (stagger dengan easing approved).
- **Notes:** Tidak ada badge sertifikasi atau nama standar (ISO, SOC, dan sejenisnya) sebelum dikonfirmasi.

## 9. Proven Experience / Case Studies
- **Purpose:** Menjawab: *"PASTI sudah mengimplementasikan apa dan untuk siapa?"*
- **Main content:** 5 case dari brief §5:
  - Bank Syariah Indonesia
  - Bank Mandiri
  - Pelindo
  - Lintasarta
  - Indonesia Eximbank / LPEI

  Per case: nama client, lalu konteks, modul/scope, dan tahun **[BUTUH DATA]**.
- **CTA:** "View case" per item hanya kalau nanti ada halaman detail. Untuk sekarang tidak ada.
- **Visual:** Editorial index list (nama client besar sebagai tipografi) atau rail horizontal dengan satu case per frame. Bukan grid logo.
- **Interaction:** Desktop: hover/scroll mengaktifkan case dan membuka detail singkat. Mobile: swipe rail.
- **Notes:** Section ini wajib tampil. Logo client hanya dipakai kalau asset dan izinnya ada **[BUTUH KONFIRMASI]**; tanpa itu, cukup nama dalam bentuk tipografi. Bank Mandiri dan Lintasarta boleh punya penanda kecil yang mengarah ke proof-nya di section 10.

## 10. Business Impact / Proof
- **Purpose:** Menjawab: *"Apa contoh outcome yang pernah tercapai?"* Section ini terpisah dari section 9.
- **Main content:** 4 proof point dari brief §6, masing-masing dengan konteksnya:

  | Angka | Outcome | Konteks (wajib tampil) |
  |---|---|---|
  | Up to 40% | **[BUTUH KONFIRMASI]**: brief tidak menyebut apa yang naik/turun 40% | Contoh integrasi e-Auction / e-Procurement |
  | 67% | Reduction in procurement approval lead time | Case Bank Mandiri |
  | 35% | Improvement in process visibility | Case Bank Mandiri |
  | 100% digital | Approval & contract | Case Lintasarta |

- **CTA:** Tidak ada.
- **Visual:** Angka oversized secara tipografis, satu proof per baris, dengan label case di sebelah atau di bawahnya dalam ukuran yang tetap terbaca (bukan footnote kecil). Bukan kartu statistik.
- **Interaction:** Counter angka boleh dipakai karena angkanya asli; "100% digital" pakai mask reveal. Dengan reduced motion: angka final langsung tampil.
- **Notes:** Ini **CASE-SPECIFIC CLAIMS**. Jangan tampilkan angka tanpa konteks case, jangan bikin headline seperti "OPEN reduces approval time by 67%", dan jangan pernah dibulatkan atau digabung. Jangan digabung dengan section 9.

## 11. Why PASTI Technology
- **Purpose:** Menghubungkan kembali OPEN ke PASTI sebagai builder dan partner implementasi.
- **Main content:** Alasan memilih PASTI **[BUTUH DATA]**. Kandidat sumber: konten "Why Choose Us" yang sudah ada di situs (perlu persetujuan owner untuk dipakai ulang).
- **CTA:** Text-link "About PASTI" ke `/about`.
- **Visual:** Lebih tenang dari section sebelumnya, tipografi editorial, brand mark PASTI kecil.
- **Interaction:** Reveal ringan saja.
- **Notes:** Kalau konten homepage dipakai ulang, framing-nya disesuaikan ke konteks procurement; jangan disalin mentah.

## 12. Request Demo / Lead Form
- **Purpose:** Konversi utama halaman.
- **Main content:** Form dengan field nama, perusahaan, email kerja, telepon, minat modul (multi-select 6 modul + "Full ecosystem"), dan pesan. Field final dan tujuan submit (email, CRM, atau WhatsApp) **[BUTUH KONFIRMASI]**.
- **CTA:** Tombol submit "Request Demo". Alternatif: WhatsApp FAB yang sudah ada.
- **Visual:** Slate Navy, form editorial dengan input bergaris bawah (bukan modal atau glass card). Pilihan modul berbentuk chip.
- **Interaction:** CTA "Request Demo" dari section lain bisa prefill minat modul. Validasi inline dan state sukses yang jelas. Di mobile: input nyaman untuk jempol dan keyboard sesuai jenis field (email/tel).
- **Notes:** Belum ada backend/endpoint di repo. Jangan tampilkan alamat atau email kontak sebelum dikonfirmasi owner.

## 13. Footer
- **Purpose:** Penutup global.
- **Main content:** Footer PASTI yang sudah ada (copy locked). Link OPEN dan e-CORPORATE pakai dot Cobalt.
- **CTA / Visual / Interaction:** Tidak diubah.
- **Notes:** Jangan bikin footer khusus OPEN.

---

## Open items

1. Makna angka "Up to 40%": apa yang membaik/turun? (section 10)
2. Detail per case: konteks, modul, tahun, dan izin pemakaian logo. (section 9)
3. Deskripsi dan capability modul 02–06, serta penjelasan per langkah alur. (section 4–5)
4. Asset UI asli OPEN, terutama e-Procurement dan e-Auction. (section 2, 5, 6)
5. Daftar integrasi, arsitektur, dan standar keamanan. (section 7–8)
6. Isi "Why PASTI Technology". (section 11)
7. Tujuan submit form demo. (section 12)

## Tahap berikutnya

Art direction / UI design per section. Setelah itu baru implementasi: `app/pages/open.vue`, `app/components/open/*`, dan composable konten `useOpen.ts` (mengikuti pola `usePlatforms` / `useTechnology`).

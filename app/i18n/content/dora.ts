import type { DeepPartial } from '~/utils/localize'
import type { DoraData } from '~/composables/useDora'

// DORA (/dora) — Indonesian overlay of useDora(). Text only: the synthetic
// search / dashboard records (file names, types and statuses the code filters
// and compares), export formats, sample-letter codes and the internal
// register stay English in useDora(); shown statuses/types are translated at
// render time (app/i18n/ui/dora.ts). The sample letter itself is Indonesian.
export const DORA_ID: DeepPartial<DoraData> = {
  seo: {
    title: 'DORA — Pengenalan Dokumen & Verifikasi OCR | PASTI',
    description:
      'Framework pengenalan dokumen yang dapat dikonfigurasi untuk digitalisasi berbasis OCR, ekstraksi field terstruktur, verifikasi manusia, pencarian, dan ekspor.'
  },
  subnav: [{ label: 'Ringkasan' }, { label: 'Alur kerja' }, { label: 'OCR' }, { label: 'Verifikasi' }, { label: 'Pencarian' }, { label: 'Integrasi' }],
  sample: {
    fields: [{ label: 'No. Dokumen' }, { label: 'Tanggal' }, { label: 'Perihal' }, { label: 'Nama' }]
  },
  hero: {
    body: 'DORA adalah framework pengenalan dokumen yang dapat dikonfigurasi, membantu organisasi mendigitalkan dokumen, mengekstrak field terstruktur, meninjau hasil OCR, serta membuat data dokumen bisa dicari dan dipakai dalam alur kerja bisnis.',
    facts: ['Digitalisasi berbasis OCR', 'Review oleh manusia', 'Pencarian & ekspor']
  },
  problem: {
    eyebrow: 'Masalah dokumen',
    headline: 'Datanya ada di dokumen. Mengeluarkannya masih manual.',
    lede: 'PDF dan hasil scan datang setiap hari. Masih ada orang yang harus membacanya, mengetik nilainya, memeriksanya, dan mencarinya lagi nanti.',
    items: [
      { name: 'Dibaca manual', body: 'PDF dan gambar hasil scan masih perlu dibaca orang sebelum datanya bisa dipakai.' },
      { name: 'Diketik ulang', body: 'Nilai yang sama dimasukkan ulang dari dokumen ke sistem, satu per satu.' },
      { name: 'OCR salah baca', body: 'Pengenalan teks bisa tertukar antarkarakter, terutama pada halaman hasil scan.' },
      { name: 'Nilai belum dicek', body: 'Data hasil ekstraksi harus divalidasi sebelum bisa diandalkan.' },
      { name: 'Tiap jenis berbeda', body: 'Surat, formulir, dan laporan punya tata letaknya sendiri.' },
      { name: 'Tiap field berbeda', body: 'Yang penting di satu jenis dokumen tidak relevan di jenis lain.' },
      { name: 'Tiap alur berbeda', body: 'Setiap organisasi meninjau dan menyetujui dokumen sesuai SOP-nya sendiri.' },
      { name: 'Sulit dicari lagi', body: 'Dokumen yang tersimpan dan nilainya perlu bisa dicari di kemudian hari.' }
    ]
  },
  core: {
    eyebrow: 'Apa itu DORA',
    headline: 'Inti produk yang dikonfigurasi sesuai dokumen Anda.',
    lede: 'DORA adalah Framework Code Product: inti pengenalan dokumen yang bisa dipakai ulang, dikonfigurasi sesuai jenis dokumen, field bisnis, alur verifikasi, dan SOP setiap organisasi.',
    modules: ['Intake dokumen', 'OCR & pengenalan', 'Ekstraksi field', 'Workspace verifikasi', 'Pencarian & ekspor', 'Dashboard operasional'],
    config: ['Jenis dokumen', 'Template field', 'Field ekstraksi', 'Status verifikasi', 'Penanganan confidence', 'Filter pencarian', 'Format ekspor', 'Peran & hak akses', 'Batas integrasi'],
    not: 'DORA tidak dianggap menggantikan ERP, DMS, atau arsip utama Anda tanpa cakupan integrasi yang disepakati.',
    path: [
      { name: 'Memahami', out: 'Baseline kebutuhan' },
      { name: 'Merancang', out: 'Blueprint fungsional' },
      { name: 'Menyesuaikan', out: 'DORA terkonfigurasi' },
      { name: 'Membangun', out: 'Ekstensi disetujui' },
      { name: 'Integrasi', out: 'Spesifikasi integrasi' },
      { name: 'Deploy', out: 'Rilis & serah terima' }
    ]
  },
  flow: {
    eyebrow: 'Cara kerja DORA',
    headline: 'Dari login ke pencarian, satu jalur tertelusur.',
    lede: 'Sepuluh langkah membawa dokumen dari upload menjadi data siap pakai. Orang dan sistem masing-masing memegang bagiannya.',
    steps: [
      { name: 'Login', actor: 'Pengguna', body: 'Pengguna berwenang masuk ke workspace sesuai perannya.', result: 'Sesi sesuai hak akses pengguna.' },
      { name: 'Upload', actor: 'Operator', body: 'File dipilih dengan jenis dokumen, atau dengan deteksi otomatis.', result: 'File diterima atau ditolak oleh validasi.' },
      { name: 'Validasi intake', actor: 'Sistem', body: 'Jenis file dan aturan batch diperiksa sebelum diproses.', result: 'File valid masuk antrean; yang tidak valid diberi alasan.' },
      { name: 'OCR / pengenalan', actor: 'Sistem', body: 'Teks dibaca dan field diidentifikasi.', result: 'Teks dan field hasil ekstraksi, dengan confidence bila tersedia.' },
      { name: 'Klasifikasi', actor: 'Sistem/Pengguna', body: 'Jenis dokumen dikenali atau ditetapkan.', result: 'Jenis dokumen yang masih bisa dikoreksi.' },
      { name: 'Antrean verifikasi', actor: 'Verifikator', body: 'Dokumen yang menunggu review dibuka dari antrean.', result: 'Preview, field, dan status berdampingan.' },
      { name: 'Review & koreksi', actor: 'Verifikator', body: 'Field dibandingkan dengan gambar sumber dan dikoreksi bila perlu.', result: 'Nilai field yang sudah dicek dan dikoreksi.' },
      { name: 'Keputusan', actor: 'Verifikator', body: 'Verifikasi diselesaikan sesuai alur kerja.', result: 'Status akhir, sesuai konfigurasi.' },
      { name: 'Cari & ekspor', actor: 'Pengguna bisnis', body: 'Pengguna berwenang mencari dokumen dan mengekspor datanya.', result: 'Hasil pencarian atau file ekspor.' },
      { name: 'Monitor', actor: 'Admin / Manajer', body: 'Volume, antrean, dan metrik kualitas dipantau.', result: 'Status operasional terlihat.' }
    ]
  },
  extraction: {
    eyebrow: 'OCR & ekstraksi terstruktur',
    headline: 'Dari halaman menjadi field.',
    lede: 'DORA mengubah isi dokumen yang tidak terstruktur menjadi data field terstruktur, berdasarkan template dokumen yang dikonfigurasi untuk organisasi Anda.',
    caps: [
      { name: 'Intake dokumen', body: 'File PDF, JPG, PNG, dan TIFF, termasuk dokumen multi-halaman, masuk ke alur setelah divalidasi.' },
      { name: 'OCR & pengenalan teks', body: 'Teks dibaca dari dokumen digital maupun gambar hasil scan.' },
      { name: 'Klasifikasi dokumen', body: 'Jenisnya terdeteksi otomatis atau dipilih saat upload — dan bisa dikoreksi saat verifikasi.' },
      { name: 'Ekstraksi field terstruktur', body: 'Nilai seperti nomor dokumen, tanggal, perihal, dan nama diekstrak sesuai template jenis tersebut.' },
      { name: 'Indikasi confidence', body: 'Setiap field punya indikasi confidence, sehingga reviewer tahu mana yang dicek lebih dulu.' }
    ],
    note: 'Field bergantung pada jenis dokumen yang dikonfigurasi. Template, field wajib, dan penanganan confidence ditentukan saat implementasi.'
  },
  verify: {
    eyebrow: 'Verifikasi oleh manusia',
    headline: 'Otomasi dengan kendali manusia.',
    lede: 'Hasil OCR ditinjau, bukan dianggap benar. Setiap field hasil ekstraksi berada di samping posisinya di halaman sumber — dicek, dikoreksi, dan diputuskan oleh orang.',
    steps: [
      { name: 'Buka dari antrean', body: 'Dokumen yang menunggu verifikasi terbuka dengan preview, jenis, dan status.' },
      { name: 'Bandingkan', body: 'Pilih field untuk melihat posisinya di halaman.' },
      { name: 'Tandai', body: 'Field dengan confidence rendah disorot untuk dicek lebih teliti.' },
      { name: 'Koreksi', body: 'Reviewer memperbaiki nilainya; tersimpan dan tampil saat dibuka lagi.' },
      { name: 'Putuskan', body: 'Verifikasi diselesaikan — statusnya mengikuti alur kerja Anda.' }
    ],
    note: 'Penanda muncul di field yang pemetaannya dikonfigurasi. Metode confidence dan aturan review disepakati per implementasi.'
  },
  search: {
    eyebrow: 'Pencarian & ekspor',
    headline: 'Temukan dokumennya. Pakai datanya.',
    lede: 'Nilai hasil ekstraksi bisa dicari. Temukan dokumen berdasarkan teks, nama file, atau nilai field, persempit dengan filter, dan ekspor hasilnya untuk langkah berikutnya dalam proses Anda.',
    filters: ['Teks lengkap', 'Nama file', 'Nilai field', 'Jenis dokumen', 'Status', 'Rentang tanggal', 'Field bisnis terkonfigurasi'],
    note: 'Kolom ekspor, batas, dan hak akses ditentukan per implementasi.'
  },
  dashboard: {
    eyebrow: 'Dashboard operasional',
    headline: 'Tahu yang diproses, menunggu, dan tertahan.',
    lede: 'Volume, antrean verifikasi, kualitas, dan dokumen terbaru dalam satu tampilan — sehingga tim operasional tahu posisi dokumen sebelum antrean menumpuk.',
    processed: { pages: '904 halaman' },
    waiting: { split: 'Terverifikasi 104 · Ditolak 7' },
    quality: { label: 'rata-rata confidence field' },
    widgets: ['Dokumen diproses', 'Menunggu verifikasi', 'Kualitas & confidence', 'Volume 14 hari', 'Antrean perhatian', 'Dokumen terbaru'],
    note: 'Definisi KPI, agregasi, dan pembaruan disepakati per implementasi.'
  },
  model: {
    eyebrow: 'Model dokumen fleksibel',
    headline: 'Dokumen berbeda. Field berbeda. Satu inti yang dapat dikonfigurasi.',
    lede: 'Setiap jenis dokumen punya templatenya sendiri — field, penanda wajib, validasi, penanganan confidence, status, jalur review, serta field pencarian dan ekspor. Jenisnya dikonfigurasi bersama Anda, bukan dianggap sudah jadi.',
    types: [
      {
        name: 'Surat resmi',
        fields: [{ name: 'No. Dokumen', rule: 'Pola' }, { name: 'Tanggal', rule: 'Format tanggal' }, { name: 'Perihal', rule: 'Panjang' }, { name: 'Nama', rule: 'Teks' }],
        statuses: ['Menunggu verifikasi'],
        outcomes: ['Terverifikasi', 'Ditolak'],
        path: 'Review tunggal',
        search: ['No. Dokumen', 'Perihal', 'Nama'],
        export: ['Nama file', 'No. Dokumen', 'Tanggal', 'Perihal', 'Nama']
      },
      {
        name: 'Formulir permohonan',
        fields: [{ name: 'No. Referensi', rule: 'Pola' }, { name: 'Pemohon', rule: 'Teks' }, { name: 'Tanggal permohonan', rule: 'Format tanggal' }, { name: 'Kategori', rule: 'Nilai daftar' }, { name: 'Keterangan', rule: 'Panjang' }],
        statuses: ['Menunggu verifikasi', 'Dalam review'],
        outcomes: ['Terverifikasi', 'Dikembalikan'],
        path: 'Review, lalu persetujuan',
        search: ['No. Referensi', 'Pemohon', 'Kategori'],
        export: ['No. Referensi', 'Pemohon', 'Tanggal permohonan', 'Kategori']
      },
      {
        name: 'Laporan internal',
        fields: [{ name: 'No. Laporan', rule: 'Pola' }, { name: 'Periode', rule: 'Rentang tanggal' }, { name: 'Unit', rule: 'Nilai daftar' }],
        statuses: ['Menunggu verifikasi'],
        outcomes: ['Terverifikasi'],
        path: 'Review tunggal',
        search: ['Teks lengkap', 'No. Laporan', 'Unit'],
        export: ['No. Laporan', 'Periode', 'Unit', 'Teks lengkap']
      }
    ],
    note: 'Contoh konfigurasi. Jenis dan template dokumen ditentukan bersama Anda saat discovery.'
  },
  governance: {
    eyebrow: 'Akses, privasi & tata kelola',
    headline: 'Akses mengikuti peran dan cakupan.',
    lede: 'Siapa yang boleh upload, mengoreksi, memutuskan, mencari, dan mengekspor diatur per peran dan cakupan data. Data sensitif ditangani sesuai kebijakan organisasi Anda.',
    roles: [
      { name: 'Administrator', body: 'Mengelola akses dan konfigurasi.', can: ['Akses & konfigurasi', 'Dashboard'] },
      { name: 'Operator / Uploader', body: 'Mengunggah dokumen dan memantau statusnya.', can: ['Upload', 'Status dokumen'] },
      { name: 'Verifikator / Reviewer', body: 'Meninjau dan mengoreksi field hasil ekstraksi, serta menyelesaikan verifikasi sesuai alur kerja.', can: ['Antrean verifikasi', 'Koreksi field', 'Keputusan verifikasi'] },
      { name: 'Viewer / Pengguna bisnis', body: 'Mencari dan melihat dokumen serta field dalam cakupannya.', can: ['Pencarian', 'Lihat dokumen & field'] },
      { name: 'Klien integrasi', body: 'Bertukar data dengan DORA melalui integrasi yang disepakati, bila ada.', can: ['Integrasi yang disepakati'] }
    ],
    principles: [
      'Akses mengikuti peran dan cakupan data.',
      'Koreksi field dibatasi untuk peran yang diizinkan.',
      'Keputusan verifikasi dibatasi untuk peran berwenang.',
      'Pencarian, preview, dan ekspor mengikuti cakupan yang sama.'
    ],
    policy: 'Data sensitif memerlukan kontrol akses. Aturan masking, retensi, penghapusan, dan ekspor mengikuti kebijakan organisasi Anda dan regulasi yang berlaku.',
    note: 'Baseline peran. Hak akses final disepakati per implementasi.'
  },
  integration: {
    eyebrow: 'Integrasi & enterprise',
    headline: 'Dirancang menyatu dengan sistem Anda.',
    lede: 'Dirancang untuk terintegrasi dengan sistem enterprise melalui kontrak data dan batas integrasi yang disepakati.',
    boundaries: [
      { name: 'Repositori / penyimpanan dokumen', body: 'Mengambil atau menyimpan file dan hasil.' },
      { name: 'Aplikasi bisnis · ERP · DMS', body: 'Menerima field hasil ekstraksi atau status.' },
      { name: 'Identity provider', body: 'Identitas terpusat dan pemetaan peran.' },
      { name: 'Konsumen API', body: 'Mengirim dokumen, meminta hasil atau status.' },
      { name: 'Kanal notifikasi', body: 'Notifikasi antrean atau kegagalan.' }
    ],
    contract: [
      'Sumber kebenaran untuk file, metadata, dan field',
      'Nama, tipe, format, dan pemetaan field',
      'Autentikasi dan otorisasi antarsistem',
      'Penanganan retry, timeout, duplikat, dan error',
      'Jadwal sinkron, monitoring, rekonsiliasi, kepemilikan'
    ],
    note: 'Batas yang memungkinkan, ditentukan per proyek. DORA tidak dianggap menggantikan ERP, DMS, atau sistem arsip.'
  },
  why: {
    eyebrow: 'Kenapa DORA',
    headline: 'Dokumen masuk, data terverifikasi.',
    items: [
      { name: 'Digitalisasi berbasis OCR', body: 'Dokumen digital dan hasil scan menjadi teks.' },
      { name: 'Ekstraksi field terstruktur', body: 'Nilai masuk ke field, sesuai template.' },
      { name: 'Review oleh manusia', body: 'Orang mengecek hasil OCR.' },
      { name: 'Verifikasi visual', body: 'Setiap field ditunjukkan di halaman sumber.' },
      { name: 'Hasil bisa dicari', body: 'Teks dan nilai field bisa ditemukan lagi.' },
      { name: 'Ekspor CSV · Excel · JSON', body: 'Data keluar dalam format siap pakai.' },
      { name: 'Model dokumen fleksibel', body: 'Jenis dan field sesuai dokumen Anda.' },
      { name: 'Pendekatan kustomisasi FCP', body: 'Inti teruji, dibentuk sesuai SOP Anda.' }
    ]
  },
  demo: {
    eyebrow: 'Minta demo',
    headline: 'Jadikan Dokumen Anda Bekerja Seperti Data.',
    body: 'Diskusikan bagaimana DORA dapat dikonfigurasi sesuai jenis dokumen, field ekstraksi, alur verifikasi, dan proses bisnis Anda.',
    volumes: ['Di bawah 1.000 per bulan', '1.000 – 10.000 per bulan', 'Di atas 10.000 per bulan', 'Belum tahu'],
    processes: ['Baca & entri data manual', 'Scan tanpa ekstraksi', 'OCR tanpa tahap review', 'Lainnya'],
    challenges: ['Entri data manual', 'Kesalahan OCR & validasi', 'Banyak jenis dokumen', 'Mencari dokumen lagi', 'Memasukkan data ke sistem lain', 'Lainnya'],
    next: ['Discovery', 'Blueprint', 'Konfigurasi & build', 'Integrasi', 'SIT & UAT', 'Deploy & serah terima']
  }
}

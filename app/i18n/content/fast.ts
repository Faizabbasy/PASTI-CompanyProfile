import type { DeepPartial } from '~/utils/localize'
import type { FastData } from '~/composables/useFast'

// FAST (/fast) — Indonesian overlay of useFast(). Text only: statuses the
// code compares (scenario status, severity names, health, readiness of
// sample orders, constraint scopes, hard/soft names), ids, sample codes and
// the internal capability register stay English in useFast() and are
// translated at render time (app/i18n/ui/fast.ts) where they are shown.
export const FAST_ID: DeepPartial<FastData> = {
  seo: {
    title: 'FAST — Perencanaan & Penjadwalan Produksi | PASTI',
    description:
      'FAST adalah framework perencanaan dan penjadwalan produksi yang dapat dikonfigurasi, membantu manufaktur menyusun jadwal yang layak dijalankan sesuai material, sumber daya, kapasitas, tenaga kerja, dan batasan operasional.'
  },
  subnav: [{ label: 'Ringkasan' }, { label: 'Penjadwalan' }, { label: 'Batasan' }, { label: 'Simulasi' }, { label: 'Monitoring' }, { label: 'Integrasi' }],
  hero: {
    tagline: 'Produksi Anda. Aturan Anda.',
    body: 'FAST adalah framework perencanaan dan penjadwalan produksi yang dapat dikonfigurasi, membantu manufaktur menyusun jadwal yang layak dijalankan sesuai aturan produksi, sumber daya, material, kapasitas, tenaga kerja, dan batasan operasionalnya.',
    facts: ['Perencanaan produksi', 'Penjadwalan kapasitas terbatas', 'Mengikuti aturan Anda']
  },
  complexity: {
    eyebrow: 'Tantangannya',
    headline: 'Kenapa penjadwalan produksi itu rumit.',
    lede: 'Jadwal baru bisa berjalan kalau banyak syarat terpenuhi sekaligus — dan syarat itu berubah setiap hari.',
    factors: [
      { name: 'Production order', body: 'Apa yang harus dibuat, berapa banyak, dan kapan.' },
      { name: 'Routing', body: 'Urutan operasi yang dilalui setiap order.' },
      { name: 'Kesiapan material', body: 'Bahan dan komponen tersedia sebelum operasi dimulai.' },
      { name: 'Kapasitas sumber daya', body: 'Beban yang sanggup ditanggung tiap mesin atau work center.' },
      { name: 'Kalender pabrik', body: 'Hari kerja, hari libur, dan pengecualian kalender.' },
      { name: 'Shift', body: 'Jam kerja setiap lini.' },
      { name: 'Tenaga kerja', body: 'Operator yang tersedia di setiap shift.' },
      { name: 'Keahlian', body: 'Siapa yang berkualifikasi menjalankan sumber daya mana.' },
      { name: 'Setup & changeover', body: 'Waktu untuk berganti dari satu produk ke produk berikutnya.' },
      { name: 'Maintenance & downtime', body: 'Waktu tidak tersedia yang terencana maupun tidak.' },
      { name: 'Prioritas', body: 'Order mendesak dan order yang tidak boleh mundur.' },
      { name: 'Due date', body: 'Komitmen pengiriman di balik setiap order.' },
      { name: 'Ketergantungan operasi', body: 'Apa yang harus selesai sebelum langkah berikutnya bisa dimulai.' }
    ]
  },
  framework: {
    eyebrow: 'Framework Code Product',
    headline: 'Fondasi penjadwalan siap pakai. Dikonfigurasi sesuai produksi Anda.',
    body: 'FAST bukan SaaS generik, dan bukan paket modul kaku yang memaksa proses Anda mengikuti produk. Inti produknya bisa dipakai ulang, sementara aturan, parameter, batas data, integrasi, dan perilaku operasional disesuaikan dengan setiap organisasi.',
    not: ['Bukan SaaS generik', 'Bukan pengganti ERP atau MES', 'Bukan pengembangan custom dari nol', 'Bukan kotak hitam — kendali tetap di planner'],
    core: ['Scheduling Board', 'Validasi batasan', 'Kesiapan material', 'Simulasi skenario', 'Plan vs actual & exception', 'Tata kelola multi-perusahaan'],
    adapt: ['Aturan bisnis', 'Batasan penjadwalan', 'Konfigurasi perusahaan & pabrik', 'Metode produksi', 'Logika routing', 'Logika material', 'Kapasitas sumber daya', 'Tenaga kerja & keahlian', 'Kalender & shift', 'Laporan', 'Integrasi', 'UI / UX', 'Batas data'],
    steps: [
      { name: 'Memahami', body: 'Proses, kendala, SOP, data, batasan, dan KPI Anda.' },
      { name: 'Merancang', body: 'Blueprint, alur kerja, peran, batas data, UI/UX, dan kriteria penerimaan.' },
      { name: 'Menyesuaikan', body: 'Aturan, konfigurasi, parameter, dan pengalaman pengguna.' },
      { name: 'Mengembangkan', body: 'Ekstensi yang Anda butuhkan, sementara inti produk tetap utuh.' },
      { name: 'Integrasi', body: 'FAST terhubung ke ERP, staging database, atau sistem lain dalam cakupan.' },
      { name: 'Deploy', body: 'Pengujian, deployment, serah terima, dan peningkatan berkelanjutan.' }
    ]
  },
  flow: {
    eyebrow: 'Cara kerja FAST',
    headline: 'Dari data sumber menjadi rencana yang bisa dijalankan.',
    lede: 'Sistem Anda tetap menjadi sumber kebenaran. FAST menyusun rencana di atasnya dan mengembalikan hasilnya untuk keputusan berikutnya.',
    steps: [
      { name: 'Sistem sumber / ERP', body: 'Order dan master data tetap di tempatnya.' },
      { name: 'Integrasi & staging', body: 'Data perencanaan masuk melalui batas yang disepakati.' },
      { name: 'Data perencanaan', body: 'Order, routing, material, sumber daya, kalender, dan keahlian, disiapkan untuk perencanaan.' },
      { name: 'Jadwalkan & validasi', body: 'Operasi ditempatkan dan diperiksa terhadap setiap batasan aktif.' },
      { name: 'Tinjau skenario', body: 'Alternatif dibandingkan tanpa mengubah rencana aktif.' },
      { name: 'Publish', body: 'Rencana yang disetujui menjadi jadwal aktif.' },
      { name: 'Sinkron progres', body: 'Progres eksekusi disinkronkan kembali dari lantai produksi.' },
      { name: 'Plan vs actual', body: 'Penyimpangan dan exception muncul beserta tingkat keparahannya.' },
      { name: 'Jadwal ulang', body: 'Penyesuaian disusun sebagai draft, ditinjau, lalu di-publish kembali.' }
    ]
  },
  board: {
    eyebrow: 'Scheduling Board',
    headline: 'Satu board untuk seluruh rencana produksi.',
    lede: 'Sumber daya di satu sumbu, waktu di sumbu lainnya. Tempatkan operasi secara otomatis atau manual — setiap perpindahan diperiksa terhadap aturan yang Anda aktifkan.',
    steps: [
      { name: 'Antrean', body: 'Order yang belum terjadwal menunggu dengan due date, prioritas, dan kesiapannya.' },
      { name: 'Jadwalkan', body: 'Proses penjadwalan menempatkan setiap operasi yang memenuhi syarat, maju atau mundur.' },
      { name: 'Validasi', body: 'Batasan aktif diperiksa. Konflik dan alasan pemblokiran ditandai sebelum ada yang dikonfirmasi.' },
      { name: 'Sesuaikan', body: 'Planner memindahkan operasi yang konflik secara manual dan menyimpan hasilnya sebagai draft.' }
    ],
    features: [
      'Timeline sumber daya / work center',
      'Antrean belum terjadwal, due date & prioritas',
      'Penjadwalan otomatis',
      'Penyesuaian manual drag & drop',
      'Penjadwalan maju dan mundur',
      'Tampilan jam, hari, dan minggu',
      'Validasi sebelum konfirmasi',
      'Konflik & alasan pemblokiran terlihat',
      'Konteks kesiapan material',
      'Operasi terkunci tetap di tempatnya'
    ]
  },
  gantt: {
    downtime: [{ label: 'Maintenance terencana' }],
    ops: [{}, {}, {}, {}, {}, {}, {}, { conflict: 'Bertabrakan dengan maintenance terencana di Work Center 03' }, {}],
    blocked: [{ reason: 'Kekurangan material — ditahan di luar board sampai bahan siap' }]
  },
  constraints: {
    eyebrow: 'Penjadwalan berbasis batasan',
    headline: 'Setiap penempatan diperiksa terhadap aturan Anda.',
    lede: 'Setiap batasan bisa diaktifkan atau dimatikan secara global, per pabrik atau work center, atau di dalam satu skenario — sehingga aturannya sesuai dengan cara operasi Anda berjalan.',
    modes: [
      { body: 'Penjadwal wajib mematuhinya. Tidak ada penempatan yang boleh melanggarnya.' },
      { body: 'Diabaikan saat penempatan — tetapi setiap potensi pelanggaran tetap dicatat sebagai peringatan di Exception Center.' }
    ],
    catalog: [
      { name: 'Horizon perencanaan', body: 'Hanya menjadwalkan di dalam jendela perencanaan.' },
      { name: 'Due date', body: 'Operasi tetap selaras dengan komitmen pengiriman.' },
      { name: 'Mulai paling awal', body: 'Tidak ada yang dimulai sebelum diizinkan.' },
      { name: 'Urutan operasi', body: 'Mengikuti urutan routing dan ketergantungannya.' },
      { name: 'Kesiapan material', body: 'Menahan operasi sampai bahan siap.' },
      { name: 'Ketersediaan sumber daya', body: 'Memperhitungkan downtime dan waktu tidak tersedia.' },
      { name: 'Cegah operasi tumpang tindih', body: 'Satu operasi per sumber daya pada satu waktu.' },
      { name: 'Urutan prioritas', body: 'Order mendesak ditempatkan lebih dulu.' },
      { name: 'Kalender pabrik', body: 'Hanya memakai hari kerja.' },
      { name: 'Shift kerja', body: 'Tetap di dalam jam shift.' },
      { name: 'Skill matrix', body: 'Mencocokkan operasi dengan operator yang berkualifikasi.' },
      { name: 'Ketersediaan tenaga kerja', body: 'Memperhitungkan operator yang bertugas dan yang absen.' },
      { name: 'Hasil jadwal parsial', body: 'Simpan yang muat; sisanya diantrekan beserta alasannya.' }
    ],
    advanced: {
      title: 'Logika produksi lanjutan',
      body: 'Lebih dari sekadar slot, FAST memperhitungkan bagaimana pekerjaan benar-benar bergerak di pabrik Anda.',
      items: [
        { name: 'Ketergantungan routing', body: 'Operasi sebelum dan sesudahnya tetap berurutan di berbagai sumber daya.' },
        { name: 'Parameter waktu proses', body: 'Waktu setup dan changeover masuk ke dalam durasi setiap operasi.' },
        { name: 'Operasi terkunci', body: 'Operasi yang Anda kunci tetap di tempatnya saat jadwal dijalankan ulang.' },
        { name: 'Hasil parsial beserta alasan', body: 'Yang belum bisa ditempatkan tetap di antrean dengan alasan pemblokiran yang bisa ditelusuri.' }
      ]
    }
  },
  readiness: {
    eyebrow: 'Kesiapan produksi',
    headline: 'Siap dijalankan — atau belum, dan apa sebabnya.',
    lede: 'Sebelum operasi mendapat slot, FAST memeriksa apakah material, kapasitas, dan orangnya benar-benar tersedia.',
    states: [{ name: 'Tersedia penuh' }, { name: 'Tersedia sebagian' }, { name: 'Datang tepat waktu' }, { name: 'Kekurangan material' }],
    pillars: [
      { name: 'Material', body: 'Kesiapan dinilai dari data yang sudah Anda kelola.', items: ['Bill of materials', 'Inventori', 'Purchase order & ETA', 'Work in progress', 'Production order berjalan', 'Production order terjadwal'] },
      { name: 'Kapasitas', body: 'Kapasitas berasal dari sumber daya, kalender, dan shift Anda.', items: ['Sumber daya & work center', 'Kapasitas tersedia', 'Utilisasi', 'Bottleneck', 'Kalender & shift', 'Downtime & waktu tidak tersedia'] },
      { name: 'Tenaga kerja', body: 'Operator dan keahliannya menjadi bagian dari rencana, bukan dipikirkan belakangan.', items: ['Operator', 'Skill matrix — level standar vs aktual', 'Shift', 'Ketersediaan', 'Ketidakhadiran', 'Saran operator per order'] }
    ]
  },
  scenarios: {
    eyebrow: 'Simulasi skenario & penjadwalan ulang',
    headline: 'Uji keputusannya sebelum mengubah rencana yang berjalan.',
    lede: 'Simulasi dan draft berjalan di samping jadwal aktif. Tidak ada yang sampai ke produksi sebelum di-publish secara eksplisit.',
    list: [
      { name: 'Produksi aktif', body: 'Jadwal yang sedang dijalankan lantai produksi.' },
      { name: 'Draft', body: 'Board hasil penjadwalan ulang yang disimpan untuk ditinjau.' },
      { name: 'Simulasi A', body: 'Rencana alternatif dengan prioritas berbeda.' },
      { name: 'What-if', body: 'Satu perubahan, diuji secara terpisah.' }
    ],
    objectives: ['Maksimalkan pengiriman tepat waktu', 'Minimalkan setup & changeover', 'Minimalkan work in progress', 'Simulasikan downtime mesin', 'Sisipkan order prioritas', 'Tambah shift lembur'],
    kpis: ['Order tepat waktu', 'Utilisasi', 'Order terlambat', 'Waktu changeover']
  },
  execution: {
    eyebrow: 'Plan vs actual · Exception Center',
    headline: 'Lihat masalahnya. Pahami penyebabnya. Putuskan langkah berikutnya.',
    lede: 'Progres disinkronkan kembali dan dibandingkan dengan rencana di level operasi. Saat ada penyimpangan, semuanya masuk ke satu tempat — beserta tingkat keparahan dan saran langkah berikutnya.',
    fields: ['Rencana mulai / selesai', 'Aktual mulai / selesai', 'Kuantitas rencana', 'Kuantitas terkonfirmasi', 'Sisa kuantitas', 'Status eksekusi', 'Kondisi', 'Update terakhir'],
    categories: ['Kekurangan material', 'Konflik kapasitas', 'Kerusakan mesin', 'Keahlian tidak sesuai', 'Masalah setup / urutan', 'Risiko tanggal kirim', 'Konflik sumber daya', 'Order mendesak', 'Masalah ketergantungan'],
    severity: [
      { body: 'Komitmen berisiko atau lini tidak bisa berjalan.' },
      { body: 'Kemungkinan terlambat atau gangguan signifikan.' },
      { body: 'Buffer terpakai, efisiensi menurun.' },
      { body: 'Penyimpangan kecil dalam batas toleransi.' },
      { body: 'Jejak audit — override, perubahan pengaturan, sinkronisasi data.' }
    ],
    feed: [
      { type: 'Risiko tanggal kirim', note: 'Perkiraan selesai melewati tanggal yang dijanjikan.' },
      { type: 'Konflik kapasitas', note: 'Operasi bertabrakan dengan maintenance terencana.' },
      { type: 'Keahlian tidak sesuai', note: 'Operator berkualifikasi tidak cukup.' },
      { type: 'Masalah setup / urutan', note: 'Changeover lebih lama dari standar.' },
      { type: 'Override manual', note: 'Operasi dipindahkan di board.' }
    ]
  },
  visibility: {
    eyebrow: 'Visibilitas manajemen',
    headline: 'Tampilan untuk setiap peran — dari rencana yang sama.',
    lede: 'Planner, manajer, dan viewer membaca jadwal yang sama di tingkat detail yang mereka butuhkan.',
    views: [
      { name: 'Dashboard eksekutif', body: 'Cakupan perencanaan, rata-rata utilisasi, order terbuka dan belum terjadwal, serta exception kritis dalam sekilas.' },
      { name: 'Kapasitas & bottleneck', body: 'Utilisasi per sumber daya dari waktu ke waktu, dengan sumber daya terpadat ditandai sebagai kandidat bottleneck.' },
      { name: 'Perbandingan skenario', body: 'Indikator utama rencana aktif dan alternatifnya, berdampingan.' },
      { name: 'Laporan & ekspor', body: 'Laporan kinerja produksi, utilisasi kapasitas, dan exception — difilter per skenario, pabrik, dan periode, bisa diekspor ke CSV.' }
    ]
  },
  integration: {
    eyebrow: 'Integrasi & operasional enterprise',
    headline: 'Bekerja dengan sistem Anda, bukan menggantikannya.',
    body: 'FAST tidak menggantikan ERP atau sistem transaksional Anda. Sistem sumber tetap menjadi sumber kebenaran; FAST memakai data perencanaan melalui batas integrasi dan staging yang disepakati.',
    note: 'Metode integrasi, frekuensi pembaruan, rekonsiliasi, dan kepemilikan data disepakati untuk setiap implementasi.',
    chain: [
      { name: 'ERP / sistem sumber', body: 'Order, material, routing, inventori' },
      { name: 'Integrasi & staging', body: 'Batas dan pemetaan yang disepakati' },
      { name: 'FAST', body: 'Perencanaan, penjadwalan, monitoring' }
    ],
    enterprise: [
      { name: 'Multi-perusahaan', body: 'Data dan konfigurasi terpisah per perusahaan.' },
      { name: 'Multi-pabrik', body: 'Pabrik di bawah setiap perusahaan, dengan aturannya sendiri.' },
      { name: 'Peran & hak akses', body: 'Akses planner, manajer, viewer, dan administrator.' },
      { name: 'Data sesuai cakupan', body: 'Setiap pengguna hanya melihat cakupan perusahaan dan pabriknya.' },
      { name: 'Audit log', body: 'Perubahan organisasi dan akses tercatat.' },
      { name: 'Kebaruan data', body: 'Sumber dan sinkronisasi terakhir ditampilkan bila tersedia.' }
    ]
  },
  why: ['Penjadwalan kapasitas terbatas', 'Perencanaan berbasis batasan', 'Penjadwalan sadar material', 'Visibilitas kapasitas', 'Konteks tenaga kerja & keahlian', 'Simulasi skenario', 'Draft penjadwalan ulang', 'Plan vs actual', 'Visibilitas exception', 'Multi-perusahaan / multi-pabrik', 'Siap integrasi', 'Inti produk bisa dikonfigurasi'],
  demo: {
    eyebrow: 'Minta demo',
    headline: 'Susun rencana produksi yang benar-benar bisa dijalankan.',
    body: 'Ceritakan cara Anda merencanakan saat ini dan apa yang selalu membuat jadwal berantakan. Kami akan menunjukkan FAST dengan setup produksi yang mirip dengan milik Anda.',
    challenges: ['Perencanaan manual atau spreadsheet', 'Kapasitas dan bottleneck', 'Kesiapan material', 'Tenaga kerja dan keahlian', 'Penjadwalan ulang yang sering', 'Visibilitas plan vs actual', 'Lainnya']
  }
}

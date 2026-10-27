import type { DeepPartial } from '~/utils/localize'
import type { MatrixData } from '~/composables/useMatrix'

// MATRIX (/matrix) — Indonesian overlay of useMatrix(). Text only: state ids,
// zone ids / areas / restriction keys, sample codes (MTX-…, GR-…), movement
// classes and serial / location states (tone keys the code looks up) and the
// internal register stay English in useMatrix(); the shown classes / states
// are translated at render time (app/i18n/ui/matrix.ts).
export const MATRIX_ID: DeepPartial<MatrixData> = {
  seo: {
    title: 'MATRIX — Manajemen Inventori & Material | PASTI',
    description:
      'MATRIX adalah platform operasional material dan gudang yang terintegrasi untuk visibilitas inventori, ketersediaan material, eksekusi gudang, replenishment, ketertelusuran, dan kontrol operasional.'
  },
  subnav: [{ label: 'Ringkasan' }, { label: 'Intelligence' }, { label: 'Material 360' }, { label: 'Eksekusi' }, { label: 'Gudang' }, { label: 'Tata kelola' }],
  sample: {
    category: 'Valve & perpipaan',
    warehouse: 'Gudang Pusat',
    zone: 'Zona valve',
    criticality: 'Kritis',
    tracking: 'Dilacak per serial',
    movement: 'Pergerakan sedang',
    locations: [
      { path: 'Gudang Pusat / Zona valve / B-03-02' },
      { path: 'Gudang Pusat / Area karantina / Q-01' },
      { path: 'Yard B / Staging / S-04' }
    ],
    planning: [
      { label: 'Reorder point' },
      { label: 'Stok minimum' },
      { label: 'Stok maksimum' },
      { label: 'Lead time', value: '6 minggu' },
      { label: 'Kebutuhan jangka dekat' }
    ],
    ledger: [
      { time: 'Hari 1 · 09:10', movement: 'Penerimaan barang', from: 'Pengiriman pemasok', to: 'Penerimaan', actor: 'Operator Gudang' },
      { time: 'Hari 1 · 14:30', movement: 'Inspeksi → karantina', from: 'Penerimaan', to: 'Area karantina', actor: 'Inspektur' },
      { time: 'Hari 2 · 08:45', movement: 'Putaway', from: 'Penerimaan', to: 'Zona valve B-03-02', actor: 'Operator Gudang' },
      { time: 'Hari 3 · 11:20', movement: 'Reservasi', from: 'Net available', to: 'Permintaan kerja', actor: 'Material Planner' },
      { time: 'Hari 4 · 16:05', movement: 'Kondisi → rusak', from: 'Zona valve', to: 'Rusak', actor: 'Kepala Gudang' }
    ]
  },
  hero: {
    body: 'MATRIX adalah platform operasional material dan gudang terintegrasi yang membantu organisasi memahami material apa yang dimiliki, di mana lokasinya, bagaimana kondisinya, berapa yang benar-benar tersedia, dan tindakan operasional apa yang perlu diambil berikutnya.',
    facts: ['Net availability', 'Eksekusi gudang', 'Pergerakan tertelusur']
  },
  problem: {
    eyebrow: 'Masalah visibilitas material',
    headline: 'Punya stok tidak sama dengan punya material yang siap dipakai.',
    lede: 'Angka total di layar menutupi pertanyaan tim operasional: bisa dipakai atau tidak, di mana, kondisinya apa, dan siapa yang terakhir menyentuhnya?',
    items: [
      { name: 'On hand belum tentu bisa dipakai', body: 'Stok fisik mencakup material yang tidak bisa dikeluarkan hari ini.' },
      { name: 'Reservasi mengambil jatahnya', body: 'Material yang sudah dijanjikan untuk pekerjaan lain mengurangi yang tersedia.' },
      { name: 'Karantina dan kerusakan berpengaruh', body: 'Stok yang sedang diinspeksi atau kondisinya buruk bukan stok siap pakai.' },
      { name: 'Lokasi dan kondisi berpengaruh', body: 'Tahu jumlahnya tanpa tahu di mana dan bagaimana disimpan belum cukup.' },
      { name: 'Pergerakan harus tertelusur', body: 'Setiap penerimaan, transfer, dan pengeluaran mengubah saldo yang kelak dipertanyakan.' },
      { name: 'Kebutuhan memicu kekurangan', body: 'Kebutuhan operasional mendatang bisa melebihi yang benar-benar tersedia.' },
      { name: 'Stok lambat tetap perlu konteks', body: 'Barang yang jarang bergerak mungkin tetap penting untuk disimpan.' }
    ]
  },
  layers: {
    eyebrow: 'Apa itu MATRIX',
    headline: 'Tiga lapisan. Satu model operasional.',
    lede: 'MATRIX menghubungkan pemahaman material, kendali pekerjaan gudang, dan bukti di balik setiap keputusan.',
    items: [
      { name: 'Material Intelligence', scope: ['Master material', 'Stock on hand', 'Material 360', 'Ketersediaan', 'Kekritisan', 'Aging', 'Replenishment'], out: 'Identitas dan kesiapan material, dibandingkan dengan kebutuhan operasional.' },
      { name: 'Warehouse Execution', scope: ['Penerimaan', 'Inspeksi', 'Putaway', 'Permintaan', 'Picking', 'Pengeluaran', 'Transfer', 'Retur', 'Stock count'], out: 'Transaksi gudang tercatat dengan status, referensi, dan dampak saldonya.' },
      { name: 'Governance & Control', scope: ['Persetujuan', 'Akses berbasis peran', 'Maker-checker', 'Audit trail', 'Pelaporan', 'Kontrol interface'], out: 'Keputusan dan perubahan yang bisa ditinjau beserta buktinya.' }
    ],
    cycle: ['Terima', 'Inspeksi', 'Putaway', 'Kelola saldo', 'Penuhi permintaan', 'Keluarkan / retur', 'Hitung & rekonsiliasi', 'Pantau exception'],
    principle: 'Penerimaan yang masih diinspeksi tidak dianggap stok terposting sampai dikonfirmasi. Net availability selalu memperhitungkan reservasi, karantina, dan kerusakan.'
  },
  intelligence: {
    eyebrow: 'Material intelligence',
    headline: 'Baca setiap status material, bukan hanya totalnya.',
    lede: 'Pilih satu status untuk melihat pengaruhnya pada apa yang bisa dilakukan satu material untuk operasional.',
    states: [
      { label: 'Stock on hand', body: 'Semua yang ada secara fisik di berbagai lokasi — titik awal, bukan jawabannya.' },
      { label: 'Direservasi', body: 'Jumlah yang sudah dialokasikan ke permintaan; masih on hand tapi tidak lagi bebas.' },
      { label: 'Karantina', body: 'Ditahan untuk inspeksi atau keputusan; tidak dihitung sampai dilepas.' },
      { label: 'Rusak', body: 'Tercatat dalam kondisi buruk; tetap terlihat, tidak pernah dihitung bisa dipakai.' },
      { label: 'Net available', body: 'On hand dikurangi reservasi, karantina, dan rusak — yang bisa dikeluarkan sekarang.' },
      { label: 'Lokasi', body: 'Di mana setiap jumlah berada, dari gudang ke zona sampai bin.' },
      { label: 'Lot / serial', body: 'Unit mana yang punya status apa, untuk material yang dilacak per serial atau lot.' },
      { label: 'Ketersediaan kritis', body: 'Net available dibandingkan kebutuhan jangka dekat — dan kekurangannya.' },
      { label: 'Replenishment', body: 'Parameter perencanaan yang menandai kapan stok perlu ditinjau.' },
      { label: 'Aging / surplus', body: 'Sudah berapa lama material tidak bergerak, dan apakah perlu keputusan.' }
    ]
  },
  m360: {
    eyebrow: 'Material 360',
    headline: 'Satu material. Satu tampilan operasional.',
    lede: 'Identitas, lokasi, unit, saldo, kesiapan, perencanaan, dan riwayat — ditinjau sebagai satu objek, bukan enam layar.',
    steps: [
      { name: 'Identitas', body: 'Kode, deskripsi, kategori, kekritisan, dan metode pelacakan.' },
      { name: 'Lokasi & serial', body: 'Di mana setiap jumlah berada dan status setiap unit.' },
      { name: 'Komposisi stok', body: 'On hand terbagi menjadi reservasi, karantina, rusak, dan net available.' },
      { name: 'Kesiapan', body: 'Net available diperiksa terhadap kebutuhan jangka dekat.' },
      { name: 'Parameter perencanaan', body: 'Reorder point, min / max, dan lead time di balik peninjauan.' },
      { name: 'Riwayat pergerakan', body: 'Setiap perubahan saldo, berurutan, beserta buktinya.' }
    ]
  },
  availability: {
    eyebrow: 'Dari ketersediaan ke tindakan',
    headline: 'Lihat kekurangannya. Pahami risikonya. Tinjau tindakannya.',
    lede: 'Eksposur kritis, kekurangan, lead time, dan pasokan masuk menjadi item yang ditinjau seseorang — replenishment tetap di bawah kendali pengguna dan tata kelola.',
    incoming: { eta: 'Minggu 3', ref: 'Purchase order terbuka' },
    recommendation: { status: 'Menunggu tinjauan' },
    note: 'Rekomendasi adalah usulan untuk ditinjau. MATRIX tidak membuat pembelian sendiri.'
  },
  aging: {
    eyebrow: 'Aging, surplus & deadstock',
    headline: 'Stok lama butuh keputusan, bukan asumsi.',
    lede: 'Rentang umur dan kelas pergerakan memunculkan kandidat surplus. Pengaman kekritisan menjaga material penting keluar dari tinjauan disposal, dan setiap keputusan meninggalkan bukti.',
    bands: ['0–90 hari', '91–180 hari', '181–365 hari', '365+ hari'],
    items: [
      { name: 'Kit mechanical seal', last: 'Lebih dari setahun lalu' },
      { name: 'Pressure gauge 0–100 bar', last: 'Lebih dari setahun lalu' },
      { name: 'Impeller pompa, cadangan', last: 'Lebih dari setahun lalu' },
      { name: 'Set gasket spiral-wound', last: 'Delapan bulan lalu' },
      { name: 'Rakitan selang hidrolik', last: 'Empat bulan lalu' }
    ],
    evidence: [
      { label: 'Status tinjauan', value: 'Kandidat surplus · sedang ditinjau' },
      { label: 'Alasan', value: 'Tidak ada pergerakan selama periode tinjauan' },
      { label: 'Penyetuju', value: 'Approver / Supervisor' },
      { label: 'Tindakan', value: 'Menunggu keputusan' },
      { label: 'Riwayat', value: 'Tercatat di audit trail' }
    ]
  },
  execution: {
    eyebrow: 'Eksekusi gudang',
    headline: 'Dari dok penerimaan sampai lembar hitung.',
    lede: 'Setiap tugas gudang terhubung dengan dampak saldo dan buktinya — sehingga catatan mengikuti material.',
    steps: [
      { name: 'Terima', controls: ['Konteks PO / baris pengiriman', 'Jumlah vs yang diharapkan', 'Pencatatan serial / lot', 'Pencatatan selisih', 'Dokumen dan foto'] },
      { name: 'Inspeksi', controls: ['Keputusan inspeksi', 'Terima, karantina, atau tolak', 'Dampak saldo tampil sebelum konfirmasi', 'Tidak masuk on hand sebelum dikonfirmasi'] },
      { name: 'Putaway', controls: ['Lokasi tujuan', 'Cek kapasitas', 'Cek batasan penyimpanan', 'Kendali tugas'] },
      { name: 'Permintaan', controls: ['Konteks pekerjaan', 'Alokasi dari net available', 'Status persetujuan', 'Status pemenuhan'] },
      { name: 'Picking', controls: ['Picking berbasis lokasi', 'Konfirmasi serial / lot', 'Penanganan short-pick'] },
      { name: 'Keluarkan', controls: ['Dikeluarkan sesuai permintaan', 'Saldo berkurang dengan referensi', 'Tercatat di ledger pergerakan'] },
      { name: 'Transfer / retur', controls: ['Antarlokasi atau antargudang', 'Retur beserta kondisinya', 'Saldo sebelum / sesudah'] },
      { name: 'Hitung', controls: ['Input blind count', 'Investigasi selisih', 'Alur penyesuaian dengan persetujuan'] }
    ]
  },
  explorer: {
    eyebrow: 'Warehouse explorer',
    headline: 'Tahu di mana materialnya. Tahu apakah memang di situ tempatnya.',
    lede: 'Telusuri gudang menurut hierarki, lihat okupansi dan kapasitas per zona, dan cek batasan penyimpanan sebelum material dipindahkan.',
    warehouse: 'Gudang Pusat',
    zones: [
      { name: 'Penerimaan & staging', capacity: '24 posisi', held: 'Pengiriman masuk menunggu inspeksi' },
      { name: 'Zona valve', capacity: '48 bin', held: 'MTX-0412 Ball valve 2 in · 10 EA di B-03-02' },
      { name: 'Suku cadang rotating', capacity: '36 bin', held: 'MTX-0455 Impeller pompa, cadangan · 3 EA' },
      { name: 'Zona instrumen', capacity: '40 bin', held: 'MTX-0307 Pressure gauge · 6 EA' },
      { name: 'Area karantina', capacity: '12 posisi', held: 'MTX-0412 Ball valve 2 in · 2 EA menunggu inspeksi' },
      { name: 'Gudang B3', capacity: '10 posisi', held: 'Khusus barang berbahaya yang disetujui' },
      { name: 'Gudang umum', capacity: '60 bin', held: 'MTX-0218 Kit mechanical seal · 4 EA' }
    ],
    restrictions: {
      standard: 'Penyimpanan standar',
      controlled: 'Lingkungan terkendali',
      hazardous: 'Berbahaya',
      quarantine: 'Karantina'
    }
  },
  governance: {
    eyebrow: 'Ketertelusuran & tata kelola',
    headline: 'Setiap pergerakan meninggalkan bukti.',
    lede: 'Ledger pergerakan menunjukkan apa yang mengubah saldo; audit trail menunjukkan siapa mengubah apa, kapan, dan mengapa. Persetujuan dan laporan ada di catatan yang sama.',
    audit: [
      { time: 'Hari 4 · 16:05', actor: 'Kepala Gudang', action: 'Kondisi diubah', before: 'Bisa dipakai 1', after: 'Rusak 1' },
      { time: 'Hari 4 · 10:40', actor: 'Approver', action: 'Penyesuaian disetujui', object: 'Hitung C-0011', after: 'Disetujui' },
      { time: 'Hari 3 · 15:12', actor: 'Approver', action: 'Permintaan dikembalikan dengan alasan', before: 'Diajukan', after: 'Dikembalikan' },
      { time: 'Hari 3 · 11:20', actor: 'Material Planner', action: 'Reservasi dibuat', before: 'Direservasi 0', after: 'Direservasi 5' }
    ],
    controls: [
      { name: 'Akses berbasis peran', body: 'Akses dan navigasi mengikuti tanggung jawab setiap pengguna.' },
      { name: 'Maker-checker', body: 'Yang menyiapkan bukan yang menyetujui.' },
      { name: 'Wewenang persetujuan', body: 'Siapa boleh menyetujui apa sudah dikonfigurasi, bukan diimprovisasi.' },
      { name: 'Pemisahan tugas', body: 'Tugas yang saling bertentangan dipegang peran berbeda.' },
      { name: 'Alasan penolakan', body: 'Permintaan yang dikembalikan selalu menyertakan alasan.' },
      { name: 'Bukti keputusan', body: 'Setiap keputusan menyimpan alasan, penyetuju, dan referensinya.' }
    ],
    reports: ['Stock on hand', 'Ledger pergerakan stok', 'Ketersediaan kritis', 'Di bawah reorder point', 'Aging & surplus', 'Stok karantina & rusak', 'Status penerimaan', 'Tinjauan replenishment'],
    roles: ['Operator Gudang', 'Kepala Gudang', 'Material Planner', 'Approver / Supervisor', 'Manajemen / Audit']
  },
  integration: {
    eyebrow: 'Integrasi & implementasi',
    headline: 'Terhubung ke ERP Anda. Diterapkan dengan terkendali.',
    lede: 'Transaksi inventori dipertukarkan melalui interface yang disepakati, dipantau, dan direkonsiliasi — dan peluncurannya mengikuti blueprint yang disetujui.',
    transactions: ['Penerimaan barang', 'Pengeluaran material', 'Transfer', 'Retur', 'Saldo stok', 'Hasil penyesuaian'],
    controls: ['Validasi', 'Log error', 'Retry', 'Idempotency', 'Rekonsiliasi', 'Migrasi data'],
    phases: [
      { name: 'Blueprint', body: 'Validasi kebutuhan, proses, peran, lokasi gudang, data, integrasi, dan kriteria penerimaan.' },
      { name: 'Konfigurasi & build', body: 'Konfigurasi proses, model data, interface, laporan, peran, persetujuan, dan exception.' },
      { name: 'Migrasi & validasi', body: 'Petakan data, jalankan uji migrasi, bersihkan, rekonsiliasi, dan validasi bersama pengguna.' },
      { name: 'Uji & pelatihan', body: 'Uji alur operasional, interface, kontrol, keamanan, dan kesiapan pengguna.' },
      { name: 'Cutover & stabilisasi', body: 'Jalankan cutover yang disetujui, pantau, selesaikan isu, dan serah terima.' }
    ],
    note: 'Cakupan interface, kontrak data, jadwal, dan kriteria penerimaan mengikuti blueprint yang disetujui. MATRIX tidak dianggap langsung plug-and-play dengan semua ERP.'
  },
  why: ['Visibilitas material', 'Net availability', 'Material 360', 'Eksekusi gudang', 'Ketersediaan kritis', 'Tinjauan replenishment', 'Kontrol aging & surplus', 'Ketertelusuran pergerakan', 'Bukti audit', 'Maker-checker & persetujuan', 'Pelaporan', 'Siap integrasi', 'Dikonfigurasi lewat blueprint'],
  demo: {
    eyebrow: 'Minta demo',
    headline: 'Tahu apa yang Anda punya. Tahu apa yang bisa dipakai. Tahu langkah berikutnya.',
    body: 'Ceritakan cara gudang Anda berjalan saat ini dan di mana kepastian material sering hilang. Kami akan menunjukkan MATRIX dengan setup yang mirip dengan milik Anda.',
    warehouses: ['1', '2 – 5', '6 – 20', 'Lebih dari 20'],
    challenges: ['Akurasi stok', 'Stok bisa dipakai vs on hand', 'Kekurangan material kritis', 'Stok lambat & surplus', 'Kendali tugas gudang', 'Ketertelusuran & audit', 'Integrasi ERP', 'Lainnya']
  }
}

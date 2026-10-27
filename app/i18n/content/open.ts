import type { DeepPartial } from '~/utils/localize'
import type { OpenData } from '~/composables/useOpen'

// Indonesian overlay for useOpen() — only the English parts of the deck copy
// are translated (the supporting copy is already Indonesian). Kept as-is
// because the code compares them: advantage.columns 'OPEN',
// procurement.workflow 'e-Auction', vendor.lifecycle 'Blacklist' (shown via
// t() in the component), problem.questions keys, ids.
export const OPEN_ID: DeepPartial<OpenData> = {
  seo: {
    title: 'OPEN — Ekosistem Procurement yang Dapat Dikustomisasi | PASTI',
    description:
      'OPEN adalah framework procurement siap kembangkan yang menghubungkan pengadaan, vendor, katalog, tata kelola, persetujuan, monitoring, dan integrasi enterprise dalam satu ekosistem.'
  },
  hero: {
    statement: 'Framework sistem procurement yang dapat dikustomisasi, dibangun di sekitar bisnis Anda.',
    origin: 'Awalnya dikembangkan oleh PASTI Technology',
    connects: ['Proses', 'Orang', 'Persetujuan', 'Vendor', 'Data', 'Dokumen', 'Tata Kelola'],
    lifecycle: ['Permintaan', 'Evaluasi', 'Persetujuan', 'Lelang', 'Kontrak', 'Penutupan'],
    rail: [
      { label: 'Alur Persetujuan', body: 'Terstruktur & Transparan' },
      { label: 'Status Siklus', body: 'Terlihat Real-time' },
      { label: 'Akses Berbasis Peran', body: 'Akses Tepat untuk Setiap Peran' },
      { label: 'Aturan Bisnis', body: 'Kebijakan Diterapkan Konsisten' },
      { label: 'Audit Trail', body: 'Terlacak dari Awal hingga Akhir' }
    ]
  },
  problem: {
    title: ['Procurement sudah terlalu', 'rumit untuk dikelola manual.'],
    pressures: ['Lebih banyak orang.', 'Lebih banyak vendor.', 'Lebih banyak approval.', 'Lebih banyak dokumen.', 'Lebih banyak aturan.', 'Lebih banyak risiko.'],
    symptoms: ['Banyak Pemangku Kepentingan', 'Informasi Tersebar', 'Persetujuan Manual', 'Data Terpisah', 'Risiko Kesalahan Tinggi'],
    verdict: ['Prosesnya berjalan —', 'tapi visibilitasnya tidak.'],
    realTitle: ['Masalahnya bukan hanya', 'efisiensi procurement.'],
    needs: ['visibilitas proses', 'tata kelola', 'akuntabilitas']
  },
  notSaas: {
    title: ['OPEN bukan', 'sekadar SaaS lain.'],
    differs: ['Kebijakan procurement', 'Matriks persetujuan', 'Struktur organisasi', 'ERP', 'Ekosistem vendor', 'Kebutuhan tata kelola'],
    saas: ['Berlangganan', 'Konfigurasi', 'Pakai'],
    open: ['Pahami', 'Rancang', 'Kustomisasi', 'Kembangkan', 'Integrasikan', 'Terapkan'],
    line: ['Sistem yang menyesuaikan bisnis Anda.', 'Bukan sebaliknya.']
  },
  framework: {
    title: ['Framework procurement', 'yang siap dikembangkan.'],
    foundation: [
      'Arsitektur Inti',
      'Logika Bisnis',
      'Workflow Engine',
      'Model Peran & Akses',
      'Framework Persetujuan',
      'Audit Trail',
      'Notification Engine',
      'Manajemen Dokumen',
      'Modul Procurement'
    ],
    tagline: ['Satu framework.', 'Banyak kemungkinan.'],
    layers: [
      { label: 'Framework OPEN', body: 'Fondasi fungsional siap pakai dengan arsitektur, logika, dan praktik terbaik yang teruji.' },
      { label: 'Bisnis Anda', body: 'Proses, kebijakan, struktur, orang, dan ekosistem Anda.' },
      { label: 'Sistem Procurement Anda', body: 'Sistem yang sesuai dengan bisnis Anda, memberi nilai, dan tumbuh bersama Anda.' }
    ],
    adaptedBy: ['Proses', 'Tata Kelola', 'Peran & Persetujuan', 'Integrasi', 'UI / UX', 'Aturan Bisnis']
  },
  ecosystem: {
    title: ['Satu ekosistem.', 'Banyak fungsi procurement.'],
    nodes: [
      { label: 'Permintaan', body: 'Identifikasi kebutuhan dan pembuatan permintaan' },
      { label: 'Procurement', body: 'Perencanaan & inisiasi proses' },
      { label: 'Vendor', body: 'Manajemen, kualifikasi & seleksi vendor' },
      { label: 'HPS / Evaluasi', body: 'Estimasi anggaran (HPS), evaluasi teknis & harga' },
      { label: 'Lelang', body: 'Proses e-Auction / e-Bidding' },
      { label: 'Persetujuan', body: 'Persetujuan & tata kelola sesuai matriks wewenang' },
      { label: 'Kontrak', body: 'Pembuatan kontrak & perjanjian' },
      { label: 'Katalog', body: 'Katalog kontrak & katalog e-Commerce' },
      { label: 'Pembelian', body: 'Purchase order & transaksi' },
      { label: 'Pembayaran', body: 'Verifikasi invoice & pembayaran' }
    ],
    components: [
      { label: 'Procurement Non-Katalog', body: 'Proses procurement end-to-end untuk item non-katalog' },
      { label: 'Manajemen Vendor', body: 'Kelola seluruh siklus hidup dan kinerja vendor' },
      { label: 'Manajemen Katalog', body: 'Katalog kontrak & katalog e-Commerce untuk pembelian yang efisien' }
    ],
    pillars: [
      { label: 'Tata Kelola Terintegrasi', body: 'Aturan, persetujuan, SLA, notifikasi & audit trail' },
      { label: 'Visibilitas Real-time', body: 'Status, progres, dan kinerja secara real-time' },
      { label: 'Aman & Terkontrol', body: 'Akses berbasis peran dan keamanan data' },
      { label: 'Fleksibel & Terintegrasi', body: 'Siap terintegrasi dengan ERP, keuangan, inventori, dan lainnya' },
      { label: 'Data & Insight', body: 'Keputusan berbasis data dengan analitik & pelaporan' }
    ]
  },
  procurement: {
    tagline: 'Workflow procurement end-to-end',
    title: ['Procurement', 'End-to-end.'],
    capabilities: [
      'Perencanaan & Permintaan',
      'Sourcing & Partisipasi',
      'Evaluasi (Teknis & Harga)',
      'e-Auction (Penawaran Kompetitif)',
      'Persetujuan & Tata Kelola',
      'Kontrak & Perjanjian',
      'Pembelian, Penerimaan & Pembayaran',
      'Penutupan & Kinerja'
    ],
    workflow: [
      { label: 'Perencanaan & Permintaan' },
      {},
      { label: 'Rekomendasi Vendor' },
      {},
      { label: 'Evaluasi Teknis' },
      { label: 'Evaluasi Harga' },
      {},
      { label: 'QA / Kepatuhan' },
      { label: 'Persetujuan' },
      { label: 'Kontrak' },
      {},
      { label: 'Pembayaran' }
    ]
  },
  vendor: {
    label: 'Manajemen Vendor',
    tagline: 'Registrasi, verifikasi & kinerja vendor',
    title: ['Kelola siklus hidup vendor.', 'Bukan sekadar daftar vendor.'],
    lifecycle: [
      { label: 'Registrasi' },
      { label: 'Seleksi' },
      { label: 'Scoring / Akreditasi' },
      { label: 'Pemeliharaan' },
      { label: 'Pembaruan Data' },
      { label: 'Kinerja' },
      { label: 'Monitoring' },
      { label: 'Perpanjangan' },
      {}
    ],
    capabilities: [
      'Registrasi Vendor',
      'Verifikasi & Akreditasi',
      'Klasifikasi & Scoring Vendor',
      'Monitoring Kinerja',
      'Blacklist & Perpanjangan',
      'Analitik & Insight Vendor'
    ],
    line: ['Satu data vendor.', 'Perjalanan vendor yang utuh.']
  },
  catalog: {
    label: 'Manajemen Katalog',
    tagline: 'Katalog kontrak & katalog e-Commerce',
    title: ['Ubah hasil procurement', 'menjadi pembelian terkontrol.'],
    types: [
      { label: 'Katalog Kontrak' },
      { label: 'Katalog E-Commerce', flow: ['Vendor', 'Review', 'Persetujuan', 'Publikasi', 'Pembelian'] }
    ],
    controlled: [
      { label: 'Item' },
      { label: 'Vendor' },
      { label: 'Harga' },
      { label: 'Ketersediaan' },
      { label: 'Masa Berlaku' }
    ],
    capabilities: [
      'Manajemen Katalog Kontrak',
      'Manajemen Katalog e-Commerce',
      'Manajemen Harga & Ketersediaan',
      'Persetujuan & Tata Kelola Katalog',
      'Analitik & Insight Penggunaan Katalog',
      'Integrasi dengan Procurement'
    ],
    line: ['Dari sourcing hingga pembelian —', 'terhubung.']
  },
  modulesIntro: {
    title: ['Tiga ekosistem', 'procurement inti.']
  },
  auction: {
    title: ['Lebih dari sekadar', 'lelang online.'],
    line: ['Kompetitif lewat proses.', 'Transparan sejak dirancang.'],
    steps: [
      { label: 'Buat', body: 'Penyiapan lelang & penawaran' },
      { label: 'Undang', body: 'Partisipasi vendor terkualifikasi' },
      { label: 'Tawar', body: 'Penawaran kompetitif real-time' },
      { label: 'Negosiasi' },
      { label: 'Peringkat', body: 'Perbandingan penawaran yang transparan' },
      { label: 'Tutup', body: 'Penutupan lelang otomatis' },
      { label: 'Arsip', body: 'Catatan lelang & negosiasi' },
      { label: 'Telusuri', body: 'Riwayat aktivitas lengkap' }
    ],
    capabilities: [
      { label: 'Buat Lelang & Buat Penawaran' },
      { label: 'Mode Negosiasi' },
      {},
      { label: 'Dashboard Monitoring' },
      { label: 'Laporan & Riwayat' },
      { label: 'Administrasi' }
    ],
    principles: [
      { label: 'Adil & Kompetitif' },
      { label: 'Transparan & Dapat Diaudit' },
      { label: 'Proses Efisien' },
      { label: 'Terintegrasi' },
      { label: 'Keputusan Berbasis Data' }
    ]
  },
  governance: {
    title: ['Tata kelola tidak seharusnya terjadi setelah proses.', 'Tata kelola harus ada di dalam proses.'],
    capabilities: [
      { label: 'Workflow Persetujuan' },
      { label: 'Peran & Akses' },
      { label: 'Aturan Bisnis' },
      { label: 'Kontrol Dokumen' },
      { label: 'Audit Trail' },
      { label: 'Notifikasi' },
      { label: 'SLA' },
      { label: 'Kepatuhan' }
    ],
    embedded: [
      { label: 'Permintaan' },
      { label: 'Persetujuan' },
      { label: 'Validasi' },
      { label: 'Eksekusi' },
      { label: 'Penyelesaian' }
    ],
    decision: 'Setiap keputusan penting punya proses yang jelas di baliknya.',
    approvalTitle: ['Dari persetujuan manual', 'ke workflow yang terkontrol.'],
    approvalFeatures: [
      { label: 'Persetujuan Berjenjang' },
      { label: 'Matriks Wewenang' },
      { label: 'Persetujuan Berurutan' },
      { label: 'Penugasan Berbasis Peran' },
      { label: 'Notifikasi Persetujuan' },
      { label: 'Pelacakan Status' },
      { label: 'Delegasi / Peran Pengganti' }
    ],
    approvalFlow: [
      { label: 'Permintaan' },
      { label: 'Reviewer' },
      { label: 'Approver 1' },
      { label: 'Approver 2' },
      { label: 'Persetujuan Akhir' },
      { label: 'Selesai' }
    ],
    approvalShows: ['Siapa', 'Apa', 'Kapan', 'Status', 'Langkah Lanjut'],
    auditTitle: ['Jika terjadi di dalam sistem,', 'pasti ada jejaknya.'],
    auditFields: ['User', 'Aksi', 'Waktu', 'Status', 'Dokumen', 'Riwayat Aktivitas', 'Riwayat Persetujuan'],
    auditQuote: ['Dari “Siapa yang menyetujui ini?”', 'menjadi jawaban yang terlacak.']
  },
  visibility: {
    title: ['Jangan menunggu laporan.', 'Lihat prosesnya saat sedang terjadi.'],
    items: ['Status Procurement', 'Aktivitas Lelang', 'Kinerja Vendor', 'Progres Persetujuan', 'Status Kontrak', 'Monitoring Proses', 'Laporan Manajemen'],
    line: ['Satu tampilan.', 'Banyak aktivitas procurement.']
  },
  integration: {
    title: ['OPEN tidak harus menggantikan', 'ekosistem Anda yang sudah ada.'],
    targets: [
      { label: 'ERP' },
      { label: 'Sistem Keuangan' },
      { label: 'Sistem Procurement' },
      { label: 'Manajemen Aset' },
      { label: 'Identity / LDAP' },
      { label: 'Tanda Tangan Digital' },
      { label: 'Aplikasi Pihak Ketiga' }
    ],
    approaches: ['API', 'Web Service', 'Integrasi Sistem']
  },
  security: {
    title: ['Data procurement membutuhkan', 'akses yang terkontrol.'],
    items: [
      { label: 'Akses Berbasis Peran' },
      { label: 'Manajemen User' },
      { label: 'Single Sign-On' },
      { label: 'Pencatatan Aktivitas' },
      { label: 'HTTPS' },
      { label: 'Kunci Layar Otomatis' },
      { label: 'Backup & Restore' }
    ],
    quote: ['Akses terkontrol.', 'Aktivitas terlacak.']
  },
  customization: {
    title: ['Proses Anda unik.', 'OPEN menyesuaikannya.'],
    areas: [
      { label: 'Proses Bisnis' },
      { label: 'Matriks Persetujuan' },
      { label: 'Peran & Akses' },
      { label: 'Aturan Bisnis' },
      { label: 'Metode Procurement' },
      { label: 'UI / UX' },
      { label: 'Laporan' },
      { label: 'Integrasi' },
      { label: 'Struktur Data' }
    ],
    line: ['Kami tidak meminta bisnis Anda mengikuti software.', 'Kami mengembangkan software di sekitar bisnis Anda.'],
    implTitle: ['Dari framework', 'menjadi sistem Anda yang berjalan.'],
    phases: [
      { label: 'Discover', body: 'Memahami bisnis & proses procurement Anda.' },
      { label: 'Design', body: 'Memetakan workflow, tata kelola & kebutuhan.' },
      { label: 'Customize', body: 'Menyesuaikan OPEN dengan organisasi Anda.' },
      { label: 'Develop', body: 'Membangun dan mengintegrasikan fungsi yang dibutuhkan.' },
      { label: 'UAT', body: 'Validasi bersama business users.' },
      { label: 'Deploy', body: 'Pelatihan, migrasi & go-live.' }
    ],
    scope: [
      { label: 'Instalasi / Konfigurasi' },
      { label: 'Kustomisasi Bisnis' },
      { label: 'UAT' },
      { label: 'Form / Laporan' },
      { label: 'Pelatihan' },
      { label: 'Migrasi Data Vendor' },
      { label: 'Dokumentasi' },
      { label: 'Laporan Implementasi' }
    ]
  },
  advantage: {
    title: ['Satu framework.', 'Dibangun di sekitar organisasi Anda.'],
    items: [
      { label: 'Fondasi Siap Pakai', body: 'Kapabilitas procurement yang sudah terstruktur.' },
      { label: 'Dapat Dikustomisasi', body: 'Menyesuaikan proses dan tata kelola Anda.' },
      { label: 'End-to-End', body: 'Dari procurement hingga kontrak, pembelian, dan pembayaran.' },
      { label: 'Siap Tata Kelola', body: 'Persetujuan, akses, audit & workflow.' },
      { label: 'Siap Integrasi', body: 'Dirancang untuk bekerja dengan ekosistem Anda yang sudah ada.' },
      { label: 'Skalabel', body: 'Dapat berkembang seiring perubahan kebutuhan bisnis.' }
    ],
    compareTitle: ['Memilih fondasi yang tepat', 'untuk perjalanan procurement Anda.'],
    columns: ['SaaS Tradisional', 'Bangun dari Nol'],
    rows: [
      { label: 'Fondasi Siap Pakai' },
      { label: 'Proses Custom', values: ['Terbatas'] },
      { label: 'Tata Kelola Custom', values: ['Terbatas'] },
      { label: 'Titik Awal Pengembangan', values: ['Produk', 'Kosong', 'Framework'] },
      { label: 'Aturan Bisnis', values: ['Dapat dikonfigurasi', 'Dibangun', 'Dikustomisasi'] },
      { label: 'Integrasi', values: ['Tergantung', 'Dibangun', 'Dikembangkan'] },
      { label: 'Waktu Pengembangan', values: ['Cepat', 'Lama', 'Titik awal lebih cepat'] }
    ],
    difference: ['SaaS memberi Anda produk.', 'OPEN memberi Anda fondasi untuk membangun sistem Anda.'],
    saasFlow: [
      { label: 'Produk', body: 'Solusi siap pakai dengan fitur yang sudah ditentukan.' },
      { label: 'Konfigurasi', body: 'Mengatur pengaturan terbatas sesuai opsi yang tersedia.' },
      { label: 'Pakai', body: 'Menggunakan sistem apa adanya, dalam batas produk.' }
    ],
    openFlow: [
      { label: 'Framework', body: 'Fondasi siap pakai dengan kapabilitas procurement yang terstruktur.' },
      { label: 'Pahami', body: 'Memahami kebutuhan bisnis, proses, dan tata kelola Anda.' },
      { label: 'Kustomisasi', body: 'Menyesuaikan framework dengan proses dan aturan unik Anda.' },
      { label: 'Kembangkan', body: 'Membangun fungsi yang dibutuhkan dan memperluas kapabilitas.' },
      { label: 'Integrasikan', body: 'Mengintegrasikan dengan sistem Anda yang sudah ada dan aplikasi pihak ketiga.' },
      { label: 'Sistem Anda', body: 'Sistem yang dibangun di sekitar bisnis Anda, siap memberi nilai.' }
    ],
    differenceLine: ['Fondasi yang sama.', 'Kemungkinan yang berbeda.']
  },
  cta: {
    title: ['Proses procurement Anda unik.', 'Sistem Anda pun seharusnya begitu.'],
    line: 'Mari bangun ekosistem procurement Anda.',
    pillars: ['Siap Tata Kelola', 'Aman & Terkontrol', 'Siap Integrasi', 'Visibilitas & Insight'],
    challenges: ['Banyak pemangku kepentingan', 'Informasi tersebar', 'Persetujuan manual', 'Data terpisah', 'Risiko kesalahan tinggi'],
    interests: [{}, { label: 'Manajemen Vendor' }, { label: 'Manajemen Katalog' }, {}, { label: 'Ekosistem lengkap' }]
  }
}

// English overlay for useOpen() on /en/open: translates ONLY the base strings
// that are Indonesian (supporting copy from the deck), so the English page is
// fully English. Same facts, nothing added. Method `stages` keys
// (teknis / harga) and every other compared value stay as-is.
export const OPEN_EN: DeepPartial<OpenData> = {
  hero: {
    body: 'Not built from a blank page, and not rigid SaaS either. OPEN is a ready procurement foundation, then customized around your organization’s business processes and governance.',
    connectsIntro: 'Not just workflow digitization. OPEN connects:'
  },
  problem: {
    intro: 'As procurement grows, so does its complexity:',
    realIntro: 'What often turns out to be the problem:',
    questions: [
      { q: 'Who did it?' },
      { q: 'Why was the decision made?' },
      { q: 'When did the decision happen?' },
      { q: 'What changed?' },
      { q: 'What is the evidence?' }
    ],
    needsIntro: 'Procurement needs'
  },
  notSaas: {
    differsIntro: 'Because every organization has its own:',
    differsWord: 'different',
    saasLabel: 'Not',
    openLabel: 'OPEN takes the approach'
  },
  framework: {
    intro: 'OPEN provides a functional foundation that is already developed and includes:',
    after: 'That framework is then customized and developed around each organization’s needs.',
    notBlank: 'We don’t start from a blank page.'
  },
  ecosystem: {
    body: 'OPEN connects every procurement process and function, from the start through payment and beyond.',
    note: 'OPEN doesn’t stop at the auction. Every process stays connected through purchasing and payment, with integrated governance.',
    components: [{}, {}, { body: 'Contract catalog & e-Commerce catalog for efficient purchasing' }]
  },
  procurement: {
    body: 'Manage the whole procurement cycle, from planning to payment, in a structured, transparent and controlled way.',
    workflow: [
      { body: 'Needs planning & requests' },
      { body: 'Approval of the procurement approach & category' },
      { body: 'Shortlisted or potential vendor recommendations' },
      { body: 'Formal invitation to vendors' },
      { body: 'Evaluation of technical aspects & compliance' },
      { body: 'Price & commercial evaluation' },
      { body: 'Competitive electronic auction process' },
      { body: 'Quality assurance & compliance checks' },
      { body: 'Approval based on the authority matrix' },
      { body: 'Contract drafting & signing' },
      { body: 'Inspection, receipt & BAST' },
      { body: 'Invoice verification & payment' }
    ],
    methodsIntro: 'The OPEN framework already handles a range of procurement methods, with their differences in technical/price behaviour, price unlocking, technical evaluation and budget control.',
    methods: [
      {
        name: 'One Stage – One Envelope',
        body: 'Technical and price evaluation happen in one stage with one bid envelope.',
        points: ['Technical & price evaluated together', 'No staged price opening', 'Faster process', 'Suits standard procurement']
      },
      {
        name: 'One Stage – Two Envelopes',
        body: 'Technical evaluation first; prices are opened after the technical evaluation is passed.',
        points: ['Stage 1: Technical evaluation', 'Stage 2: Price opening (unlocked)', 'Technical quality protected', 'Better price control']
      },
      {
        name: 'Two Stages – Two Envelopes',
        body: 'Evaluation runs in two separate stages for technical and price.',
        points: ['Stage 1: Technical evaluation (envelope 1)', 'Stage 2: Price evaluation (envelope 2)', 'Highest control & compliance', 'Ideal for high-value / high-risk procurement']
      }
    ],
    methodsManaged: ['Technical & price behaviour', 'Price unlocking mechanism', 'Technical evaluation method', 'Budget control & compliance'],
    methodsLine: 'One framework, many methods.'
  },
  vendor: {
    body: 'OPEN manages the whole vendor process end to end, keeping vendor qualification, compliance and performance in check.',
    lifecycle: [
      { body: 'Vendor registration and initial data' },
      { body: 'Selection and verification of documents and qualifications' },
      { body: 'Vendor assessment, scoring and accreditation' },
      { body: 'Regular upkeep of vendor data and supporting documents' },
      { body: 'Updating data and documents that need renewing' },
      { body: 'Vendor performance assessment against contract and delivery' },
      { body: 'Monitoring of vendor compliance, performance and activity' },
      { body: 'Renewal of DRT / accreditation and vendor contracts' },
      { body: 'Handling problem vendors and the blacklist' }
    ],
    lineBody: 'One vendor record, complete from onboarding to performance and renewal.'
  },
  catalog: {
    body: 'OPEN supports integrated catalogs to keep purchasing controlled, efficient and contract-compliant.',
    types: [
      { body: 'A catalog built from procurement results and contracts.', points: ['Contract-based', 'Bound terms, prices & conditions', 'Full compliance & control'] },
      { body: 'A catalog for buying goods/services faster and more easily.' }
    ],
    controlled: [
      { body: 'Specifications, category and details of goods/services' },
      { body: 'Verified, well-performing vendors' },
      { body: 'Prices in line with contracts and policy' },
      { body: 'Stock availability and lead time' },
      { body: 'Catalog and contract validity period' }
    ],
    controlledLine: 'Every purchase follows the organization’s contracts, policies and rules.'
  },
  modulesIntro: {
    body: 'OPEN is built on three integrated core modules to manage the whole procurement process end to end — and it can be customized to your organization’s needs.'
  },
  auction: {
    body: 'OPEN e-Auction is designed as a transaction engine integrated with the procurement process.',
    steps: [{}, {}, {}, { body: 'Together or one by one' }],
    capabilities: [
      { body: 'Set up auctions and parameters easily' },
      { body: 'Negotiate together or one by one' },
      { label: 'e-Auction Official Report', body: 'Generate the official report (Berita Acara) automatically' },
      { body: 'Monitor auction activity in real time' },
      { body: 'Complete reports & activity history' },
      { body: 'Manage auction master data, rules and configuration' }
    ],
    principles: [
      { body: 'A transparent auction process with healthy competition' },
      { body: 'Every activity is recorded and auditable' },
      { body: 'Auction automation saves process time and cost' },
      { body: 'Fully integrated with the procurement process in OPEN' },
      { body: 'Real-time data for better decisions' }
    ]
  },
  governance: {
    body: 'OPEN can apply governance as an integrated part of every step of the procurement process.',
    capabilities: [
      { body: 'Structured, controlled multi-level approval.' },
      { body: 'Role-based access with strict control.' },
      { body: 'Business rules that guide and control the process.' },
      { body: 'Centralized document management, versioning and security.' },
      { body: 'A record of every activity for full accountability.' },
      { body: 'Automatic notifications for actions, approvals and deadlines.' },
      { body: 'Service Level Agreements to keep process performance on track.' },
      { body: 'Ensures compliance with organizational policies and regulations.' }
    ],
    embedded: [
      { body: 'Submitted by the user' },
      { body: 'Verified against the approval matrix' },
      { body: 'Business rules and validation run' },
      { body: 'The process runs according to role & access' },
      { body: 'Documentation, audit trail and notifications' }
    ],
    embeddedLine: 'Governance runs at every step, not after the process is done.',
    approvalBody: 'OPEN lets organizations build structured, transparent and controlled approval flows in every procurement process.',
    approvalFeatures: [
      { body: 'Tiered approval in line with organizational policy.' },
      { body: 'A clear authority matrix by value, unit or category.' },
      { body: 'Sequential approval flows for control and accountability.' },
      { body: 'Approval tasks assigned automatically by role and responsibility.' },
      { body: 'Automatic notifications to speed up responses and cut delays.' },
      { body: 'Track approval status in real time at every stage.' },
      { body: 'Delegation or a stand-in approver when a user is unavailable.' }
    ],
    approvalFlow: [
      { body: 'Request created by the user' },
      { body: 'Review and verification by the reviewer' },
      { body: 'Approval at level 1' },
      { body: 'Approval at level 2' },
      { body: 'Final approval complete' },
      { body: 'The process moves to the next stage' }
    ],
    approvalQuestion: '“Has it been approved yet?”',
    approvalQuestionIntro: 'No more depending on',
    approvalLine: 'Every step recorded, every decision controlled.',
    auditIntro: 'OPEN records the key activities in the process:',
    auditLine: 'The audit trail makes sure every activity is recorded, transparent and accountable.'
  },
  visibility: {
    intro: 'The OPEN dashboard can give visibility into:'
  },
  integration: {
    intro: 'OPEN can be developed to connect with:',
    targets: [
      { body: 'Master data, vendor, material and transaction integration.' },
      { body: 'Budget, commitment, payment and GL integration.' },
      { body: 'e-Procurement, sourcing and contract integration.' },
      { body: 'Asset data and asset lifecycle integration.' },
      { body: 'Authentication, SSO and user management integration.' },
      { body: 'Digital signature and e-signature integration.' },
      { body: 'Integration with other third-party applications.' }
    ],
    approachesIntro: 'Through',
    line: 'OPEN is designed as a flexible platform, open to integration with the systems already in place, so procurement stays connected and data keeps flowing securely and consistently.'
  },
  security: {
    intro: 'OPEN can apply:',
    items: [
      { body: 'System access by role and responsibility to keep data secure.' },
      { body: 'Centralized, controlled management of users, roles and permissions.' },
      { body: 'Sign in once to access OPEN, integrated with other systems.' },
      { body: 'Records every important user activity in the system for audit and monitoring.' },
      { body: 'All system communication secured with HTTPS encryption.' },
      { body: 'The screen locks automatically after a period of inactivity to protect data.' },
      { body: 'Data is backed up regularly and can be safely restored when needed.' }
    ]
  },
  customization: {
    intro: 'Customization can cover:',
    areas: [
      { body: 'Tailor the procurement process flow to how your organization works and what it needs.' },
      { body: 'Build an approval matrix by transaction value, category, division or other parameters you define.' },
      { body: 'Adjust roles, access rights and data boundaries to your organizational structure.' },
      { body: 'Set validation rules, conditions, automation and controls in line with your business policy.' },
      { body: 'Adapt procurement methods (selection, tender, e-auction, direct purchase, etc.) to your needs.' },
      { body: 'Adjust the look, navigation and user experience to your organization’s preferences.' },
      { body: 'Build reports and dashboards for your analysis and decision-making needs.' },
      { body: 'Integrate OPEN with the other systems you already use.' },
      { body: 'Adjust data structures, fields and master data to your business needs.' }
    ],
    scopeIntro: 'Foundation implementation scope can include:',
    scope: [
      { body: 'System setup and initial configuration.' },
      { body: 'Adjusting the system to business needs.' },
      { body: 'Testing together with business users.' },
      { body: 'Developing forms and reports as needed.' },
      { body: 'Training for system users.' },
      { body: 'Migrating vendor data into the system.' },
      { body: 'System and implementation process documentation.' },
      { body: 'Progress and implementation result reports.' }
    ],
    implLine: 'Every phase is structured, collaborative and measurable.'
  },
  advantage: {
    compareNote: 'OPEN is not positioned as plug-and-play SaaS.'
  },
  cta: {
    body: 'OPEN provides a procurement foundation that is ready to develop and can be customized around your processes, governance, integrations and business needs.',
    challenges: [undefined, undefined, undefined, undefined, undefined, 'Other']
  }
}

import type { Ref } from 'vue'

/**
 * /open — OPEN by PASTI Technology (One Procurement Ecosystem Network).
 *
 * PRIMARY SOURCE: "OPEN PRODUCT 2026.pdf" (owner deck, Oct 2026) — notes per
 * slide in docs/open/02-open-product-2026-notes.md. Section order and rules:
 * docs/open/01-open-page-structure.md. The older brief
 * (docs/open/00-open-landing-page-brief.md) is supporting context only.
 *
 * Locked mental model: e-Procurement is part of the ecosystem; OPEN is the
 * procurement framework and ecosystem — a ready foundation, customized around
 * each organization. Never "OPEN = e-Procurement", never plug-and-play SaaS.
 *
 * Language (owner, 2026-10-07): not full English. Headlines and product
 * labels in English as the deck sets them; supporting copy in Indonesian,
 * taken from the deck. Every string below is from the deck unless its entry
 * in `contentStatus` says otherwise. Do not add facts that are not there.
 */

export type OpenStatus = 'confirmed' | 'needs_approval' | 'placeholder'

export interface OpenItem {
  label: string
  body?: string
}

export interface OpenNode extends OpenItem {
  id: string
  /** Core ecosystem tab this node opens in "Core Ecosystems", if any. */
  module?: OpenModuleId
}

export type OpenModuleId = 'procurement' | 'vendor' | 'catalog'

export interface OpenMethod {
  code: string
  name: string
  body: string
  points: string[]
  /** Stages × envelopes, drawn by the method switcher. */
  stages: Array<Array<'teknis' | 'harga' | 'teknis+harga'>>
}

export function useOpen() {
  // ---- SEO (temporary, owner brief) --------------------------------------
  const seo = {
    title: 'OPEN — Customizable Procurement Ecosystem | PASTI',
    description:
      'OPEN is a ready-to-develop procurement framework connecting procurement, vendors, catalogs, governance, approvals, monitoring, and enterprise integrations in one customizable ecosystem.'
  }

  // ---- 02 Hero / Meet OPEN (slides 1, 3, 4) --------------------------------
  const hero = {
    name: 'OPEN',
    expansion: 'One Procurement Ecosystem Network',
    statement: 'A customizable procurement system framework built around your business.',
    // Supporting copy: restates slides 4–6 (no new facts).
    body: 'Bukan membangun dari halaman kosong, bukan juga SaaS kaku. OPEN adalah fondasi procurement yang sudah siap, lalu dikustomisasi mengikuti proses bisnis dan tata kelola organisasi Anda.',
    origin: 'Originally developed by PASTI Technology',
    connectsIntro: 'Bukan hanya digitalisasi workflow. OPEN menghubungkan:',
    connects: ['Process', 'People', 'Approval', 'Vendor', 'Data', 'Documents', 'Governance'],
    // Slide 3 "Process Lifecycle" + governance rail of the overview screen.
    lifecycle: ['Request', 'Evaluation', 'Approval', 'Auction', 'Contract', 'Closing'],
    rail: [
      { label: 'Approval Flow', body: 'Structured & Transparent' },
      { label: 'Lifecycle Status', body: 'Real-time Visibility' },
      { label: 'Role-Based Access', body: 'Right Access for Every Role' },
      { label: 'Business Rules', body: 'Policy Enforced Consistently' },
      { label: 'Audit Trail', body: 'Traceable from End to End' }
    ]
  }

  // ---- 03 Procurement problem (slides 2, 3) --------------------------------
  const problem = {
    title: ['Procurement has become', 'too complex to manage manually.'],
    intro: 'Ketika procurement semakin besar, kompleksitasnya ikut bertambah:',
    pressures: ['More people.', 'More vendors.', 'More approvals.', 'More documents.', 'More rules.', 'More risks.'],
    symptoms: ['Multiple Stakeholders', 'Scattered Information', 'Manual Approvals', 'Siloed Data', 'High Risk of Errors'],
    verdict: ['The process works —', 'but the visibility doesn’t.'],
    realTitle: ['The problem isn’t only', 'procurement efficiency.'],
    realIntro: 'Yang sering menjadi masalah justru:',
    questions: [
      { key: 'WHO', q: 'Siapa yang melakukan?' },
      { key: 'WHY', q: 'Mengapa keputusan dibuat?' },
      { key: 'WHEN', q: 'Kapan keputusan terjadi?' },
      { key: 'WHAT', q: 'Apa yang berubah?' },
      { key: 'TRACE', q: 'Apa buktinya?' }
    ],
    needsIntro: 'Procurement membutuhkan',
    needs: ['process visibility', 'governance', 'accountability']
  }

  // ---- 04 Not another SaaS (slide 5) ---------------------------------------
  const notSaas = {
    title: ['OPEN is', 'not another SaaS.'],
    differsIntro: 'Karena setiap organisasi punya:',
    differs: ['Procurement policy', 'Approval matrix', 'Organizational structure', 'ERP', 'Vendor ecosystem', 'Governance requirement'],
    differsWord: 'berbeda',
    saasLabel: 'Bukan',
    saas: ['Subscribe', 'Configure', 'Use'],
    openLabel: 'OPEN menggunakan pendekatan',
    open: ['Understand', 'Design', 'Customize', 'Develop', 'Integrate', 'Deploy'],
    line: ['The system adapts to your business.', 'Not the other way around.']
  }

  // ---- 05 Ready-to-develop framework (slides 6, 7) -------------------------
  const framework = {
    title: ['A ready-to-develop', 'procurement framework.'],
    intro: 'OPEN menyediakan functional foundation yang sudah dikembangkan dan memiliki:',
    foundation: [
      'Core Architecture',
      'Business Logic',
      'Workflow Engine',
      'Role & Access Model',
      'Approval Framework',
      'Audit Trail',
      'Notification Engine',
      'Document Management',
      'Procurement Modules'
    ],
    after: 'Kemudian framework tersebut dikustomisasi dan dikembangkan mengikuti kebutuhan masing-masing organisasi.',
    // Slide 6 presenter note, rewritten as public copy.
    notBlank: 'Kami tidak mulai dari blank page.',
    tagline: ['One framework.', 'Multiple possibilities.'],
    layers: [
      { label: 'OPEN Framework', body: 'Pre-built functional foundation with proven architecture, logic and best practices.' },
      { label: 'Your Business', body: 'Your processes, policies, structure, people and ecosystem.' },
      { label: 'Your Procurement System', body: 'A system that fits your business, drives value and grows with you.' }
    ],
    adaptedBy: ['Process', 'Governance', 'Role & Approval', 'Integration', 'UI / UX', 'Business Rules']
  }

  // ---- 06 One procurement ecosystem (slide 8) ------------------------------
  const ecosystem = {
    title: ['One ecosystem.', 'Multiple procurement functions.'],
    body: 'OPEN menghubungkan seluruh proses dan fungsi procurement dari awal hingga pembayaran dan beyond.',
    note: 'OPEN tidak berhenti di auction. Semua proses terhubung hingga pembelian dan pembayaran, dengan tata kelola yang terintegrasi.',
    nodes: [
      { id: 'request', label: 'Request', body: 'Need identification and request creation', module: 'procurement' },
      { id: 'procurement', label: 'Procurement', body: 'Planning & process initiation', module: 'procurement' },
      { id: 'vendor', label: 'Vendor', body: 'Vendor management, qualification & selection', module: 'vendor' },
      { id: 'hps', label: 'HPS / Evaluation', body: 'Budget estimation (HPS), technical & price evaluation', module: 'procurement' },
      { id: 'auction', label: 'Auction', body: 'e-Auction / e-Bidding process', module: 'procurement' },
      { id: 'approval', label: 'Approval', body: 'Approval & governance by authority matrix' },
      { id: 'contract', label: 'Contract', body: 'Contract creation & agreement', module: 'procurement' },
      { id: 'catalog', label: 'Catalog', body: 'Contract catalog & e-Commerce catalog', module: 'catalog' },
      { id: 'purchase', label: 'Purchase', body: 'Purchase order & transaction', module: 'catalog' },
      { id: 'payment', label: 'Payment', body: 'Invoice verification & payment', module: 'procurement' }
    ] as OpenNode[],
    components: [
      { id: 'procurement' as OpenModuleId, label: 'Non-Catalog Procurement', body: 'End-to-end procurement process for non-catalog items' },
      { id: 'vendor' as OpenModuleId, label: 'Vendor Management', body: 'Manage the entire vendor lifecycle and performance' },
      { id: 'catalog' as OpenModuleId, label: 'Catalog Management', body: 'Contract catalog & e-Commerce catalog untuk pembelian yang efisien' }
    ],
    // Slide 8 footer. "Regulatory compliance" left out (needs_approval).
    pillars: [
      { label: 'Integrated Governance', body: 'Rules, approval, SLA, notification & audit trail' },
      { label: 'Real-time Visibility', body: 'Status, progress, and performance in real-time' },
      { label: 'Secure & Controlled', body: 'Role-based access and data security' },
      { label: 'Flexible & Integrated', body: 'Ready to integrate with ERP, finance, inventory and more' },
      { label: 'Data & Insight', body: 'Data-driven decision making with analytics & reporting' }
    ]
  }

  // ---- 07 Core ecosystems (slides 9, 10, 12, 13) ---------------------------
  const procurement = {
    id: 'procurement' as const,
    index: '01',
    label: 'Procurement',
    tagline: 'End-to-end procurement workflow',
    title: ['End-to-end', 'Procurement.'],
    body: 'Mengelola seluruh siklus procurement dari perencanaan hingga pembayaran secara terstruktur, transparan, dan terkontrol.',
    capabilities: [
      'Planning & Request',
      'Sourcing & Participation',
      'Evaluation (Technical & Price)',
      'e-Auction (Competitive Bidding)',
      'Approval & Governance',
      'Contract & Agreement',
      'Purchase, Receipt & Payment',
      'Closing & Performance'
    ],
    workflow: [
      { label: 'Planning & Request', body: 'Perencanaan kebutuhan & permintaan' },
      { label: 'PACC', body: 'Persetujuan pendekatan & kategori pengadaan' },
      { label: 'Vendor Recommendation', body: 'Rekomendasi vendor shortlist atau potensial' },
      { label: 'Aanwijzing', body: 'Undangan resmi kepada vendor' },
      { label: 'Technical Evaluation', body: 'Evaluasi aspek teknis & kepatuhan' },
      { label: 'Price Evaluation', body: 'Evaluasi harga & komersial' },
      { label: 'e-Auction', body: 'Proses lelang elektronik secara kompetitif' },
      { label: 'QA / Compliance', body: 'Quality assurance & pengecekan kepatuhan' },
      { label: 'Approval', body: 'Persetujuan berdasarkan matriks wewenang' },
      { label: 'Contract', body: 'Pembuatan & penandatanganan kontrak' },
      { label: 'BAST', body: 'Pemeriksaan, penerimaan & BAST' },
      { label: 'Payment', body: 'Verifikasi invoice & pembayaran' }
    ] as OpenItem[],
    methodsIntro: 'OPEN framework sudah menangani berbagai metode pengadaan dengan perbedaan perilaku teknis/harga, unlocking harga, evaluasi teknis, dan budget control.',
    methods: [
      {
        code: '1T1S',
        name: 'Satu Tahap – Satu Sampul',
        body: 'Evaluasi teknis dan harga dilakukan dalam satu tahap dengan satu sampul penawaran.',
        points: ['Evaluasi teknis & harga sekaligus', 'Tidak ada pembukaan harga bertahap', 'Proses lebih cepat', 'Cocok untuk pengadaan standar'],
        stages: [['teknis+harga']]
      },
      {
        code: '1T2S',
        name: 'Satu Tahap – Dua Sampul',
        body: 'Evaluasi teknis terlebih dahulu, harga dibuka setelah lolos evaluasi teknis.',
        points: ['Tahap 1: Evaluasi teknis', 'Tahap 2: Pembukaan harga (unlocked)', 'Kualitas teknis terjaga', 'Kontrol harga lebih baik'],
        stages: [['teknis', 'harga']]
      },
      {
        code: '2T2S',
        name: 'Dua Tahap – Dua Sampul',
        body: 'Evaluasi dilakukan dalam dua tahap terpisah untuk teknis dan harga.',
        points: ['Tahap 1: Evaluasi teknis (sampul 1)', 'Tahap 2: Evaluasi harga (sampul 2)', 'Kontrol & kepatuhan tertinggi', 'Ideal untuk pengadaan bernilai tinggi / berisiko tinggi'],
        stages: [['teknis'], ['harga']]
      }
    ] as OpenMethod[],
    methodsManaged: ['Perilaku teknis & harga', 'Mekanisme unlocking harga', 'Metode evaluasi teknis', 'Budget control & compliance'],
    methodsLine: 'Satu framework, banyak metode.'
  }

  const vendor = {
    id: 'vendor' as const,
    index: '02',
    label: 'Vendor Management',
    tagline: 'Vendor registration, verification & performance',
    title: ['Manage the vendor lifecycle.', 'Not just the vendor list.'],
    body: 'OPEN mengelola seluruh proses vendor secara menyeluruh untuk memastikan kualifikasi, kepatuhan, dan kinerja vendor terjaga.',
    lifecycle: [
      { label: 'Registration', body: 'Pendaftaran vendor dan kelengkapan data awal' },
      { label: 'Selection', body: 'Seleksi dan verifikasi dokumen serta kualifikasi' },
      { label: 'Scoring / Accreditation', body: 'Penilaian, scoring dan akreditasi vendor' },
      { label: 'Maintenance', body: 'Pemeliharaan data vendor dan dokumen pendukung secara berkala' },
      { label: 'Data Update', body: 'Pembaruan data dan dokumen yang perlu diperbarui' },
      { label: 'Performance', body: 'Penilaian kinerja vendor berdasarkan kontrak dan realisasi' },
      { label: 'Monitoring', body: 'Monitoring kepatuhan, kinerja dan aktivitas vendor' },
      { label: 'Renewal', body: 'Perpanjangan DRT / akreditasi dan kontrak vendor' },
      { label: 'Blacklist', body: 'Pengelolaan vendor bermasalah dan daftar hitam' }
    ] as OpenItem[],
    capabilities: [
      'Vendor Registration',
      'Verification & Accreditation',
      'Vendor Classification & Scoring',
      'Performance Monitoring',
      'Blacklisting & Renewal',
      'Vendor Analytics & Insights'
    ],
    line: ['One vendor record.', 'A complete vendor journey.'],
    lineBody: 'Satu data vendor, lengkap dari awal hingga kinerja dan perpanjangan.'
  }

  const catalog = {
    id: 'catalog' as const,
    index: '03',
    label: 'Catalog Management',
    tagline: 'Contract catalog & e-Commerce catalog',
    title: ['Turn procurement outcomes', 'into controlled purchasing.'],
    body: 'OPEN mendukung katalog terintegrasi untuk memastikan pembelian yang terkontrol, efisien dan patuh kontrak.',
    types: [
      {
        label: 'Contract Catalog',
        body: 'Katalog yang berasal dari hasil procurement dan kontrak.',
        points: ['Berdasarkan kontrak', 'Syarat, harga & kondisi terikat', 'Kepatuhan & kontrol penuh']
      },
      {
        label: 'E-Commerce Catalog',
        body: 'Katalog untuk pembelian barang/jasa secara lebih cepat dan praktis.',
        flow: ['Vendor', 'Review', 'Approval', 'Publish', 'Purchase']
      }
    ],
    controlled: [
      { label: 'Item', body: 'Spesifikasi, kategori dan detail barang/jasa' },
      { label: 'Vendor', body: 'Vendor terverifikasi dan berkinerja baik' },
      { label: 'Price', body: 'Harga sesuai kontrak dan kebijakan' },
      { label: 'Availability', body: 'Ketersediaan stok dan lead time' },
      { label: 'Validity', body: 'Periode berlaku katalog dan kontrak' }
    ] as OpenItem[],
    controlledLine: 'Setiap pembelian dilakukan sesuai kontrak, kebijakan dan aturan organisasi.',
    capabilities: [
      'Contract Catalog Management',
      'e-Commerce Catalog Management',
      'Price & Availability Management',
      'Catalog Approval & Governance',
      'Catalog Analytics & Usage Insight',
      'Integration with Procurement'
    ],
    line: ['From sourcing to purchasing —', 'connected.']
  }

  const modulesIntro = {
    title: ['Three core', 'procurement ecosystems.'],
    body: 'OPEN dibangun di atas tiga modul inti yang saling terintegrasi untuk mengelola seluruh proses procurement secara end-to-end — dan dapat dikustomisasi sesuai kebutuhan organisasi Anda.'
  }

  // ---- 08 e-Auction (slide 11) ---------------------------------------------
  const auction = {
    title: ['More than just', 'online bidding.'],
    body: 'OPEN e-Auction dirancang sebagai transaction engine yang terintegrasi dengan proses procurement.',
    line: ['Competitive by process.', 'Transparent by design.'],
    steps: [
      { label: 'Create', body: 'Auction & bidding setup' },
      { label: 'Invite', body: 'Qualified vendor participation' },
      { label: 'Bid', body: 'Real-time competitive bidding' },
      { label: 'Negotiate', body: 'Bersama-sama atau satu-per-satu' },
      { label: 'Rank', body: 'Transparent bid comparison' },
      { label: 'Close', body: 'Automated auction closing' },
      { label: 'Document', body: 'Auction & negotiation records' },
      { label: 'Trace', body: 'Complete activity history' }
    ] as OpenItem[],
    capabilities: [
      { label: 'Create Auction & Create Bidding', body: 'Setup lelang dan parameter dengan mudah' },
      { label: 'Negotiation Mode', body: 'Negosiasi bersama-sama atau satu-per-satu' },
      { label: 'Berita Acara e-Auction', body: 'Generate Berita Acara secara otomatis' },
      { label: 'Dashboard Monitoring', body: 'Pantau aktivitas lelang secara real-time' },
      { label: 'Reporting & History', body: 'Laporan lengkap & history aktivitas' },
      { label: 'Administration', body: 'Kelola master, rule, dan konfigurasi lelang' }
    ] as OpenItem[],
    principles: [
      { label: 'Fair & Competitive', body: 'Proses lelang transparan dengan persaingan yang sehat' },
      { label: 'Transparent & Auditable', body: 'Semua aktivitas tercatat dan dapat diaudit' },
      { label: 'Efficient Process', body: 'Automasi lelang menghemat waktu dan biaya proses' },
      { label: 'Integrated', body: 'Terintegrasi penuh dengan proses procurement di OPEN' },
      { label: 'Data-driven Decision', body: 'Data real-time untuk keputusan yang lebih tepat' }
    ] as OpenItem[]
  }

  // ---- 09 Governance, approval & auditability (slides 14, 15, 16) ----------
  const governance = {
    title: ['Governance shouldn’t happen after the process.', 'It should happen inside the process.'],
    body: 'OPEN dapat menerapkan governance secara terintegrasi di setiap langkah proses procurement.',
    capabilities: [
      { label: 'Approval Workflow', body: 'Multi-level approval yang terstruktur dan terkontrol.' },
      { label: 'Role & Access', body: 'Akses berbasis peran dengan kontrol yang ketat.' },
      { label: 'Business Rules', body: 'Aturan bisnis yang memandu dan mengendalikan proses.' },
      { label: 'Document Control', body: 'Pengelolaan dokumen terpusat, versi, dan keamanan.' },
      { label: 'Audit Trail', body: 'Rekam jejak setiap aktivitas untuk akuntabilitas penuh.' },
      { label: 'Notification', body: 'Notifikasi otomatis untuk aksi, approval, dan tenggat waktu.' },
      { label: 'SLA', body: 'Service Level Agreement untuk memastikan kinerja proses.' },
      { label: 'Compliance', body: 'Memastikan kepatuhan terhadap kebijakan dan regulasi organisasi.' }
    ] as OpenItem[],
    embedded: [
      { label: 'Request', body: 'Diajukan oleh user' },
      { label: 'Approval', body: 'Diverifikasi sesuai matrix approval' },
      { label: 'Validation', body: 'Aturan bisnis dan validasi dijalankan' },
      { label: 'Execution', body: 'Proses dijalankan sesuai role & access' },
      { label: 'Completion', body: 'Dokumentasi, audit trail dan notifikasi' }
    ] as OpenItem[],
    embeddedLine: 'Governance berjalan di setiap langkah, bukan setelah proses selesai.',
    decision: 'Every critical decision has a defined process behind it.',

    approvalTitle: ['From manual approval', 'to controlled workflow.'],
    approvalBody: 'OPEN memungkinkan organisasi membangun alur persetujuan yang terstruktur, transparan, dan terkontrol di setiap proses procurement.',
    approvalFeatures: [
      { label: 'Multi-Level Approval', body: 'Dukungan persetujuan berjenjang sesuai kebijakan organisasi.' },
      { label: 'Authority Matrix', body: 'Matriks wewenang yang jelas berdasarkan nilai, unit, atau kategori.' },
      { label: 'Sequential Approval', body: 'Alur persetujuan berurutan untuk kontrol dan akuntabilitas.' },
      { label: 'Role-Based Assignment', body: 'Tugas persetujuan otomatis berdasarkan role dan tanggung jawab.' },
      { label: 'Approval Notification', body: 'Notifikasi otomatis untuk mempercepat respons dan mengurangi delay.' },
      { label: 'Status Tracking', body: 'Pantau status approval secara real-time di setiap tahap proses.' },
      { label: 'Delegation / Alternate Role', body: 'Delegasi atau pengganti persetujuan saat user berhalangan.' }
    ] as OpenItem[],
    // Slide 15 "Multi-level approval flow example" — illustrative.
    approvalFlow: [
      { label: 'Request', body: 'Pengajuan dibuat oleh user' },
      { label: 'Reviewer', body: 'Review dan verifikasi oleh reviewer' },
      { label: 'Approver 1', body: 'Persetujuan oleh level 1' },
      { label: 'Approver 2', body: 'Persetujuan oleh level 2' },
      { label: 'Final Approval', body: 'Persetujuan akhir selesai' },
      { label: 'Completed', body: 'Proses berlanjut ke tahap berikutnya' }
    ] as OpenItem[],
    approvalQuestion: '“Sudah di-approve belum?”',
    approvalQuestionIntro: 'Tidak lagi bergantung pada',
    approvalShows: ['Who', 'What', 'When', 'Status', 'Next Action'],
    approvalLine: 'Setiap langkah tercatat, setiap keputusan terkontrol.',

    auditTitle: ['If it happened in the system,', 'there should be a trace.'],
    auditIntro: 'OPEN mencatat aktivitas penting dalam proses:',
    auditFields: ['User', 'Action', 'Timestamp', 'Status', 'Document', 'Activity History', 'Approval History'],
    auditQuote: ['From “Who approved this?”', 'to a traceable answer.'],
    auditLine: 'Audit trail memastikan setiap aktivitas tercatat, transparan, dan dapat dipertanggungjawabkan.'
  }

  // ---- 10 Visibility, integration & security (slides 17, 18, 19) -----------
  const visibility = {
    title: ['Don’t wait for the report.', 'See the process as it happens.'],
    intro: 'OPEN dashboard dapat memberikan visibility terhadap:',
    items: ['Procurement Status', 'Auction Activity', 'Vendor Performance', 'Approval Progress', 'Contract Status', 'Process Monitoring', 'Management Reporting'],
    line: ['One view.', 'Multiple procurement activities.']
  }

  const integration = {
    title: ['OPEN doesn’t have to replace', 'your existing ecosystem.'],
    intro: 'OPEN dapat dikembangkan untuk terhubung dengan:',
    // Slide 18 shows an SAP logo on ERP — left out (no vendor names unless approved).
    targets: [
      { label: 'ERP', body: 'Integrasi master data, vendor, material, dan transaksi.' },
      { label: 'Finance System', body: 'Integrasi budget, commitment, payment, dan GL.' },
      { label: 'Procurement System', body: 'Integrasi e-procurement, sourcing, dan contract.' },
      { label: 'Asset Management', body: 'Integrasi data aset dan pengelolaan siklus aset.' },
      { label: 'Identity / LDAP', body: 'Integrasi authentication, SSO, dan user management.' },
      { label: 'Digital Signature', body: 'Integrasi tanda tangan digital dan e-signature.' },
      { label: 'Third-party Applications', body: 'Integrasi dengan aplikasi pihak ketiga lainnya.' }
    ] as OpenItem[],
    approachesIntro: 'Melalui pendekatan',
    approaches: ['API', 'Web Service', 'System Integration'],
    line: 'OPEN dirancang sebagai platform yang fleksibel dan terbuka untuk integrasi dengan berbagai sistem yang sudah ada, sehingga proses procurement tetap terhubung dan data tetap mengalir secara aman dan konsisten.'
  }

  const security = {
    title: ['Procurement data needs', 'controlled access.'],
    intro: 'OPEN dapat menerapkan:',
    items: [
      { label: 'Role-Based Access', body: 'Akses sistem berdasarkan peran dan tanggung jawab untuk menjaga keamanan data.' },
      { label: 'User Management', body: 'Pengelolaan user, role, dan permission secara terpusat dan terkontrol.' },
      { label: 'Single Sign-On', body: 'Login sekali untuk mengakses OPEN dan terintegrasi dengan sistem lainnya.' },
      { label: 'Activity Logging', body: 'Mencatat setiap aktivitas penting user di sistem untuk audit dan monitoring.' },
      { label: 'HTTPS', body: 'Seluruh komunikasi sistem diamankan dengan enkripsi HTTPS.' },
      { label: 'Auto Screen Lock', body: 'Layar otomatis terkunci setelah periode tidak aktif untuk melindungi data.' },
      { label: 'Backup & Restore', body: 'Data dicadangkan secara berkala dan dapat dipulihkan dengan aman ketika dibutuhkan.' }
    ] as OpenItem[],
    quote: ['Access is controlled.', 'Activities are traceable.']
  }

  // ---- 11 Customization & implementation (slides 20, 21) -------------------
  const customization = {
    title: ['Your process is unique.', 'OPEN adapts to it.'],
    intro: 'Customization dapat mencakup:',
    areas: [
      { label: 'Business Process', body: 'Menyesuaikan alur proses procurement sesuai cara kerja dan kebutuhan organisasi Anda.' },
      { label: 'Approval Matrix', body: 'Membangun matriks approval berdasarkan nilai transaksi, kategori, divisi, atau parameter lain yang Anda tentukan.' },
      { label: 'Role & Access', body: 'Menyesuaikan peran, hak akses, dan batasan data berdasarkan struktur organisasi Anda.' },
      { label: 'Business Rules', body: 'Mengatur rule validasi, kondisi, otomasi, dan kontrol sesuai kebijakan bisnis Anda.' },
      { label: 'Procurement Method', body: 'Menyesuaikan metode procurement (seleksi, tender, e-auction, direct purchase, dll) sesuai kebutuhan Anda.' },
      { label: 'UI / UX', body: 'Menyesuaikan tampilan, navigasi, dan pengalaman pengguna sesuai preferensi organisasi Anda.' },
      { label: 'Reports', body: 'Membuat laporan dan dashboard sesuai kebutuhan analisis dan pengambilan keputusan Anda.' },
      { label: 'Integration', body: 'Mengintegrasikan OPEN dengan sistem lain yang sudah Anda gunakan.' },
      { label: 'Data Structure', body: 'Menyesuaikan struktur data, field, dan master data sesuai kebutuhan bisnis Anda.' }
    ] as OpenItem[],
    line: ['We don’t ask your business to follow the software.', 'We develop the software around your business.'],

    implTitle: ['From framework', 'to your live system.'],
    phases: [
      { label: 'Discover', body: 'Understand your business & procurement process.' },
      { label: 'Design', body: 'Map workflow, governance & requirements.' },
      { label: 'Customize', body: 'Adapt OPEN to your organization.' },
      { label: 'Develop', body: 'Build and integrate required functions.' },
      { label: 'UAT', body: 'Validate with business users.' },
      { label: 'Deploy', body: 'Training, migration & go-live.' }
    ] as OpenItem[],
    // Slide 21 "Foundation implementation" — scope differs per engagement.
    scopeIntro: 'Cakupan foundation implementation dapat meliputi:',
    scope: [
      { label: 'Installation / Configuration', body: 'Setup sistem dan konfigurasi awal.' },
      { label: 'Business Customization', body: 'Penyesuaian sistem sesuai kebutuhan bisnis.' },
      { label: 'UAT', body: 'Pengujian bersama business users.' },
      { label: 'Forms / Reports', body: 'Pengembangan form dan laporan sesuai kebutuhan.' },
      { label: 'Training', body: 'Pelatihan untuk pengguna sistem.' },
      { label: 'Vendor Data Migration', body: 'Migrasi data vendor ke sistem.' },
      { label: 'Documentation', body: 'Dokumentasi sistem dan proses implementasi.' },
      { label: 'Implementation Reporting', body: 'Laporan kemajuan dan hasil implementasi.' }
    ] as OpenItem[],
    implLine: 'Setiap tahap dilakukan secara terstruktur, kolaboratif, dan terukur.'
  }

  // ---- 12 Advantage & comparison (slides 23, 24, 25) -----------------------
  const advantage = {
    title: ['One framework.', 'Built around your organization.'],
    items: [
      { label: 'Ready Foundation', body: 'Procurement capabilities already structured.' },
      { label: 'Customizable', body: 'Adaptable to your process and governance.' },
      { label: 'End-to-End', body: 'From procurement to contract, purchase and payment.' },
      { label: 'Governance-Ready', body: 'Approval, access, audit & workflow.' },
      { label: 'Integration-Ready', body: 'Designed to work with your existing ecosystem.' },
      { label: 'Scalable', body: 'Can evolve as business requirements change.' }
    ] as OpenItem[],
    compareTitle: ['Choosing the right foundation', 'for your procurement journey.'],
    columns: ['Traditional SaaS', 'Build From Scratch', 'OPEN'],
    // Slide 24. "Ownership Potential" row left out (needs_approval). true = ✓, null = —.
    rows: [
      { label: 'Ready Foundation', values: [true, null, true] },
      { label: 'Custom Process', values: ['Limited', true, true] },
      { label: 'Custom Governance', values: ['Limited', true, true] },
      { label: 'Development Starting Point', values: ['Product', 'Blank', 'Framework'] },
      { label: 'Business Rules', values: ['Configurable', 'Build', 'Customize'] },
      { label: 'Integration', values: ['Depends', 'Build', 'Develop'] },
      { label: 'Time to Develop', values: ['Fast', 'Long', 'Faster starting point'] }
    ] as Array<{ label: string; values: Array<string | true | null> }>,
    compareNote: 'OPEN tidak diposisikan sebagai SaaS plug-and-play.',
    difference: ['SaaS gives you a product.', 'OPEN gives you a foundation to build your system.'],
    saasFlow: [
      { label: 'Product', body: 'A ready-made solution with predefined features.' },
      { label: 'Configure', body: 'Adjust limited settings based on available options.' },
      { label: 'Use', body: 'Use the system as it is, within the product’s limits.' }
    ] as OpenItem[],
    openFlow: [
      { label: 'Framework', body: 'A ready foundation with structured procurement capabilities.' },
      { label: 'Understand', body: 'Understand your business, process, and governance needs.' },
      { label: 'Customize', body: 'Adapt the framework to fit your unique process and rules.' },
      { label: 'Develop', body: 'Build the required functions and extend capabilities.' },
      { label: 'Integrate', body: 'Integrate with your existing systems and third-party applications.' },
      { label: 'Your System', body: 'A system that’s built around your business, ready to deliver value.' }
    ] as OpenItem[],
    differenceLine: ['Same foundation.', 'Different possibilities.']
  }

  // ---- 13 CTA / demo (slide 26) --------------------------------------------
  const cta = {
    title: ['Your procurement process is unique.', 'Your system should be too.'],
    body: 'OPEN menyediakan fondasi procurement yang siap dikembangkan dan dapat dikustomisasi mengikuti proses, tata kelola, integrasi, dan kebutuhan bisnis Anda.',
    line: 'Let’s build your procurement ecosystem.',
    pillars: ['Governance Ready', 'Secure & Controlled', 'Integration Ready', 'Visibility & Insight'],
    // Form options are the deck's own terms (slide 2 symptoms, slide 9 modules).
    challenges: ['Multiple stakeholders', 'Scattered information', 'Manual approvals', 'Siloed data', 'High risk of errors', 'Lainnya'],
    interests: [
      { id: 'procurement', label: 'Procurement' },
      { id: 'vendor', label: 'Vendor Management' },
      { id: 'catalog', label: 'Catalog Management' },
      { id: 'e-auction', label: 'e-Auction' },
      { id: 'full', label: 'Full ecosystem' }
    ]
  }

  /**
   * Content status — anything not `confirmed` is either left off the page or
   * rendered as illustration. Update here when the owner signs off.
   */
  const contentStatus: Record<string, { status: OpenStatus; note: string }> = {
    deckCopy: { status: 'confirmed', note: 'Headlines, labels and descriptions quoted from OPEN PRODUCT 2026.pdf.' },
    supportingCopy: { status: 'needs_approval', note: 'hero.body, cta.body, modulesIntro.body: restatements of the deck, no new facts.' },
    productUi: { status: 'placeholder', note: 'Hero record, approval demo, audit log and dashboard are UI-native illustrations — no numbers, no names. Waiting for real OPEN screens.' },
    sapLogo: { status: 'needs_approval', note: 'Slide 18 shows SAP on ERP. Not rendered until compatibility is confirmed.' },
    regulatoryCompliance: { status: 'needs_approval', note: 'Slide 8 "regulatory compliance" claim — omitted.' },
    ownershipRow: { status: 'needs_approval', note: 'Slide 24 "Ownership Potential" row — omitted.' },
    clientProof: { status: 'needs_approval', note: 'Old brief cases (BSI, Mandiri, Pelindo, Lintasarta, LPEI) and 40/67/35/100% proofs are not part of the 2026 structure — kept in docs/open/00 only.' },
    formDestination: { status: 'placeholder', note: 'No backend — the demo form hands off to the site WhatsApp contact.' }
  }

  return {
    seo,
    hero,
    problem,
    notSaas,
    framework,
    ecosystem,
    modulesIntro,
    procurement,
    vendor,
    catalog,
    auction,
    governance,
    visibility,
    integration,
    security,
    customization,
    advantage,
    cta,
    contentStatus
  }
}

/**
 * Shared demo plumbing: any CTA can pre-select an interest, then scroll to
 * the form. `openModule` lets the ecosystem diagram jump to a core tab.
 */
export function useOpenDemo() {
  const interest = useState<string[]>('open-demo-interest', () => [])
  const activeModule = useState<OpenModuleId>('open-active-module', () => 'procurement')

  const scrollTo = (id: string) => {
    if (!import.meta.client) return
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenisInstance()
    if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.4 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  const requestDemo = (id?: string) => {
    if (id && !interest.value.includes(id)) interest.value = [...interest.value, id]
    scrollTo('demo')
  }

  const openModule = (id: OpenModuleId) => {
    activeModule.value = id
    scrollTo('modules')
  }

  return { interest, activeModule, requestDemo, scrollTo, openModule }
}

/**
 * One-shot "in view" flag for CSS-driven reveals (no per-frame work). The
 * section root gets `is-in` once it crosses the threshold; styles in
 * main.css (`.op-*`) do the rest. Reduced motion: true immediately.
 */
export function useOpenInView(target: Ref<HTMLElement | null>, threshold = 0.18) {
  const inView = ref(false)
  if (!import.meta.client) return inView
  let io: IntersectionObserver | null = null
  onMounted(() => {
    const el = target.value
    if (!el) return
    if (window.matchMedia(reducedMotionQuery.reduce).matches || !('IntersectionObserver' in window)) {
      inView.value = true
      return
    }
    io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          inView.value = true
          io?.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
  })
  onBeforeUnmount(() => io?.disconnect())
  return inView
}

/** True while the element is on screen — for pausing idle loops. */
export function useOpenVisible(target: Ref<HTMLElement | null>) {
  const visible = ref(false)
  if (!import.meta.client) return visible
  let io: IntersectionObserver | null = null
  onMounted(() => {
    const el = target.value
    if (!el || !('IntersectionObserver' in window)) return
    io = new IntersectionObserver((entries) => (visible.value = entries.some((e) => e.isIntersecting)))
    io.observe(el)
  })
  onBeforeUnmount(() => io?.disconnect())
  return visible
}

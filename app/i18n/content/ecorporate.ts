import type { DeepPartial } from '~/utils/localize'
import type { EcorporateData } from '~/composables/useEcorporate'

// Indonesian overlay for useEcorporate(). `heroLines` stay English: they are
// the keys of the hero highlight (Hero.vue shows them through t()). Each
// value's `source` is an exact excerpt of its `sentence` (Values.vue
// underlines it by position). Ids and `temporary` flags stay as-is.
const P = [
  'e-CORPORATE adalah platform digital enterprise yang dirancang untuk menghubungkan proses bisnis, orang, dan informasi dalam satu lingkungan yang terintegrasi.',
  'Dibangun untuk membantu organisasi mengelola operasionalnya secara lebih efisien, e-CORPORATE menyediakan fondasi digital terstruktur yang dapat disesuaikan dengan kebutuhan bisnis, alur kerja organisasi, dan kebutuhan operasional yang spesifik.',
  'Dengan membawa proses-proses utama ke dalam lingkungan digital yang terhubung, e-CORPORATE membantu organisasi meningkatkan kolaborasi, memperkuat tata kelola, meningkatkan visibilitas operasional, dan mengambil keputusan yang lebih tepat.'
]

export const ECORPORATE_ID: DeepPartial<EcorporateData> = {
  seo: {
    title: 'e-CORPORATE — Platform Digital Enterprise | PASTI',
    description: 'Platform digital enterprise yang menghubungkan orang, proses, dan informasi dalam satu lingkungan terintegrasi.'
  },
  category: 'Platform Digital Enterprise',
  short:
    'e-CORPORATE adalah platform digital enterprise yang menghubungkan orang, proses, dan informasi dalam satu lingkungan terintegrasi — membantu organisasi bekerja lebih cerdas, berkolaborasi lebih baik, dan beroperasi dengan kendali yang lebih kuat.',
  positioning: P,
  problems: [
    { problem: 'Proses internal tidak terhubung', answer: 'Proses terhubung dalam satu lingkungan' },
    { problem: 'Workflow manual', answer: 'Workflow digital yang terstruktur' },
    { problem: 'Informasi terpisah-pisah', answer: 'Informasi di satu tempat' },
    { problem: 'Visibilitas operasional terbatas', answer: 'Visibilitas operasional selama kerja berjalan' },
    { problem: 'Kolaborasi lintas tim sulit', answer: 'Ruang bersama untuk setiap peran' },
    { problem: 'Proses lama yang kaku', answer: 'Fondasi yang disesuaikan dengan organisasi' }
  ],
  solutionHeadline: 'Satu lingkungan enterprise yang terhubung',
  overviewLead: 'Fondasi operasional digital — bukan sekadar satu alat workflow.',
  nodes: [
    { title: 'Orang', body: 'Setiap peran bekerja di lingkungan yang sama, dengan tanggung jawab yang tetap jelas bagi semua yang terlibat.' },
    { title: 'Proses', body: 'Proses bisnis berjalan sebagai alur digital terstruktur, bukan langkah manual yang tersebar.' },
    { title: 'Informasi', body: 'Dokumen dan data berada di satu tempat, tersedia bagi orang yang membutuhkannya.' },
    { title: 'Workflow', body: 'Permintaan, review, dan persetujuan bergerak melalui langkah yang jelas, disesuaikan dengan cara kerja organisasi.' },
    { title: 'Monitoring', body: 'Status dan progres tetap terlihat selama pekerjaan berjalan, bukan disusun ulang setelahnya.' },
    { title: 'Integrasi', body: 'Lingkungan ini direncanakan untuk berjalan berdampingan dengan sistem yang sudah dimiliki organisasi.' }
  ],
  values: [
    { title: 'Terhubung', source: 'menghubungkan proses bisnis, orang, dan informasi', sentence: P[0] },
    { title: 'Terpadu', source: 'dalam satu lingkungan yang terintegrasi', sentence: P[0] },
    { title: 'Fleksibel', source: 'disesuaikan dengan kebutuhan bisnis, alur kerja organisasi, dan kebutuhan operasional', sentence: P[1] },
    { title: 'Efisien', source: 'mengelola operasionalnya secara lebih efisien', sentence: P[1] },
    { title: 'Terkendali', source: 'memperkuat tata kelola', sentence: P[2] },
    { title: 'Skalabel', source: 'fondasi digital yang fleksibel dan skalabel', sentence: 'e-CORPORATE bertujuan menyediakan fondasi digital yang fleksibel dan skalabel.' }
  ],
  capabilityNote: 'Area kemampuan indikatif. Cakupan akhir disesuaikan dengan setiap organisasi.',
  capabilities: [
    { title: 'Manajemen Workflow Internal', body: 'Tentukan bagaimana pekerjaan internal bergerak dari satu langkah dan satu peran ke peran berikutnya.' },
    { title: 'Proses Permintaan & Persetujuan', body: 'Ajukan, review, dan setujui permintaan melalui jalur yang jelas dan dapat ditelusuri.' },
    { title: 'Manajemen Dokumen & Informasi', body: 'Simpan dokumen dan catatan bersama, di samping proses tempatnya berada.' },
    { title: 'Dashboard Operasional', body: 'Tampilan bersama status operasional bagi orang yang bertanggung jawab atasnya.' },
    { title: 'Kolaborasi Berbasis Peran', body: 'Bekerja sama lintas departemen, dengan akses dan tanggung jawab sesuai peran.' },
    { title: 'Monitoring Bisnis', body: 'Ikuti kinerja proses dan di mana perhatian dibutuhkan.' },
    { title: 'Notifikasi & Pelacakan Tugas', body: 'Beri tahu orang apa yang menunggu mereka dan apa yang sudah berjalan.' },
    { title: 'Integrasi Enterprise', body: 'Hubungkan lingkungan ini dengan sistem enterprise yang sudah ada bila diperlukan.' }
  ],
  useCaseNote: 'Contoh skenario — ilustrasi, bukan implementasi klien yang sudah ada.',
  useCases: [
    { title: 'Permintaan & Persetujuan Internal', body: 'Permintaan berjalan dari pengajuan hingga keputusan, dengan setiap serah terima tercatat.', steps: ['Ajukan', 'Review', 'Setujui', 'Beri tahu'] },
    { title: 'Dashboard Manajemen', body: 'Manajemen melihat kondisi operasional dalam satu tampilan terpadu.', steps: ['Kumpulkan', 'Satukan', 'Lihat'] },
    { title: 'Workflow Dokumen', body: 'Dokumen mengikuti jalur review yang jelas, bukan beredar lewat email.', steps: ['Draft', 'Review', 'Setujui', 'Arsipkan'] },
    { title: 'Kolaborasi Departemen', body: 'Tim mengoordinasikan pekerjaan bersama dengan kepemilikan yang jelas di setiap langkah.', steps: ['Tugaskan', 'Koordinasi', 'Serahkan'] },
    { title: 'Monitoring Operasional', body: 'Operasional dipantau selama berjalan, sehingga masalah muncul lebih awal.', steps: ['Pantau', 'Tandai', 'Tindak'] },
    { title: 'Digitalisasi Proses Bisnis', body: 'Proses berbasis kertas atau spreadsheet menjadi alur digital yang terstruktur.', steps: ['Petakan', 'Atur', 'Jalankan'] }
  ],
  configHeadline: { before: 'Sesuaikan platform dengan organisasi Anda — ', mark: 'bukan sebaliknya' },
  configChain: ['Organisasi', 'Peran', 'Workflow', 'Persetujuan', 'Proses', 'Informasi', 'Dashboard'],
  configAdapts: ['Struktur organisasi', 'Peran pengguna', 'Workflow', 'Persetujuan', 'Kebutuhan bisnis', 'Kebutuhan operasional'],
  integrationNote: 'Contoh target integrasi — bukan daftar integrasi yang sudah dipastikan didukung.',
  integrationTargets: ['ERP', 'HR', 'Keuangan', 'Database Internal', 'Aplikasi Pihak Ketiga'],
  integrationBody: 'e-CORPORATE diposisikan sebagai lapisan penghubung di dalam enterprise. Integrasi ditentukan per organisasi, mengikuti sistem yang sudah berjalan.',
  governanceThemes: ['Workflow terstruktur', 'Tanggung jawab berbasis peran', 'Visibilitas proses', 'Visibilitas persetujuan', 'Informasi terpusat', 'Monitoring operasional', 'Akuntabilitas'],
  trail: [
    { step: 'Permintaan diajukan', role: 'Pemohon' },
    { step: 'Direview', role: 'Kepala departemen' },
    { step: 'Disetujui', role: 'Approver' },
    { step: 'Tercatat', role: 'Pemilik informasi' }
  ],
  outcomes: ['Kolaborasi lebih baik', 'Kerja manual berkurang', 'Visibilitas meningkat', 'Tata kelola lebih kuat', 'Proses lebih konsisten', 'Keputusan lebih tepat'],
  why: [
    { title: 'Pengalaman solusi enterprise custom', body: 'Kami membangun solusi enterprise di sekitar setiap organisasi, bukan memaksakan template yang kaku.' },
    { title: 'Pendekatan yang mengutamakan bisnis', body: 'Pekerjaan dimulai dari proses bisnis dan orang-orangnya, lalu teknologi mengikuti.' },
    { title: 'Pola pikir integrasi', body: 'Sistem baru direncanakan agar bekerja dengan sistem yang sudah dimiliki organisasi.' },
    { title: 'Implementasi yang fleksibel', body: 'Cakupan dan peluncuran menyesuaikan struktur organisasi dan kebutuhan operasional.' },
    { title: 'Pengerjaan dan dukungan end-to-end', body: 'Dari discovery dan pengembangan hingga peluncuran dan dukungan berkelanjutan.' }
  ],
  demo: {
    headline: { before: 'Siap menghubungkan ', mark: 'operasi enterprise Anda', after: '?' },
    body: 'Mari diskusikan bagaimana e-CORPORATE dapat disesuaikan dengan organisasi, workflow, dan kebutuhan operasional Anda.'
  }
}

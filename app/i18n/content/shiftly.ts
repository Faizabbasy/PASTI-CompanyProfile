import type { DeepPartial } from '~/utils/localize'
import type { ShiftlyData } from '~/composables/useShiftly'

// Indonesian overlay for useShiftly(). Ids, `kind`, `standard` flags, image
// paths, company sizes and the (unrendered) commercial data stay as-is.
export const SHIFTLY_ID: DeepPartial<ShiftlyData> = {
  seo: {
    title: 'SHIFTLY — Platform HRIS & Workforce Modern | PASTI',
    description:
      'SHIFTLY adalah platform HRIS dan workforce yang dapat dikustomisasi untuk mengelola karyawan, absensi, payroll, kinerja, workflow, dan perangkat kerja yang terhubung dalam satu sistem terintegrasi.'
  },
  hero: {
    eyebrow: 'Platform HRIS Modern',
    headline: 'Semua Urusan HR, Lebih Sederhana.',
    body: 'SHIFTLY membantu organisasi Anda mengelola orang, proses, dan kinerja dalam satu platform terpadu.',
    pillars: ['HRIS All-in-One', 'Modul Kustom', 'Aplikasi Mobile', 'Insight Berbasis Data'],
    enterprise: 'Infrastruktur HR Enterprise yang Tumbuh Bersama Bisnis Anda.',
    traits: ['Fleksibel', 'Skalabel', 'Dapat Dikustomisasi', 'Siap Enterprise'],
    dashboard: { alt: 'Dashboard web SHIFTLY: ringkasan HR berisi kartu karyawan, cuti, absensi dan payroll, insight workforce, serta persetujuan yang menunggu' },
    mobile: { alt: 'Beranda aplikasi mobile SHIFTLY: kartu check-in, akses cepat ke absensi, cuti, slip gaji dan jadwal, serta jadwal mendatang' }
  },
  platform: {
    eyebrow: 'Lebih dari sekadar HRIS',
    headline: 'Platform Operasional Workforce untuk Enterprise.',
    body: 'Satukan orang, proses, dan teknologi dalam satu platform cerdas untuk mendorong kinerja, keterlibatan, dan pertumbuhan bisnis.',
    layers: [
      { name: 'Orang', body: 'Berdayakan pengalaman setiap karyawan.' },
      { name: 'Proses', body: 'Otomatiskan dan optimalkan workflow.' },
      { name: 'Data', body: 'Keputusan lebih tepat dengan insight real-time.' },
      { name: 'Teknologi', body: 'Skalabel, aman, dan dibangun untuk enterprise.' }
    ],
    capabilities: [
      { name: 'Manajemen Workforce', body: 'Pengelolaan siklus karyawan dari awal hingga akhir.' },
      { name: 'Otomasi Cerdas', body: 'Sederhanakan proses HR dan kurangi pekerjaan manual.' },
      { name: 'Pengembangan Kinerja', body: 'Dorong target, feedback, dan pertumbuhan berkelanjutan.' },
      { name: 'Analitik Real-time', body: 'Insight yang bisa ditindaklanjuti untuk keputusan lebih baik.' },
      { name: 'Aman & Andal', body: 'Keamanan kelas enterprise untuk setiap integrasi.' },
      { name: 'Integrasi Mulus', body: 'Terhubung dengan sistem bisnis penting Anda.' }
    ]
  },
  moduleGroups: [
    {
      label: 'Operasional SDM Inti',
      modules: [
        { name: 'Manajemen Karyawan', body: 'Data karyawan, struktur organisasi, dan profil yang terpusat.' },
        { name: 'Organisasi', body: 'Kelola struktur, tim, dan posisi.' },
        { name: 'Absensi & Shift', body: 'Absensi mobile, GPS, penjadwalan shift, dan pengelolaan lembur.' },
        { name: 'Cuti & Izin', body: 'Pengajuan cuti, persetujuan, dan pelacakan saldo jadi mudah.' },
        { name: 'Payroll', body: 'Pemrosesan payroll, komponen, potongan, dan laporan detail.' }
      ]
    },
    {
      label: 'Talenta & Kinerja',
      modules: [
        { name: 'Kinerja', body: 'Tetapkan target, pantau KPI, dan evaluasi kinerja karyawan.' },
        { name: 'Rekrutmen', body: 'Kelola kandidat, pipeline rekrutmen, dan perjalanan onboarding.' },
        { name: 'Pelatihan', body: 'Rencanakan, tugaskan, dan pantau pelatihan serta pengembangan karyawan.' }
      ]
    },
    {
      label: 'Operasional Harian',
      modules: [
        { name: 'Pengumuman', body: 'Sebarkan informasi penting dan libatkan karyawan.' },
        { name: 'Reimbursement', body: 'Kelola klaim biaya dan reimbursement.' },
        { name: 'Biaya & Klaim', body: 'Ajukan dan setujui biaya serta klaim secara efisien.' },
        { name: 'Aset', body: 'Kelola aset perusahaan dan penugasannya.' },
        { name: 'Kalender', body: 'Kalender perusahaan dan jadwal penting.' },
        { name: 'Dokumen', body: 'Simpan dan kelola dokumen HR penting.' }
      ]
    },
    {
      label: 'Platform & Pelaporan',
      modules: [
        { name: 'Dashboard', body: 'Ringkasan real-time metrik utama HR.' },
        { name: 'Laporan', body: 'Buat laporan dan analitik HR.' },
        { name: 'Pengaturan', body: 'Konfigurasi preferensi sistem dan akses pengguna.' }
      ]
    }
  ],
  modulesMore: 'Dan masih banyak lagi — aset, kebijakan, laporan, manajemen dokumen, dan lainnya.',
  compare: [
    { capability: 'Modul HRIS Inti', standard: { label: 'Termasuk' } },
    { capability: 'Aplikasi Mobile', standard: { label: 'Termasuk' } },
    { capability: 'Pelaporan & Analitik', standard: { label: 'Termasuk' } },
    { capability: 'Persetujuan Berjenjang', standard: { label: 'Termasuk' } },
    { capability: 'Integrasi API', standard: { label: 'Termasuk (API Standar)' }, enterprise: { label: 'Tersedia integrasi lanjutan' } },
    { capability: 'Kustomisasi Workflow', standard: { label: 'Terbatas (Alur Standar)' }, enterprise: { label: 'Tersedia sebagai Add-on' } },
    { capability: 'Pengembangan Modul', standard: { label: 'Tidak Tersedia' }, enterprise: { label: 'Tersedia sebagai Add-on' } },
    { capability: 'Custom Branding / White-label', standard: { label: 'Tidak Tersedia' }, enterprise: { label: 'Tersedia sebagai Add-on' } },
    { capability: 'Integrasi IoT & Perangkat Pintar', standard: { label: 'Tidak Tersedia' }, enterprise: { label: 'Tersedia sebagai Add-on' } },
    { capability: 'Sinkron Fingerprint Real-time', standard: { label: 'Termasuk' }, enterprise: { label: 'Integrasi perangkat lanjutan' } },
    { capability: 'Face Recognition', standard: { label: 'Opsional' }, enterprise: { label: 'Siap enterprise (Add-on)' } },
    { capability: 'Integrasi Smart Door Lock', standard: { label: 'Tidak Tersedia' }, enterprise: { label: 'Tersedia sebagai Add-on' } },
    { capability: 'Opsi Deployment', enterprise: { label: 'Dedicated / On-Premise' } },
    { capability: 'Skalabilitas', standard: { label: 'Siap enterprise' }, enterprise: { label: 'Dapat diperluas penuh' } }
  ],
  plans: {
    eyebrow: 'Langganan standar vs ekspansi enterprise',
    headline: 'Mulai dari yang esensial. Kembangkan saat dibutuhkan.',
    body: 'Kapabilitas HRIS inti sudah termasuk dalam langganan standar. Kustomisasi, branding, dan integrasi enterprise tersedia terpisah sesuai kebutuhan organisasi Anda.',
    expansion: ['Kustomisasi Workflow', 'Rekayasa Modul', 'Branding Enterprise', 'Integrasi API', 'Integrasi IoT & Perangkat Pintar', 'Dan lainnya'],
    expansionNote: 'Tersedia sesuai cakupan implementasi dan kebutuhan operasional.',
    why: 'Dapatkan fondasi HRIS yang kuat hari ini, lalu kembangkan seiring organisasi Anda tumbuh dan kebutuhan berubah.'
  },
  devices: {
    eyebrow: 'Integrasi IoT & perangkat pintar',
    headline: 'Mudah terhubung ke perangkat pintar.',
    body: 'Hubungkan SHIFTLY dengan perangkat pintar dan ekosistem IoT untuk mengotomatiskan absensi, keamanan, dan operasional kantor secara real-time.',
    items: [
      { name: 'Absensi Fingerprint', body: 'Catat absensi seketika dengan perangkat fingerprint. Data tersinkron real-time untuk memastikan akurasi dan mengurangi kecurangan.' },
      { name: 'Face Recognition', body: 'Akses yang mulus dan aman dengan teknologi face recognition untuk pintu dan masuk kantor.' },
      { name: 'Smart Door Lock', body: 'Kendalikan dan pantau akses pintu dari jarak jauh, terintegrasi dengan SHIFTLY untuk keamanan dan kenyamanan lebih.' },
      { name: 'Sensor Lingkungan', body: 'Data real-time dari sensor dan perangkat IoT lainnya, dikelola dari dashboard yang sama.' }
    ],
    benefits: [
      { name: 'Sinkron Real-time', body: 'Tangkap dan sinkronkan data dari perangkat IoT seketika untuk informasi yang akurat dan terbaru.' },
      { name: 'Keamanan Lebih Kuat', body: 'Perkuat kontrol akses dan autentikasi dengan integrasi smart lock dan biometrik.' },
      { name: 'Platform Terpadu', body: 'Kelola semua perangkat dan data dari satu dashboard di SHIFTLY.' },
      { name: 'Keputusan Lebih Tepat', body: 'Manfaatkan data dan insight real-time untuk meningkatkan efisiensi kerja.' }
    ],
    note: '…dan integrasi lainnya, disesuaikan per proyek.'
  },
  branding: {
    eyebrow: 'Add-on enterprise',
    headline: 'Enterprise Branding Suite.',
    body: 'Jadikan SHIFTLY benar-benar milik Anda. Enterprise Branding Suite memberi organisasi Anda pengalaman white-label penuh yang mencerminkan identitas brand Anda di seluruh platform.',
    features: [
      { name: 'Platform White-label', body: 'Hilangkan branding SHIFTLY dan jadikan milik Anda.' },
      { name: 'Domain Kustom', body: 'Gunakan domain perusahaan untuk pengalaman brand yang menyatu.' },
      { name: 'Identitas Korporat', body: 'Terapkan logo, warna, tipografi, dan identitas visual Anda.' },
      { name: 'Personalisasi UI', body: 'Sesuaikan tampilan platform dengan panduan brand Anda.' },
      { name: 'Penerapan Brand', body: 'Branding konsisten di dashboard web dan aplikasi mobile.' }
    ],
    tagline: 'Brand Anda. Platform Anda. Identitas Anda.'
  },
  why: {
    eyebrow: 'Pembeda kami',
    headline: 'Berbeda sejak dirancang. Lebih baik saat dipakai.',
    body: 'SHIFTLY bukan sekadar HRIS. SHIFTLY memadukan fleksibilitas, fitur andal, dan teknologi modern untuk memberi Anda solusi HR yang benar-benar sesuai dengan bisnis Anda.',
    items: [
      { name: 'Modul Kustom', body: 'Buat atau sesuaikan modul sesuai kebutuhan bisnis Anda.' },
      { name: 'Custom Branding', body: 'Terapkan logo, warna, domain, dan identitas visual Anda.' },
      { name: 'Workflow Fleksibel', body: 'Atur alur persetujuan dan proses sesuai cara kerja Anda.' },
      { name: 'Mudah Terhubung ke IoT', body: 'Hubungkan ke perangkat seperti face recognition, door lock, fingerprint, dan lainnya.' },
      { name: 'Data Real-time', body: 'Sinkron langsung dan pembaruan instan di semua modul.' },
      { name: 'Skalabel & Siap Masa Depan', body: 'Dirancang tumbuh bersama bisnis Anda, dari kecil hingga enterprise.' },
      { name: 'Monitoring Terpusat', body: 'Pantau semua perangkat dan aktivitas dari satu dashboard.' },
      { name: 'Dukungan Khusus', body: 'Implementasi, pelatihan, dan dukungan berkelanjutan.' }
    ],
    statement: { title: 'Sistem Anda. Brand Anda. Aturan Anda.', body: 'SHIFTLY memberi Anda kebebasan membangun platform HR yang benar-benar sesuai dengan organisasi Anda.' }
  },
  architecture: {
    eyebrow: 'Integrasi & arsitektur',
    headline: 'Satu platform di pusat workforce Anda.',
    body: 'Hubungkan SHIFTLY dengan sistem bisnis penting dan perangkat pintar Anda — semua data diperbarui seketika dan akurat, serta dipantau dari satu dashboard.',
    nodes: [
      { name: 'Operasional HR', body: 'Karyawan, absensi, cuti, payroll, kinerja.' },
      { name: 'Web & Mobile', body: 'Dashboard web dan aplikasi mobile untuk HR dan karyawan.' },
      { name: 'Sistem Bisnis', body: 'API standar sudah termasuk; integrasi lanjutan sebagai add-on enterprise.' },
      { name: 'IoT & Perangkat', body: 'Fingerprint, face recognition, smart door lock, sensor.' }
    ],
    deployment: [
      { body: 'Langganan SHIFTLY Standard.' },
      { body: 'Enterprise Expansion.' }
    ]
  },
  pricing: {
    eyebrow: 'Harga',
    headline: 'Paket fleksibel untuk tim yang berkembang dan enterprise.',
    plans: [
      { body: 'Semua modul HRIS inti, aplikasi mobile, pelaporan & analitik, persetujuan berjenjang, dan API standar — di cloud.', points: ['Langganan per pengguna', 'Modul HRIS inti sudah termasuk', 'Deployment cloud'] },
      { body: 'Layanan add-on yang disesuaikan dengan cakupan implementasi dan kebutuhan operasional Anda.', points: ['Rekayasa workflow & modul', 'Branding enterprise / white-label', 'IoT, perangkat & integrasi lanjutan', 'Opsi dedicated / on-premise'] }
    ]
  },
  demo: {
    headline: 'Siap menyederhanakan operasional HR Anda?',
    body: 'Lihat bagaimana SHIFTLY membantu Anda mengelola orang, proses, kinerja, dan perangkat terhubung dalam satu platform terpadu.',
    challenges: ['Manajemen absensi & shift', 'Payroll & reimbursement', 'Manajemen kinerja', 'Rekrutmen & pelatihan', 'Workflow & persetujuan', 'Integrasi perangkat / IoT', 'Custom branding / white-label', 'Lainnya']
  },
  subnav: [{ label: 'Ringkasan' }, { label: 'Modul' }, { label: 'Enterprise' }, { label: 'Perangkat' }, { label: 'Harga' }]
}

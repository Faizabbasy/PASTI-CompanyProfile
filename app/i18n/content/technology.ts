import type { DeepPartial } from '~/utils/localize'
import type { TechnologyData } from '~/composables/useTechnology'

// Indonesian overlay for useTechnology() (/technology). Same facts as the
// English COMPRO 2025 sentences — nothing added. Project / client names in
// `related` stay as they are; case cards come translated from
// useFeaturedCases / useSelectedWork, so `cases` is not overlaid here.
export const TECHNOLOGY_ID: DeepPartial<TechnologyData> = {
  eyebrow: 'Teknologi',
  heading: 'Teknologi untuk mendorong bisnis maju.',
  introBody:
    'Teknologi adalah tulang punggung bisnis modern. PASTI membangun sistem custom yang aman, skalabel, dan sesuai dengan kebutuhan bisnis nyata.',
  servicesEyebrow: 'Yang kami bangun',
  servicesHeading: 'Kapabilitas teknologi',
  services: [
    {
      title: 'Pengembangan Teknologi',
      body: 'Teknologi adalah tulang punggung bisnis modern. PASTI membangun sistem custom yang aman, skalabel, dan sesuai dengan kebutuhan bisnis nyata.',
      keywords: ['Sistem custom', 'Aman', 'Skalabel']
    },
    {
      title: 'Solusi AI Custom',
      body: 'Kami merancang dan menerapkan model AI yang disesuaikan dengan tujuan klien — dari predictive analytics, natural language processing, hingga dashboard machine learning — untuk membantu bisnis mengambil keputusan lebih cepat dan lebih tepat.',
      keywords: ['Predictive analytics', 'Natural language processing', 'Dashboard machine learning']
    },
    {
      title: 'Platform Enterprise',
      body: 'Pengembangan end-to-end (ERP, CRM, LMS, dashboard) sistem kelas enterprise untuk mengelola sumber daya, hubungan pelanggan, modul pembelajaran, dan dashboard operasional dengan pelaporan real-time.',
      keywords: ['ERP', 'CRM', 'LMS', 'Dashboard', 'Pelaporan real-time'],
      related: [{ label: 'Monitoring Produksi Tekstil' }, { label: 'Otomasi Workflow (AT-WF)' }]
    },
    {
      title: 'Pengembangan Aplikasi Mobile & MVP',
      body: 'Pengembangan aplikasi iOS dan Android dengan Flutter dan native stack. Kami juga berspesialisasi dalam desain Minimum Viable Product (MVP) untuk menguji dan memvalidasi ide bisnis dengan cepat.',
      keywords: ['iOS', 'Android', 'Flutter', 'Native stack', 'MVP']
    },
    {
      title: 'Arsitektur Keamanan Siber & Kepatuhan',
      body: 'Sistem secure-by-design yang patuh pada standar industri, termasuk lapisan enkripsi, penetration testing, dan model tata kelola data untuk melindungi informasi sensitif.',
      keywords: ['Secure-by-design', 'Lapisan enkripsi', 'Penetration testing', 'Tata kelola data']
    },
    {
      title: 'Pemeliharaan Sistem & Dukungan SLA',
      body: 'Dukungan operasional jangka panjang dengan model berbasis SLA, yang menjamin kontinuitas, pembaruan, dan performa andal di seluruh sistem yang telah diterapkan.',
      keywords: ['Model berbasis SLA', 'Kontinuitas', 'Pembaruan', 'Performa andal']
    }
  ],
  why: { leadLabel: 'Visi kami' }
}

import type { DeepPartial } from '~/utils/localize'
import type { ServicesData } from '~/composables/useServices'

export const SERVICES_ID: DeepPartial<ServicesData> = {
  services: [
    { title: 'Pengembangan Teknologi', body: 'Kami membangun sistem digital yang aman dan skalabel, sesuai kebutuhan bisnis nyata.', cta: 'Lihat' },
    { title: 'Platform Enterprise', body: 'Platform ERP, CRM, LMS, dan dashboard end-to-end yang menghubungkan orang, proses, dan data real-time.', cta: 'Lihat' },
    { title: 'Pengembangan Aplikasi Mobile', body: 'Aplikasi iOS dan Android dengan Flutter atau native, plus MVP untuk memvalidasi ide bisnis dengan cepat.', cta: 'Lihat' },
    { title: 'Komunikasi Kreatif', body: 'Kami mengubah strategi menjadi komunikasi kreatif yang membangun perhatian, kepercayaan, dan dampak brand.', cta: 'Lihat' },
    { title: 'Keamanan Siber & Kepatuhan', body: 'Sistem yang aman sejak dirancang, dengan enkripsi, penetration testing, dan tata kelola data sesuai standar industri.', cta: 'Lihat' }
  ]
}

import type { DeepPartial } from '~/utils/localize'
import type { pageSeo } from '~/composables/useSeo'

// Indonesian search titles / descriptions for the static pages (pageSeo).
// Same facts as the English copy — nothing added.
export const PAGE_SEO_ID: DeepPartial<typeof pageSeo> = {
  home: {
    title: 'PASTI — Agensi Teknologi & Kreatif di Indonesia',
    description: 'Kami membangun solusi teknologi dan kreatif untuk bisnis yang siap melangkah maju — dari platform enterprise dan AI hingga komunikasi brand.'
  },
  about: {
    title: 'Tentang PASTI — Mengubah Kompleksitas Menjadi Kepastian',
    description: 'PASTI menyatukan teknologi dan kreativitas dalam satu layanan. Sejak 2020: 70+ proyek untuk 50+ klien, dari BUMN hingga brand terkemuka.'
  },
  work: {
    title: 'Karya Pilihan — Proyek & Studi Kasus | PASTI',
    description: 'Melihat lebih dekat cara kami bekerja bersama klien — proyek nyata, dari brief hingga hasil yang berjalan sampai hari ini.'
  },
  creative: {
    title: 'Creative — Brand, Kampanye & Video | PASTI',
    description: 'Kreativitas untuk hasil bisnis. Kami memadukan kreativitas, strategi, dan eksekusi untuk membangun brand yang menonjol, menarik perhatian, dan dipercaya.'
  },
  technology: {
    title: 'Technology — Platform Enterprise, AI & Aplikasi | PASTI',
    description: 'Teknologi yang dibangun untuk menggerakkan bisnis. PASTI membangun sistem custom yang aman, skalabel, dan sesuai kebutuhan bisnis nyata.'
  },
  insights: {
    title: 'Insights — Jurnal PASTI',
    description: 'Perspektif tentang teknologi, kreatif, dan bisnis — dari pekerjaan yang kami lakukan bersama klien setiap hari.'
  },
  contact: {
    title: 'Hubungi PASTI — Mari Bangun yang Penting',
    description: 'Punya tantangan? Hubungi PASTI lewat WhatsApp atau email, atau kirim brief. Kami membangun solusi teknologi dan kreatif untuk bisnis yang siap melangkah maju.'
  }
}

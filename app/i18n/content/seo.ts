import type { DeepPartial } from '~/utils/localize'
import type { pageSeo } from '~/composables/useSeo'

// Indonesian search titles / descriptions for the static pages (pageSeo).
// Same facts as the English copy — nothing added. SEO pass 2026-10-27:
// titles lead with the terms people search (software house, jasa pembuatan
// aplikasi, agensi kreatif Jakarta, portofolio); ≤60 / ≤160 characters.
export const PAGE_SEO_ID: DeepPartial<typeof pageSeo> = {
  home: {
    title: 'PASTI People — Software House & Agensi Kreatif di Jakarta',
    description: 'PASTI membangun aplikasi, software custom, platform enterprise, AI, dan kampanye kreatif untuk bisnis di Indonesia. 70+ proyek untuk 50+ klien sejak 2020.'
  },
  about: {
    title: 'Tentang PASTI — Partner Teknologi & Kreatif Sejak 2020',
    description: 'PASTI menyatukan teknologi dan kreativitas dalam satu layanan. Sejak 2020: 70+ proyek untuk 50+ klien, dari BUMN hingga brand terkemuka.'
  },
  work: {
    title: 'Portofolio — Proyek & Studi Kasus PASTI',
    description: 'Portofolio PASTI: proyek teknologi dan kreatif untuk IKEA Indonesia, Jasa Marga, Pertamina, CIMB Niaga, dan lainnya — dari brief hingga hasil yang berjalan.'
  },
  creative: {
    title: 'Agensi Kreatif Jakarta — Brand, Kampanye & Video | PASTI',
    description: 'Layanan kreatif PASTI: identitas brand & UI/UX, kampanye terintegrasi, social media, video vertikal, dan production house — kreativitas untuk hasil bisnis.'
  },
  technology: {
    title: 'Jasa Pembuatan Aplikasi & Software Custom | PASTI',
    description: 'PASTI membangun software custom, platform enterprise, aplikasi mobile & MVP, solusi AI, dan keamanan siber yang aman, skalabel, dan sesuai kebutuhan bisnis.'
  },
  insights: {
    title: 'Insights — Artikel Teknologi, Bisnis & Kreatif | PASTI',
    description: 'Jurnal PASTI: perspektif tentang keamanan siber, teknologi enterprise, AI, masa depan bisnis, brand, dan produk digital — dari pekerjaan kami bersama klien.'
  },
  contact: {
    title: 'Hubungi PASTI — Konsultasi Proyek Aplikasi & Kreatif',
    description: 'Diskusikan proyek aplikasi, software, atau kreatif Anda dengan PASTI lewat WhatsApp atau email, atau kirim brief. Kantor kami di Jakarta Selatan.'
  }
}

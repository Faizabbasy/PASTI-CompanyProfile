import type { DeepPartial } from '~/utils/localize'
import type { CreativeData } from '~/composables/useCreative'
import type { CreativePageContent } from '#shared/utils/creativePublic'

// Indonesian overlay for useCreative() — text only. Service titles stay as
// they are: they are the service names used site-wide and are baked into
// the owner's capability visuals. Project names, the BSI testimonial (a
// person's own words) and funnel stage names (standard marketing terms) are
// not translated. Selected-work cards / company data come from their own
// composables.
export const CREATIVE_ID: DeepPartial<CreativeData> = {
  heading: 'Kreativitas untuk hasil bisnis.',
  introBody: 'Kami memadukan kreativitas, strategi, dan eksekusi untuk membangun brand yang menonjol, menarik perhatian, dan dipercaya.',
  servicesEyebrow: 'Apa yang kami buat',
  servicesHeading: 'Kapabilitas kreatif',
  services: [
    {
      body: 'Kami memadukan kreativitas, strategi, dan eksekusi untuk membangun brand yang menonjol, menarik perhatian, dan dipercaya.',
      keywords: ['Kreativitas', 'Strategi', 'Eksekusi']
    },
    {
      body: 'Pengembangan strategi kampanye 360° dengan pesan yang seragam di kanal offline dan online, dirancang untuk memaksimalkan jangkauan dan dampak.',
      keywords: ['Kampanye 360°', 'Pesan seragam', 'Offline + online']
    },
    {
      body: 'Penyusunan strategi media sosial yang disesuaikan, pengelolaan konten harian, eksekusi berbasis tren, dan optimasi berkelanjutan untuk mendorong engagement.',
      keywords: ['Strategi sosial', 'Konten harian', 'Berbasis tren', 'Optimasi']
    },
    {
      body: 'Produksi video pendek untuk TikTok, Instagram Reels, dan YouTube Shorts—dengan editing cepat, hook yang kuat, dan integrasi tren untuk memaksimalkan performa organik.',
      keywords: ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'Hook yang kuat']
    },
    {
      body: 'Kapabilitas produksi in-house yang lengkap, termasuk video komersial, testimoni, fotografi lifestyle dan studio, motion graphics, serta editing pascaproduksi.',
      keywords: ['Video komersial', 'Fotografi', 'Motion graphics', 'Pascaproduksi']
    },
    {
      body: 'Pengembangan logo, sistem visual, panduan brand, dan desain yang berpusat pada pengguna untuk website dan aplikasi, demi pengalaman digital yang mulus dan profesional.',
      keywords: ['Logo', 'Sistem visual', 'Panduan brand', 'UI/UX']
    }
  ],
  work: {
    feature: {
      category: 'Strategi Performance Marketing',
      challenge: [
        'Bank digital di Indonesia masih mengandalkan promo bunga tinggi ("bakar uang") untuk mendapatkan pengguna.',
        'Model ini tidak berkelanjutan — pengguna pergi begitu insentif berhenti.',
        'Produk tradisional seperti kartu kredit stagnan dalam akuisisi.'
      ],
      gamePlan: 'Digital Wallet Banking: Rekening Ponsel → OCTO Mobile → OctoPay — ekosistem digital-first yang dibangun di atas rekening dan nomor ponsel.',
      funnel: [
        { text: 'Kampanye digital, influencer, dan bundling merchant.' },
        { text: 'Edukasi manfaat digital wallet banking dibandingkan e-wallet non-bank.' },
        { text: 'Onboarding digital dengan e-KYC.' },
        { text: 'Program loyalitas berbasis transaksi, bukan promo bunga.' }
      ],
      playbook: [
        'Registrasi rekening dibundel sehingga OctoPay aktif otomatis.',
        'PayLater ditawarkan silang ke nasabah tabungan dan kartu kredit.',
        'Ekosistem kemitraan: cashback transportasi, belanja online, F&B.',
        'Program referral berbasis transaksi, bukan berbasis saldo.'
      ]
    }
  },
  why: { leadLabel: 'Misi kami' },
  visuals: [
    {},
    {},
    {},
    {},
    {},
    {},
    { label: 'Kreatif & Brand' },
    { label: 'Produk Digital & UX' },
    { label: 'Ide yang Menggerakkan Bisnis' }
  ]
}

// Indonesian overlay for the wording hard-coded in buildLegacyCreativeContent().
export const CREATIVE_PAGE_ID: DeepPartial<CreativePageContent> = {
  hero: {
    markerMeta: 'Gerakkan untuk melukis',
    primaryCta: { label: 'Kirim brief' },
    secondaryCtaLabel: 'Apa yang kami buat'
  },
  services: { sectionLabel: 'Layanan' },
  wall: { sectionLabel: 'Dinding studio', titleLead: 'Dibuat di', titleAccent: 'studio' },
  work: {
    sectionLabel: 'Karya pilihan',
    eyebrow: 'Bukti kualitas',
    title: 'Karya kreatif pilihan',
    uiux: { title: 'UI/UX & pengalaman digital' }
  }
}

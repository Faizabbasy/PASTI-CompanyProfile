import type { DeepPartial } from '~/utils/localize'
import type { AboutData } from '~/composables/useAbout'
import type { AboutPageContent } from '#shared/utils/aboutPublic'

// Indonesian overlay for useAbout() — text only. The brand essence line
// ("Certainty Through Execution") is the brand tagline and stays as is;
// company story / facts / stats come from useCompany / useWhoWeAre.
export const ABOUT_ID: DeepPartial<AboutData> = {
  eyebrow: 'Tentang PASTI',
  promise: 'Kami mengubah kompleksitas menjadi kepastian.',
  positioning: 'Mitra Eksekusi Teknologi × Kreatif',
  introHeading: 'DNA Kami',
  method: ['Memahami masalahnya', 'Menyusun strukturnya', 'Membangun solusinya', 'Menghadirkannya', 'Mendampingi langkah berikutnya'],
  coreEmotion: ['Percaya diri', 'Momentum', 'Kepastian'],
  pillars: [
    { name: 'Kepastian', meaning: 'Mengurangi ambiguitas lewat kejelasan, struktur, dan eksekusi yang dapat diprediksi.', visual: 'Hierarki yang tegas, perataan yang bersih, state yang jelas.' },
    { name: 'Presisi', meaning: 'Bekerja dengan disiplin engineering dan perhatian pada detail.', visual: 'Grid, spasi, perataan yang tepat, gerak yang terkendali.' },
    { name: 'Momentum', meaning: 'Bergerak cepat dengan kendali, bukan terburu-buru.', visual: 'Transisi yang berarah, penanda progres, interaksi yang responsif.' },
    { name: 'Praktis', meaning: 'Karya teknologi dan kreatif harus mudah dipahami dan berguna.', visual: 'Kejelasan sebelum dekorasi; konten tetap mudah digunakan.' },
    { name: 'Dampak', meaning: 'Menilai karya dari apa yang berubah bagi bisnis atau pengguna.', visual: 'Bukti nyata, proyek, hasil, nilai yang terukur.' }
  ]
}

// Indonesian overlay for the wording hard-coded in buildLegacyAboutContent().
// The headline stays three pieces (lead / animated word / two-word tail).
// accentWords: words of the Indonesian intro paragraph (useCompany story[0])
// that get the yellow underline — matched as whole, lower-case words.
export const ABOUT_PAGE_ID: DeepPartial<AboutPageContent> = {
  hero: {
    lead: 'Kami mengubah',
    animatedWord: 'kompleksitas',
    tail: 'menjadi kepastian',
    primaryCta: { label: 'Kerja sama dengan kami' },
    secondaryCtaLabel: 'Cara kerja PASTI'
  },
  story: {
    accentWords: ['teknologi', 'kreativitas', 'terpadu', 'skalabel', 'terukur']
  },
  visionMission: { visionLabel: 'Visi', missionLabel: 'Misi' }
}

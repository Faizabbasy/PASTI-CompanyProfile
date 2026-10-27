import type { DeepPartial } from '~/utils/localize'
import type { InsightsPageContent } from '#shared/utils/insightsPublic'

// Indonesian wording for the /insights legacy content (buildLegacyInsightsContent).
// "Insights" stays as the masthead word (one word, filled with the posters).
// Topics are filter keys and stay English (shown through t()).
export const INSIGHTS_PAGE_ID: DeepPartial<InsightsPageContent> = {
  hero: {
    eyebrow: 'Jurnal PASTI',
    lede: 'Perspektif tentang teknologi, kreatif, dan bisnis — dari pekerjaan yang kami lakukan bersama klien setiap hari.',
    primaryCtaLabel: 'Baca edisi ini',
    secondaryCta: { label: 'Ceritakan pada kami' }
  },
  contents: {
    sectionLabel: 'Daftar isi',
    title: 'Di edisi ini'
  }
}

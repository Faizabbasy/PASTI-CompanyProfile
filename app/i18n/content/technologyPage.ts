import type { DeepPartial } from '~/utils/localize'
import type { TechnologyPageContent } from '#shared/utils/technologyPublic'

// Indonesian wording for the /technology legacy content
// (buildLegacyTechnologyContent). The hero headline is three lines; the last
// sits on the yellow marker and gets the yellow full stop.
export const TECHNOLOGY_PAGE_ID: DeepPartial<TechnologyPageContent> = {
  hero: {
    headlineLines: ['Teknologi untuk', 'mendorong bisnis', 'maju'],
    primaryCta: { label: 'Mulai proyek' },
    secondaryCtaLabel: 'Jelajahi kapabilitas'
  },
  work: { sectionLabel: 'Studi kasus', eyebrow: 'Bukti pengerjaan', title: 'Studi kasus teknologi' }
}

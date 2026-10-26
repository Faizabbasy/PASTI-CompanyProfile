import type { CaseStudyContent } from '#shared/utils/caseStudySchema'
import type { ProjectContent } from '#shared/utils/projectSchema'
import type { WorkContent } from '#shared/utils/workSchema'

// DEV/DEMO seed for the Work CMS (dummy phase). Never real content: every
// record is flagged `dummy: true`, names carry "[DEMO]" and copy is Lorem
// ipsum. Seeded as drafts only; the public endpoint refuses dummy records
// outside `nuxt dev`. Images reuse existing public assets.

export const WORK_DUMMY_MARKERS = ['[DEMO]', 'Lorem ipsum']

export const WORK_DUMMY_PROJECTS: { id: string; content: ProjectContent }[] = [
  {
    id: 'prj-demo-alpha',
    content: {
      name: '[DEMO] Project Alpha',
      slug: 'demo-alpha',
      clientDisplayName: '',
      category: 'Lorem Category',
      filterGroup: 'Lorem',
      year: '',
      shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      poster: '/images/selected-work/ikea-indonesia.webp',
      posterAlt: 'Lorem ipsum dolor sit amet'
    }
  },
  {
    id: 'prj-demo-beta',
    content: {
      name: '[DEMO] Project Beta',
      slug: 'demo-beta',
      clientDisplayName: '[DEMO] Client',
      category: 'Lorem Category',
      filterGroup: 'Ipsum',
      year: '',
      shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      poster: '/images/selected-work/powerhours.webp',
      posterAlt: 'Lorem ipsum dolor sit amet'
    }
  },
  {
    id: 'prj-demo-gamma',
    content: {
      name: '[DEMO] Project Gamma',
      slug: 'demo-gamma',
      clientDisplayName: '',
      category: 'Dolor Category',
      filterGroup: 'Ipsum',
      year: '',
      shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      poster: '/images/selected-work/hdi-healthy-lifestyle.webp',
      posterAlt: 'Lorem ipsum dolor sit amet'
    }
  }
]

export const WORK_DUMMY_CASES: { id: string; content: CaseStudyContent }[] = [
  {
    id: 'cs-demo-beta',
    content: {
      projectId: 'prj-demo-beta',
      slug: 'demo-beta',
      categoryOverride: '',
      context: { body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
      challenge: { points: ['Lorem ipsum dolor sit amet.', 'Consectetur adipiscing elit.'] },
      approach: { mode: 'solution', points: ['Lorem ipsum dolor sit amet.', 'Sed do eiusmod tempor.'] },
      outcome: { points: ['Lorem ipsum dolor sit amet.'] },
      insight: '',
      timeline: { total: '', steps: [] },
      technologyLabels: ['Lorem', 'Ipsum'],
      metrics: [
        { id: 'm-demo-1', value: '00%', label: 'Lorem ipsum (demo metric)', context: '', sourceNote: 'DEMO — not a real claim', claimStatus: 'needs_approval', active: true, sortOrder: 1 }
      ],
      gallery: [
        { id: 'g-demo-1', src: '/images/selected-work/powerhours.webp', alt: 'Lorem ipsum dolor sit amet', kind: 'poster', sourceNote: 'DEMO', approvalStatus: 'confirmed', active: true, sortOrder: 1 }
      ]
    }
  }
]

export const WORK_DUMMY_CONTENT: WorkContent = {
  hero: {
    eyebrow: 'Lorem',
    headlineLine1: 'Lorem',
    headlineLine2: 'ipsum',
    lede: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    primaryCtaLabel: 'Lorem ipsum',
    secondaryCtaLabel: 'Dolor sit',
    secondaryCtaUrl: '/contact'
  },
  projectIndex: {
    sectionLabel: 'Lorem',
    items: [
      { id: 'wp-demo-1', projectId: 'prj-demo-alpha', sortOrder: 1, active: true },
      { id: 'wp-demo-2', projectId: 'prj-demo-beta', sortOrder: 2, active: true },
      { id: 'wp-demo-3', projectId: 'prj-demo-gamma', sortOrder: 3, active: true }
    ]
  },
  featuredCases: {
    sectionLabel: 'Lorem',
    titleLead: 'Lorem',
    titleAccent: 'ipsum dolor.',
    supportingCopy: 'Lorem ipsum dolor sit amet.',
    items: [{ id: 'wc-demo-1', caseStudyId: 'cs-demo-beta', sortOrder: 1, active: true }]
  },
  seo: {
    metaTitle: '[DEMO] Lorem ipsum',
    metaDescription: 'Lorem ipsum dolor sit amet.',
    ogImage: '',
    canonicalUrl: '',
    noIndex: true
  }
}

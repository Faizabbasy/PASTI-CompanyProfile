import type { TechnologyContent } from '#shared/utils/technologySchema'

// DUMMY / DEV DATA — Technology CMS validation only. NOT the public
// /technology content (that still comes from useTechnology) and must never
// be migrated as-is. Placeholder copy only; images are existing site assets
// used as stand-ins; project refs point at existing records (no new data).

const L = 'Lorem ipsum dolor sit amet'
const LONG = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

export const TECHNOLOGY_DUMMY_CONTENT: TechnologyContent = {
  hero: {
    eyebrow: '[Dummy] Technology',
    headlineLine1: '[Dummy] Lorem',
    headlineLine2: 'ipsum dolor',
    headlineLine3: 'sit amet',
    lede: `[Dummy] ${LONG}`,
    primaryCtaLabel: 'Dummy primary',
    primaryCtaUrl: '/contact',
    secondaryCtaLabel: 'Dummy secondary'
  },
  capabilities: {
    eyebrow: '[Dummy] Eyebrow',
    title: '[Dummy] Capabilities',
    items: [
      { id: 'cap-dummy-a', title: '[Dummy] Capability A', body: LONG, keywords: ['Demo A', 'Demo B'], related: [{ label: 'Demo link', url: '/work' }], image: '/images/insights/enterprise-technology.webp', imageAlt: '', sortOrder: 1, active: true },
      { id: 'cap-dummy-b', title: '[Dummy] Capability B', body: LONG, keywords: ['Demo C'], related: [], image: '/images/insights/cybersecurity-compliance.webp', imageAlt: '', sortOrder: 2, active: true },
      { id: 'cap-dummy-c', title: '[Dummy] Capability C', body: `${L}.`, keywords: [], related: [{ label: 'Demo plain label', url: '' }], image: '/images/insights/ai-digital-transformation.webp', imageAlt: '', sortOrder: 3, active: false }
    ]
  },
  work: {
    sectionLabel: '[Dummy] Cases',
    eyebrow: '[Dummy] Eyebrow',
    title: '[Dummy] Case studies',
    items: [
      { id: 'tw-dummy-a', ref: 'work:01', sortOrder: 1, active: true },
      { id: 'tw-dummy-b', ref: 'case:textile', sortOrder: 2, active: true },
      { id: 'tw-dummy-c', ref: 'case:hdi', sortOrder: 3, active: false }
    ]
  },
  seo: {
    metaTitle: '[Dummy] Technology | PASTI',
    metaDescription: `[Dummy] ${L}.`,
    ogImage: '/images/og/technology.jpg',
    canonicalUrl: '',
    noIndex: true
  }
}

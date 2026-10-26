import type { AboutContent } from '#shared/utils/aboutSchema'

// DUMMY / DEV DATA — About CMS validation only (Step 2). NOT the public
// /about content (that still comes from useAbout/useCompany) and must never
// be migrated as-is. No real people, claims or numbers: every copy field is
// placeholder, the person is synthetic, the counters are labelled demo.

const L = 'Lorem ipsum dolor sit amet'
const LONG = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

export const ABOUT_DUMMY_CONTENT: AboutContent = {
  hero: {
    eyebrow: '[Dummy] About',
    headline: `[Dummy] ${L}`,
    supportingCopy: LONG,
    primaryCtaLabel: 'Dummy primary',
    primaryCtaUrl: '/contact',
    secondaryCtaLabel: 'Dummy secondary',
    secondaryCtaUrl: '#about-story',
    heroMedia: '/images/hero-knot.webp',
    heroMediaAlt: 'Dummy hero visual'
  },
  story: {
    sectionLabel: '[Dummy] Story',
    title: `[Dummy] ${L}`,
    paragraphs: [LONG, LONG, LONG],
    supportingMedia: '',
    supportingMediaAlt: ''
  },
  vision: { title: '[Dummy] Vision', description: LONG },
  mission: {
    title: '[Dummy] Mission',
    description: LONG,
    points: [
      { id: 'mp-dummy-1', text: `${L} — point one`, sortOrder: 1, active: true },
      { id: 'mp-dummy-2', text: `${L} — point two`, sortOrder: 2, active: true }
    ]
  },
  values: [
    { id: 'val-innovation', title: 'Innovation', description: LONG, iconOrVisual: 'spark', sortOrder: 1, active: true },
    { id: 'val-security', title: 'Security', description: LONG, iconOrVisual: 'shield', sortOrder: 2, active: true },
    { id: 'val-efficiency', title: 'Efficiency', description: LONG, iconOrVisual: 'gauge', sortOrder: 3, active: true },
    { id: 'val-integrity', title: 'Integrity', description: LONG, iconOrVisual: 'handshake', sortOrder: 4, active: true }
  ],
  milestones: [
    { id: 'ms-dummy-a', yearOrPeriod: 'Demo A', title: `[Dummy] ${L}`, description: LONG, optionalMedia: '', optionalMediaAlt: '', sortOrder: 1, active: true },
    { id: 'ms-dummy-b', yearOrPeriod: 'Demo B', title: `[Dummy] ${L}`, description: LONG, optionalMedia: '', optionalMediaAlt: '', sortOrder: 2, active: true },
    { id: 'ms-dummy-c', yearOrPeriod: 'Demo C', title: `[Dummy] ${L}`, description: LONG, optionalMedia: '', optionalMediaAlt: '', sortOrder: 3, active: true },
    { id: 'ms-dummy-d', yearOrPeriod: 'Demo D', title: `[Dummy] ${L}`, description: LONG, optionalMedia: '', optionalMediaAlt: '', sortOrder: 4, active: false }
  ],
  proof: [
    { id: 'pf-dummy-1', value: '00+', label: 'Demo counter one', supportingText: 'Dummy value — not a real claim.', sortOrder: 1, active: true },
    { id: 'pf-dummy-2', value: '00+', label: 'Demo counter two', supportingText: 'Dummy value — not a real claim.', sortOrder: 2, active: true },
    { id: 'pf-dummy-3', value: '0.0', label: 'Demo counter three', supportingText: 'Dummy value — not a real claim.', sortOrder: 3, active: true }
  ],
  leadership: [
    { id: 'ld-dummy-1', name: 'Dummy Person', role: 'Dummy Role', shortBio: LONG, portrait: '', portraitAlt: '', sortOrder: 1, active: true }
  ],
  cta: {
    eyebrow: '[Dummy] CTA',
    title: `[Dummy] ${L}`,
    supportingCopy: LONG,
    primaryCtaLabel: 'Dummy contact',
    primaryCtaUrl: '/contact',
    secondaryCtaLabel: '',
    secondaryCtaUrl: ''
  },
  seo: {
    metaTitle: '[Dummy] About | PASTI',
    metaDescription: 'Dummy meta description for CMS validation only. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    ogImage: '/images/og/about.jpg',
    canonicalUrl: 'https://www.pastipeople.id/about',
    noIndex: false
  }
}

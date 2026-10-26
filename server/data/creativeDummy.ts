import type { CreativeContent } from '#shared/utils/creativeSchema'

// DUMMY / DEV DATA — Creative CMS validation only. NOT the public /creative
// content (that still comes from useCreative) and must never be migrated
// as-is. Placeholder copy only; images are existing site assets used as
// stand-ins; refs point at existing records (no new data).

const L = 'Lorem ipsum dolor sit amet'
const LONG = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
const IMG = '/images/creative/creative-communication.webp'

export const CREATIVE_DUMMY_CONTENT: CreativeContent = {
  hero: {
    eyebrow: '[Dummy] Creative',
    markerMeta: 'Demo meta',
    headlineLine1: '[Dummy] Lorem',
    headlineLine2: 'ipsum dolor',
    lede: `[Dummy] ${LONG}`,
    primaryCtaLabel: 'Dummy primary',
    primaryCtaUrl: '/contact',
    secondaryCtaLabel: 'Dummy secondary'
  },
  services: {
    sectionLabel: '[Dummy] Services',
    eyebrow: '[Dummy] Eyebrow',
    title: '[Dummy] Services',
    items: [
      { id: 'svc-dummy-a', title: '[Dummy] Service A', body: LONG, keywords: ['Demo A', 'Demo B'], related: [{ label: 'Demo link', url: '/work' }], image: IMG, imageWidth: 1448, imageHeight: 1086, imageAlt: '', sortOrder: 1, active: true },
      { id: 'svc-dummy-b', title: '[Dummy] Service B', body: `${L}.`, keywords: [], related: [], image: '/images/creative/brand-identity-ui-ux.webp', imageWidth: 1678, imageHeight: 937, imageAlt: '', sortOrder: 2, active: true },
      { id: 'svc-dummy-c', title: '[Dummy] Service C', body: `${L}.`, keywords: [], related: [], image: IMG, imageWidth: 1448, imageHeight: 1086, imageAlt: '', sortOrder: 3, active: false }
    ]
  },
  wall: {
    sectionLabel: '[Dummy] Wall',
    titleLead: '[Dummy] Made in',
    titleAccent: 'demo',
    visuals: [
      { id: 'vis-dummy-a', image: '/images/selected-work/pertamina.webp', label: '[Dummy] Visual A', sortOrder: 1, active: true },
      { id: 'vis-dummy-b', image: '/images/selected-work/octo-mobile.webp', label: '[Dummy] Visual B', sortOrder: 2, active: true },
      { id: 'vis-dummy-c', image: '/images/selected-work/ikea-indonesia.webp', label: '[Dummy] Visual C', sortOrder: 3, active: true },
      { id: 'vis-dummy-d', image: '/images/selected-work/powerhours.webp', label: '[Dummy] Visual D', sortOrder: 4, active: false }
    ]
  },
  work: {
    sectionLabel: '[Dummy] Work',
    sectionMeta: 'Demo',
    eyebrow: '[Dummy] Eyebrow',
    title: '[Dummy] Selected work',
    feature: {
      title: '[Dummy] Feature case',
      category: '[Dummy] Category',
      imageRef: 'work:06',
      challenge: [`[Dummy] ${L}.`, `[Dummy] ${L}.`],
      gamePlan: `[Dummy] ${LONG}`,
      funnel: [
        { stage: 'Demo stage 1', text: `${L}.` },
        { stage: 'Demo stage 2', text: `${L}.` },
        { stage: 'Demo stage 3', text: `${L}.` },
        { stage: 'Demo stage 4', text: `${L}.` }
      ],
      playbook: [`[Dummy] ${L}.`]
    },
    campaignRef: 'work:01',
    testimonialRef: 't:calvin-kim',
    uiux: {
      title: '[Dummy] UI/UX',
      label: '[Dummy] Label',
      items: [
        { id: 'ux-dummy-a', ref: 'work:02', sortOrder: 1, active: true },
        { id: 'ux-dummy-b', ref: 'work:03', sortOrder: 2, active: false }
      ]
    }
  },
  why: { leadLabel: '[Dummy] Lead', statementSource: 'vision', standardRefs: ['security'], milestoneRefs: ['2021', '2023', 'since-2024'] },
  seo: {
    metaTitle: '[Dummy] Creative | PASTI',
    metaDescription: `[Dummy] ${L}.`,
    ogImage: '/images/og/creative.jpg',
    canonicalUrl: '',
    noIndex: true
  }
}

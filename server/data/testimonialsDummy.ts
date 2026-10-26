import type { TestimonialContent } from '#shared/utils/testimonialSchema'

// DUMMY / DEV DATA — Testimonials CMS validation only. Not the public
// testimonials (those still come from useTestimonials) and never migrated.
// Placeholder people and copy only; mixed approval states exercise the
// public-eligibility filter. Seeded as unpublished drafts.

const L = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

const base = (over: Partial<TestimonialContent>): TestimonialContent => ({
  quote: `[Dummy] ${L}`,
  personName: '[Dummy] Person',
  roleTitle: 'Lorem ipsum',
  companyDisplayName: '[Dummy] Company',
  clientId: '',
  photo: '',
  photoAlt: '',
  type: 'client',
  categoryIds: [],
  tags: [],
  active: true,
  sortOrder: 100,
  sourceNote: 'Dev seed — dummy record.',
  ...over
})

export const TESTIMONIALS_DUMMY: { id: string; content: TestimonialContent; meta: Record<string, string> }[] = [
  {
    id: 'tst-dummy-a',
    content: base({ personName: '[Dummy] Client A', companyDisplayName: '[Dummy] Client A Co', categoryIds: ['technology'], tags: ['demo'], sortOrder: 101 }),
    meta: { approval: 'confirmed' }
  },
  {
    id: 'tst-dummy-b',
    content: base({ personName: '[Dummy] Client B', companyDisplayName: '[Dummy] Client B Co', categoryIds: ['creative'], sortOrder: 102 }),
    meta: { approval: 'needs_approval' }
  },
  {
    id: 'tst-dummy-c',
    content: base({ personName: '[Dummy] Partner C', companyDisplayName: '[Dummy] Partner C Co', type: 'partner', sortOrder: 103 }),
    meta: { approval: 'hidden' }
  },
  {
    id: 'tst-dummy-d',
    content: base({ personName: '[Dummy] User D', companyDisplayName: '', type: 'user', active: false, sortOrder: 104 }),
    meta: { approval: 'confirmed' }
  }
]

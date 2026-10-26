import { TestimonialContentSchema, type TestimonialContent } from '#shared/utils/testimonialSchema'
import { zodFieldErrors } from './useSingletonEditor'

// Form state for the Testimonials collection editor (record editor logic:
// useSingletonEditor; create: useCollectionCreate). Publication approval is
// not part of the form — it has its own action (AdminTestimonialsApproval).

export type TestimonialForm = TestimonialContent

export const TESTIMONIAL_TABS = [
  { key: 'quote', label: 'Quote', sections: ['quote'] },
  { key: 'person', label: 'Person', sections: ['personName', 'roleTitle', 'companyDisplayName', 'clientId'] },
  { key: 'media', label: 'Media', sections: ['photo', 'photoAlt'] },
  { key: 'classification', label: 'Classification', sections: ['type', 'categoryIds', 'tags'] },
  { key: 'publication', label: 'Publication', sections: ['active', 'sortOrder', 'sourceNote'] }
] as const

export const TESTIMONIAL_TYPE_LABELS = { client: 'Client', partner: 'Partner', user: 'User', internal: 'Internal' } as const
export const TESTIMONIAL_CATEGORY_LABELS = { technology: 'Technology', creative: 'Creative' } as const

export function emptyTestimonial(): TestimonialForm {
  return {
    quote: '',
    personName: '',
    roleTitle: '',
    companyDisplayName: '',
    clientId: '',
    photo: '',
    photoAlt: '',
    type: 'client',
    categoryIds: [],
    tags: [],
    active: true,
    sortOrder: 100,
    sourceNote: ''
  }
}

export function toTestimonialForm(c: TestimonialContent): TestimonialForm {
  // JSON round-trip: `c` is often a reactive proxy (useAsyncData).
  return JSON.parse(JSON.stringify(c)) as TestimonialContent
}

export function toTestimonialPayload(f: TestimonialForm) {
  return JSON.parse(JSON.stringify(f)) as TestimonialContent
}

export function validateTestimonialForm(f: TestimonialForm): Record<string, string> {
  return zodFieldErrors(TestimonialContentSchema.safeParse(toTestimonialPayload(f)))
}

// Client picker: the existing shared client list (useClients), by logo slug.
export function testimonialClientOptions() {
  return useClients().clients.map((c) => ({ id: (c.logo ?? '').replace(/^\/logos\/clients\//, '').replace(/\.webp$/, ''), name: c.name })).filter((c) => c.id)
}

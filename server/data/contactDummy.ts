import type { ContactContent } from '#shared/utils/contactSchema'

// DUMMY / DEV DATA — Contact CMS validation only. NOT the public /contact
// content (that still comes from useContact + the Contact components) and
// must never be migrated as-is. Placeholder copy only; no contact facts —
// the number, email and address are shared data and never live here.

const L = 'Lorem ipsum dolor sit amet'

export const CONTACT_DUMMY_CONTENT: ContactContent = {
  hero: {
    eyebrow: '[Dummy] Contact Hero',
    headline: "[Dummy] Let's talk",
    supportingCopy: `[Dummy] ${L}, consectetur adipiscing elit.`
  },
  channels: {
    whatsapp: { label: '[Dummy] Chat', action: '[Dummy] Lorem ipsum' },
    email: { label: '[Dummy] Mail', action: '[Dummy] Lorem ipsum' },
    office: { label: '[Dummy] Office', action: '[Dummy] Lorem ipsum' }
  },
  form: {
    title: '[Dummy] Lorem ipsum',
    description: `[Dummy] ${L}.`,
    fields: {
      name: { label: '[Dummy] Name', placeholder: 'Lorem ipsum' },
      company: { label: '[Dummy] Company', placeholder: '' },
      email: { label: '[Dummy] Email', placeholder: 'lorem@ipsum.test' },
      phone: { label: '[Dummy] Phone', placeholder: '' },
      message: { label: '[Dummy] Message', placeholder: `${L}…` }
    },
    needsLegend: '[Dummy] Lorem ipsum?',
    needsHint: 'Dummy hint',
    submitLabel: '[Dummy] Send',
    successTitle: '[Dummy] Success title',
    successMessage: `[Dummy] ${L}.`,
    errorTitle: '[Dummy] Error title',
    errorMessage: `[Dummy] ${L}.`
  },
  seo: {
    metaTitle: '[Dummy] Contact | PASTI',
    metaDescription: `[Dummy] ${L}.`,
    ogImage: '/images/og/contact.jpg',
    canonicalUrl: '',
    noIndex: true
  }
}

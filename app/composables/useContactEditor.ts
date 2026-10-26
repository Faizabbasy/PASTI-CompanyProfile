import { ContactContentSchema, type ContactContent } from '#shared/utils/contactSchema'
import { zodFieldErrors } from './useSingletonEditor'

// Form state for /admin/pages/contact (editor logic: useSingletonEditor).
// No repeaters: every field is fixed by the current page design.

export type ContactForm = ContactContent

export const CONTACT_TABS = [
  { key: 'hero', label: 'Hero', sections: ['hero'] },
  { key: 'info', label: 'Contact Information', sections: ['channels'] },
  { key: 'form', label: 'Form Content', sections: ['form'] },
  { key: 'seo', label: 'SEO', sections: ['seo'] },
  { key: 'code', label: 'Code-managed', sections: [] }
] as const

export function toContactForm(c: ContactContent): ContactForm {
  // JSON round-trip: `c` is often a reactive proxy (useAsyncData).
  return JSON.parse(JSON.stringify(c)) as ContactContent
}

export function toContactPayload(f: ContactForm) {
  return JSON.parse(JSON.stringify(f)) as ContactContent
}

export function validateContactForm(f: ContactForm): Record<string, string> {
  return zodFieldErrors(ContactContentSchema.safeParse(toContactPayload(f)))
}

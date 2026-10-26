import { z } from 'zod'
import type { ContactFormFieldKey } from './contactSchema'

// Public Contact contract.
//
// 1. `PublicContactResponse` — what GET /api/public/pages/contact returns.
//    Always an explicit status: never a draft, never workflow metadata, never
//    shared company data or any form-delivery configuration.
// 2. `ContactPageContent` — the one normalized shape of the page-specific
//    copy the Contact components render, whichever source (legacy code or
//    CMS) produced it. Shared contact information is NOT in it: components
//    keep reading that from useContact() (one shared source).

const str = z.string()
const channel = z.object({ label: str.min(1), action: str.min(1) })
const field = z.object({ label: str.min(1), placeholder: str })

// A response that doesn't match falls back to legacy content (see
// useContactPage).
const ResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('disabled') }),
  z.object({ status: z.literal('unpublished') }),
  z.object({
    status: z.literal('published'),
    version: z.number().int(),
    publishedAt: str,
    content: z.object({
      hero: z.object({ eyebrow: str, headline: str.min(1), supportingCopy: str }),
      channels: z.object({ whatsapp: channel, email: channel, office: channel }),
      form: z.object({
        title: str.min(1),
        description: str,
        fields: z.object({ name: field, company: field, email: field, phone: field, message: field }),
        needsLegend: str.min(1),
        needsHint: str,
        submitLabel: str.min(1),
        successTitle: str.min(1),
        successMessage: str,
        errorTitle: str.min(1),
        errorMessage: str
      }),
      seo: z.object({ metaTitle: str, metaDescription: str, ogImage: str, canonicalUrl: str, noIndex: z.boolean() })
    })
  })
])
export const PublicContactResponseSchema = ResponseSchema
export type PublicContactResponse = z.infer<typeof PublicContactResponseSchema>
export type PublicContactPublished = Extract<PublicContactResponse, { status: 'published' }>

export interface ContactChannelCopy {
  label: string
  action: string
}

export interface ContactPageContent {
  source: 'legacy' | 'cms'
  cmsVersion: number | null
  hero: {
    // Marker meta next to the code-owned "Contact" label.
    eyebrow: string
    // Split into masked words by the hero; the yellow period is code-owned.
    headline: string
    body: string
  }
  // Wording around the shared channel values (number / email / address).
  channels: { whatsapp: ContactChannelCopy; email: ContactChannelCopy; office: ContactChannelCopy }
  form: {
    title: string
    description: string
    // Keyed by the code-owned field ids; empty placeholder = none rendered.
    fields: Record<ContactFormFieldKey, { label: string; placeholder: string }>
    needsLegend: string
    needsHint: string
    submitLabel: string
    success: { title: string; message: string }
    error: { title: string; message: string }
  }
  seo: { title: string; description: string; image: string; canonical?: string; noIndex?: boolean }
}

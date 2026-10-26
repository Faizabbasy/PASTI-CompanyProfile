import { z } from 'zod'
import { SeoSchema, text, type SingletonAdminState } from '#shared/cms/fields'

// Contact page CMS content model. Maps the CURRENT /contact page, which is a
// single hero section: headline + direct channels on the left, the brief
// form on the right. Only page-specific wording is modelled here:
//
// - Shared company contact data (WhatsApp number, email, office address,
//   maps link, legal entity, social links) is NOT part of this model. It
//   stays in its one shared source (useFooter / useWhatsapp / useFinalCta)
//   and is shown read-only in the editor.
// - Form behaviour is NOT part of this model: field ids/names, input types,
//   required state, validation rules and messages, the WhatsApp hand-off and
//   its message template, the "What do you need?" options (service and
//   platform names) and every state transition stay in code. The CMS supplies
//   wording only — labels, placeholders, titles, success / failure copy.
// - The page has no intro section, no hero media, no hero buttons and no
//   page-specific CTA (the footer CTA is global), so none are modelled.
//
// Plain text only — layout, typography, colour and motion belong to code.

// Design-safe limits from the copy stress test on the real Contact
// components at 390/820/1366/1920px (see the Contact CMS QA notes).
export const CONTACT_LIMITS = {
  heroEyebrow: 28,
  headline: 40,
  // One masked word of the display headline; longer words overflow the
  // phone column instead of wrapping.
  headlineWord: 13,
  supportingCopy: 150,
  channelLabel: 16,
  channelAction: 28,
  formTitle: 28,
  formDescription: 160,
  fieldLabel: 28,
  // Single-line inputs show ~30 characters at 390/820px before the
  // placeholder is cut off; the message textarea wraps.
  placeholder: 30,
  messagePlaceholder: 60,
  needsLegend: 28,
  needsHint: 16,
  // One line inside the fixed-height pill on phones.
  submitLabel: 20,
  stateTitle: 60,
  stateMessage: 200
} as const

// The form fields that exist today, by their code-owned identifiers. Adding
// a key here does NOT add a field: the form renders its own fixed list.
export const CONTACT_FORM_FIELDS = ['name', 'company', 'email', 'phone', 'message'] as const
export type ContactFormFieldKey = (typeof CONTACT_FORM_FIELDS)[number]

const noFinalPeriod = (v: string) => !/[.!?]$/.test(v)

const HeroSchema = z
  .object({
    // Shown after the "Contact" marker (tablet and up).
    eyebrow: text(CONTACT_LIMITS.heroEyebrow, { required: true }),
    // Every word is one masked word of the entrance animation; the yellow
    // period is added by the design.
    headline: text(CONTACT_LIMITS.headline, { required: true })
      .refine(noFinalPeriod, 'Leave out the final period — the design adds it.')
      .refine((v) => v.split(/\s+/).every((w) => w.length <= CONTACT_LIMITS.headlineWord), `Keep each word to ${CONTACT_LIMITS.headlineWord} characters or fewer — longer words overflow on phones.`),
    supportingCopy: text(CONTACT_LIMITS.supportingCopy, { required: true })
  })
  .strict()

const ChannelSchema = z
  .object({
    label: text(CONTACT_LIMITS.channelLabel, { required: true }),
    // Link text under the value ("Chat now"); the link itself is code-owned.
    action: text(CONTACT_LIMITS.channelAction, { required: true })
  })
  .strict()

const fieldCopy = (placeholderMax: number) =>
  z
    .object({
      label: text(CONTACT_LIMITS.fieldLabel, { required: true }),
      // Empty = no placeholder (today's design shows none).
      placeholder: text(placeholderMax)
    })
    .strict()
const FieldCopySchema = fieldCopy(CONTACT_LIMITS.placeholder)

export const ContactContentSchema = z
  .object({
    hero: HeroSchema,
    channels: z
      .object({
        whatsapp: ChannelSchema,
        email: ChannelSchema,
        office: ChannelSchema
      })
      .strict(),
    form: z
      .object({
        title: text(CONTACT_LIMITS.formTitle, { required: true }).refine(noFinalPeriod, 'Leave out the final period — the design adds it.'),
        description: text(CONTACT_LIMITS.formDescription, { required: true }),
        fields: z
          .object({
            name: FieldCopySchema,
            company: FieldCopySchema,
            email: FieldCopySchema,
            phone: FieldCopySchema,
            message: fieldCopy(CONTACT_LIMITS.messagePlaceholder)
          })
          .strict(),
        needsLegend: text(CONTACT_LIMITS.needsLegend, { required: true }),
        needsHint: text(CONTACT_LIMITS.needsHint),
        submitLabel: text(CONTACT_LIMITS.submitLabel, { required: true }),
        successTitle: text(CONTACT_LIMITS.stateTitle, { required: true }),
        successMessage: text(CONTACT_LIMITS.stateMessage, { required: true }),
        errorTitle: text(CONTACT_LIMITS.stateTitle, { required: true }),
        errorMessage: text(CONTACT_LIMITS.stateMessage, { required: true })
      })
      .strict(),
    seo: SeoSchema
  })
  .strict()

export type ContactContentInput = z.infer<typeof ContactContentSchema>
// No repeater lists, so stored content = validated input.
export type ContactContent = ContactContentInput
export type ContactSectionKey = keyof ContactContent
export type ContactAdminState = SingletonAdminState<'contact', ContactContent>

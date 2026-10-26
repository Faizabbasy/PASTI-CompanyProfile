import type { ContactContent } from './contactSchema'
import type { ContactPageContent } from './contactPublic'

// Legacy Contact → CMS content. Pure and deterministic (no ids, no lists):
// the same legacy input always yields the same CMS content.
//
// Source of truth is the CURRENT public /contact as rendered today — the
// normalized legacy shape from buildLegacyContactContent() (useContact hero
// copy + the Hero/Form template wording + pageSeo.contact). Only
// page-specific wording is migrated; shared company contact data (number,
// email, address, entity, socials) stays in its shared source and is never
// copied into the CMS.

export const CONTACT_MIGRATION_VERSION = 'contact-v1'

export function legacyToContactContent(legacy: ContactPageContent, seo: { canonicalUrl: string }): ContactContent {
  const { hero, channels, form } = legacy
  const fields = Object.fromEntries(
    Object.entries(form.fields).map(([k, f]) => [k, { label: f.label, placeholder: f.placeholder }])
  ) as ContactContent['form']['fields']
  return {
    hero: { eyebrow: hero.eyebrow, headline: hero.headline, supportingCopy: hero.body },
    channels: {
      whatsapp: { ...channels.whatsapp },
      email: { ...channels.email },
      office: { ...channels.office }
    },
    form: {
      title: form.title,
      description: form.description,
      fields,
      needsLegend: form.needsLegend,
      needsHint: form.needsHint,
      submitLabel: form.submitLabel,
      successTitle: form.success.title,
      successMessage: form.success.message,
      errorTitle: form.error.title,
      errorMessage: form.error.message
    },
    seo: {
      metaTitle: legacy.seo.title,
      metaDescription: legacy.seo.description,
      ogImage: legacy.seo.image,
      canonicalUrl: seo.canonicalUrl,
      noIndex: false
    }
  }
}

// Strings that only ever appear in the dev seed — used to prove a record is
// free of dummy content.
export const CONTACT_DUMMY_MARKERS = ['[Dummy]', 'Lorem ipsum', 'Dummy']

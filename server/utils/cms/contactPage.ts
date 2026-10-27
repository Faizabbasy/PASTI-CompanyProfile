import { ContactContentSchema, type ContactContent, type ContactContentInput } from '#shared/utils/contactSchema'
import { CONTACT_DUMMY_CONTENT } from '../../data/contactDummy'
import { defineSingletonPage, type SingletonRecord } from './singletonPage'

// Contact = singleton page on the shared singleton engine (same draft /
// published / revision model, storage and audit as About and Technology).
// Holds page wording only — shared company contact data and every piece of
// form behaviour stay in code, so nothing here can reach form delivery.

export type ContactRecord = SingletonRecord<'contact', ContactContent>

const contact = defineSingletonPage<'contact', ContactContent, ContactContentInput>({
  id: 'contact',
  schema: ContactContentSchema,
  dummyContent: CONTACT_DUMMY_CONTENT,
  lists: [],
  actions: { update: 'contact.update', publish: 'contact.publish', unpublish: 'contact.unpublish', archive: 'contact.archive' }
})

// Used by scripts/cms-migrate-contact.mjs.
export const buildMigratedContactRecord = contact.buildMigratedRecord
export const CONTACT_RECORD_KEY = contact.RECORD_KEY
export const CONTACT_REVISION_PREFIX = contact.REVISION_PREFIX

export const getContactState = contact.getState
export const getContactDraftContent = contact.getDraftContent
export const saveContactDraft = contact.saveDraft
export const publishContact = contact.publish
export const setContactStatus = contact.setStatus

// Public read path: published snapshot only. The content is copied field by
// field so nothing outside the public contract can ever leak through.
export async function getPublishedContact(lang: CmsLang = 'en') {
  const snap = await contact.forLocale(lang).getPublishedSnapshot()
  if (!snap) return null
  const { hero, channels, form, seo } = snap.content
  return {
    dummy: snap.dummy,
    version: snap.version,
    publishedAt: snap.publishedAt,
    content: {
      hero: { eyebrow: hero.eyebrow, headline: hero.headline, supportingCopy: hero.supportingCopy },
      channels: {
        whatsapp: { label: channels.whatsapp.label, action: channels.whatsapp.action },
        email: { label: channels.email.label, action: channels.email.action },
        office: { label: channels.office.label, action: channels.office.action }
      },
      form: {
        title: form.title,
        description: form.description,
        fields: {
          name: { label: form.fields.name.label, placeholder: form.fields.name.placeholder },
          company: { label: form.fields.company.label, placeholder: form.fields.company.placeholder },
          email: { label: form.fields.email.label, placeholder: form.fields.email.placeholder },
          phone: { label: form.fields.phone.label, placeholder: form.fields.phone.placeholder },
          message: { label: form.fields.message.label, placeholder: form.fields.message.placeholder }
        },
        needsLegend: form.needsLegend,
        needsHint: form.needsHint,
        submitLabel: form.submitLabel,
        successTitle: form.successTitle,
        successMessage: form.successMessage,
        errorTitle: form.errorTitle,
        errorMessage: form.errorMessage
      },
      seo: { metaTitle: seo.metaTitle, metaDescription: seo.metaDescription, ogImage: seo.ogImage, canonicalUrl: seo.canonicalUrl, noIndex: seo.noIndex }
    }
  }
}

// Bilingual CMS: the record for one language (English = the original record).
export const contactFor = (lang: CmsLang) => contact.forLocale(lang)

import type { InjectionKey } from 'vue'
import { CONTACT_PAGE_ID } from '~/i18n/content/contact'
import { PublicContactResponseSchema, type ContactPageContent, type PublicContactPublished } from '#shared/utils/contactPublic'

// Public /contact wording source. The page resolves it ONCE and the Contact
// components read the same normalized shape via useContactPage() — no
// component knows whether it came from code or from the CMS.
//
//   legacy:  useContact hero copy + the wording below + pageSeo.contact
//            → buildLegacyContactContent
//   cms:     GET /api/public/pages/contact → adaptContactCms(legacy, …)
//
// Only page-specific wording goes through here. Shared company contact data
// (WhatsApp number/link, email, address, maps link, entity, socials) and the
// "What do you need?" options keep coming from useContact() — one shared
// source, never copied into the CMS. Form behaviour (field ids, types,
// required state, validation, WhatsApp hand-off) lives in ContactForm.
//
// The CMS source is used only when the SERVER says so (runtime config flag,
// see server/api/public/pages/contact.get.ts). Any failure, a disabled flag,
// no published snapshot or an unexpected response → legacy wording.

const STATE_KEY = 'contact-page-content'
const PREVIEW_KEY: InjectionKey<ContactPageContent> = Symbol('contact-preview')

export function buildLegacyContactContent(): ContactPageContent {
  const { hero } = useContact()
  const built: ContactPageContent = {
    source: 'legacy',
    cmsVersion: null,
    hero: { eyebrow: hero.eyebrow, headline: hero.heading.replace(/\.$/, ''), body: hero.body },
    channels: {
      whatsapp: { label: 'WhatsApp', action: 'Chat now' },
      email: { label: 'Email', action: 'Write to us' },
      office: { label: 'Office', action: 'Open in Google Maps' }
    },
    form: {
      title: 'Tell us about it',
      description: 'Fields marked * are required. Your brief opens in WhatsApp, ready to send.',
      fields: {
        name: { label: 'Name', placeholder: '' },
        company: { label: 'Company', placeholder: '' },
        email: { label: 'Work email', placeholder: '' },
        phone: { label: 'Phone / WhatsApp', placeholder: '' },
        message: { label: 'Message', placeholder: '' }
      },
      needsLegend: 'What do you need?',
      needsHint: 'Pick any',
      submitLabel: 'Send via WhatsApp',
      success: { title: 'Your brief is ready in WhatsApp.', message: 'Press send in WhatsApp to reach the PASTI team.' },
      error: { title: 'WhatsApp didn’t open.', message: 'Your browser may have blocked the new window. Use the button below to open it.' }
    },
    seo: { ...localizedPageSeo('contact') }
  }
  // Indonesian wording on Indonesian pages (app/i18n/content/contact.ts);
  // English (and migration scripts) get the code copy unchanged.
  return localize(built, useLocale() === 'id' ? CONTACT_PAGE_ID : undefined)
}

// Maps the published CMS wording onto the normalized shape.
export function adaptContactCms(legacy: ContactPageContent, cms: Pick<PublicContactPublished, 'version' | 'content'>): ContactPageContent {
  const c = cms.content
  const field = (k: keyof ContactPageContent['form']['fields']) => ({ label: c.form.fields[k].label, placeholder: c.form.fields[k].placeholder })
  return {
    source: 'cms',
    cmsVersion: cms.version,
    hero: { eyebrow: c.hero.eyebrow, headline: c.hero.headline.replace(/\.$/, ''), body: c.hero.supportingCopy },
    channels: {
      whatsapp: { ...c.channels.whatsapp },
      email: { ...c.channels.email },
      office: { ...c.channels.office }
    },
    form: {
      title: c.form.title,
      description: c.form.description,
      fields: { name: field('name'), company: field('company'), email: field('email'), phone: field('phone'), message: field('message') },
      needsLegend: c.form.needsLegend,
      needsHint: c.form.needsHint,
      submitLabel: c.form.submitLabel,
      success: { title: c.form.successTitle, message: c.form.successMessage },
      error: { title: c.form.errorTitle, message: c.form.errorMessage }
    },
    seo: {
      title: c.seo.metaTitle,
      description: c.seo.metaDescription,
      image: c.seo.ogImage || legacy.seo.image,
      ...(c.seo.canonicalUrl ? { canonical: c.seo.canonicalUrl } : {}),
      ...(c.seo.noIndex ? { noIndex: true } : {})
    }
  }
}

// Called once by pages/contact.vue.
export async function resolveContactPageContent() {
  const nuxtApp = useNuxtApp()
  const legacy = buildLegacyContactContent()
  const locale = useLocale()
  const state = useState<ContactPageContent>(`${STATE_KEY}-${locale}`, () => legacy)

  const { data } = await useAsyncData(`contact-cms-source-${locale}`, async () => {
    // SSR: skip the call entirely when the server-side flag is off.
    if (import.meta.server && !contactCmsEnabledOnServer()) return { status: 'disabled' as const }
    try {
      // Published record of this page's language; none → that language's code copy.
      const raw = await $fetch('/api/public/pages/contact', { query: { lang: locale }, timeout: 2500 })
      const parsed = PublicContactResponseSchema.safeParse(raw)
      if (!parsed.success) {
        if (import.meta.server) console.error('[contact] CMS response failed validation — using legacy content')
        return { status: 'invalid' as const }
      }
      return parsed.data
    } catch (err) {
      if (import.meta.server) console.error('[contact] CMS source unavailable — using legacy content:', (err as Error).message)
      return { status: 'error' as const }
    }
  })

  // The adapter can call composables (testimonials, perspectives, locale);
  // after the await above the Nuxt context is gone, so restore it.
  const published = data.value?.status === 'published' ? data.value : null
  state.value = published ? await nuxtApp.runWithContext(() => adaptContactCms(legacy, published)) : legacy
  return state
}

function contactCmsEnabledOnServer(): boolean {
  // Private runtime config — only readable during SSR, never in the bundle.
  const cms = useRuntimeConfig().cms as { contactPublicEnabled?: unknown } | undefined
  return String(cms?.contactPublicEnabled) === 'true'
}

// Admin draft preview: renders the real Contact components with draft
// wording provided to that subtree only (never written to public state).
export function provideContactPreview(content: ContactPageContent) {
  provide(PREVIEW_KEY, content)
}

// Every Contact component reads its wording through this.
export function useContactPage(): ContactPageContent {
  const preview = inject(PREVIEW_KEY, null)
  if (preview) return preview
  const state = useState<ContactPageContent | undefined>(`${STATE_KEY}-${useLocale()}`)
  return state.value ?? buildLegacyContactContent()
}

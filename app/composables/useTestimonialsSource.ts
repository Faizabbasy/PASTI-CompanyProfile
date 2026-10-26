import { PublicTestimonialsResponseSchema, testimonialRoleLine } from '#shared/utils/testimonialPublic'
import type { Testimonial } from './useTestimonials'

// Testimonial content source for the public pages (Home ring, Creative card).
// Legacy useTestimonials() by default; the Shared Testimonials CMS only when
// NUXT_CMS_TESTIMONIALS_PUBLIC_ENABLED is on AND the API returns at least one
// public-eligible record (published + active + approval confirmed). Any
// failure, invalid response or empty list falls back to legacy, so a page
// never loses its testimonials.
//
// CMS records come back in collection sortOrder; they are mapped onto the
// legacy Testimonial shape so the components stay unchanged. The id `tst-<slug>`
// keeps the `t:<slug>` refs Creative stores (see resolveCreativeTestimonialRef).

export interface SourcedTestimonial extends Testimonial {
  id: string
}

const STATE_KEY = 'cms-testimonials'

function legacyList(): SourcedTestimonial[] {
  return useTestimonials()
    .testimonials.filter((t) => t.status !== 'placeholder')
    .map((t) => ({ ...t, id: `tst-${slug(t.name)}` }))
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function testimonialsCmsEnabledOnServer(): boolean {
  // Private runtime config — only readable during SSR, never in the bundle.
  const cms = useRuntimeConfig().cms as { testimonialsPublicEnabled?: unknown } | undefined
  return String(cms?.testimonialsPublicEnabled) === 'true'
}

// Called once by each page that shows testimonials (before its sections render).
export async function resolveTestimonials() {
  const state = useState<SourcedTestimonial[] | null>(STATE_KEY, () => null)
  if (state.value) return state

  const { data } = await useAsyncData('testimonials-cms-source', async () => {
    if (import.meta.server && !testimonialsCmsEnabledOnServer()) return null
    try {
      const parsed = PublicTestimonialsResponseSchema.safeParse(await $fetch('/api/public/testimonials', { timeout: 2500 }))
      if (!parsed.success) {
        if (import.meta.server) console.error('[testimonials] CMS response failed validation — using legacy content')
        return null
      }
      return parsed.data.status === 'ok' ? parsed.data.items : null
    } catch (err) {
      if (import.meta.server) console.error('[testimonials] CMS source unavailable — using legacy content:', (err as Error).message)
      return null
    }
  })

  const items = data.value
  state.value = items?.length
    ? items.map((t, i) => ({
        id: t.id,
        tier: i === 0 ? 'featured' : 'medium',
        status: 'verified',
        name: t.personName,
        role: testimonialRoleLine(t),
        quote: t.quote,
        ...(t.photo ? { photo: t.photo } : {})
      }))
    : legacyList()
  return state
}

// Sections read the resolved list through this (legacy if nothing resolved).
export function useTestimonialsSource(): SourcedTestimonial[] {
  return useState<SourcedTestimonial[] | null>(STATE_KEY).value ?? legacyList()
}

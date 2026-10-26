import { PUBLIC_TESTIMONIAL_MAX_IDS } from '#shared/utils/testimonialPublic'

// Public Testimonials (read-only). Always an explicit status:
//   { status: 'disabled' }    — NUXT_CMS_TESTIMONIALS_PUBLIC_ENABLED is off
//   { status: 'ok', items }   — public-eligible testimonials only
// Eligible = published + active + approval confirmed for the published
// wording (enforced in server/utils/cms/testimonials.ts). Never drafts,
// approval/workflow metadata, actors, revisions or source notes. Dev seed
// records are excluded outside `nuxt dev`.
//
// Optional ?ids=a,b,c (max 20, collection id format) returns those records
// in that order, eligible ones only. No other query is supported.
const ID = /^[a-z0-9][a-z0-9_-]{0,63}$/

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')

  const raw = getQuery(event).ids
  let ids: string[] | null = null
  if (raw !== undefined) {
    if (typeof raw !== 'string') throw createError({ statusCode: 400, statusMessage: 'Invalid ids' })
    ids = raw.split(',').map((s) => s.trim()).filter(Boolean)
    if (!ids.length || ids.length > PUBLIC_TESTIMONIAL_MAX_IDS || !ids.every((id) => ID.test(id))) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid ids' })
    }
    ids = [...new Set(ids)]
  }

  if (!cmsPublicFlags(event).testimonialsPublicEnabled) return { status: 'disabled' as const }

  try {
    return { status: 'ok' as const, items: await getPublicTestimonials(ids, { allowDummy: import.meta.dev }) }
  } catch (err) {
    console.error('[cms] public Testimonials read failed:', (err as Error).message)
    throw createError({ statusCode: 503, statusMessage: 'Unavailable' })
  }
})

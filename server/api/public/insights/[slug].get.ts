import { SLUG_PATTERN } from '#shared/cms/fields'

// One public article page (/insights/:slug). Always an explicit status:
//   { status: 'disabled' }  — NUXT_CMS_INSIGHTS_PUBLIC_ENABLED is off, or the
//                             content is dev seed data outside nuxt dev
//   { status: 'not-found' } — no such published article in the published
//                             issue, or it has no written body yet
//   { status: 'published', version, content }
// Published snapshots only; no workflow metadata. The slug only selects.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')

  if (!cmsPublicFlags(event).insightsPublicEnabled) return { status: 'disabled' as const }

  const slug = getRouterParam(event, 'slug') ?? ''
  if (!SLUG_PATTERN.test(slug) || slug.length > 60) return { status: 'not-found' as const }

  let article: Awaited<ReturnType<typeof getPublishedArticle>>
  try {
    article = await getPublishedArticle(cmsLang(event), slug)
  } catch (err) {
    console.error('[cms] public article read failed:', (err as Error).message)
    throw createError({ statusCode: 503, statusMessage: 'Unavailable' })
  }
  if (!article) return { status: 'not-found' as const }
  if (article.dummy && !import.meta.dev) return { status: 'disabled' as const }

  return { status: 'published' as const, version: article.version, content: article.content }
})

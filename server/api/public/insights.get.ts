// Public Insights content. Always an explicit status:
//   { status: 'disabled' }    — NUXT_CMS_INSIGHTS_PUBLIC_ENABLED is off, or the
//                               content is dev seed data outside nuxt dev
//   { status: 'unpublished' } — the Insights landing is not live
//   { status: 'published', version, publishedAt, content }
// Published snapshots only; active categories only; summary fields only (no
// body, author or date while there is no detail page); no workflow metadata.
// Nothing here is controllable by the request: the flag is server config.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')

  if (!cmsPublicFlags(event).insightsPublicEnabled) return { status: 'disabled' as const }

  let insights: Awaited<ReturnType<typeof getPublishedInsights>>
  try {
    insights = await getPublishedInsights()
  } catch (err) {
    console.error('[cms] public Insights read failed:', (err as Error).message)
    throw createError({ statusCode: 503, statusMessage: 'Unavailable' })
  }
  if (!insights) return { status: 'unpublished' as const }
  if (insights.dummy && !import.meta.dev) return { status: 'disabled' as const }

  const { dummy: _dummy, ...published } = insights
  return { status: 'published' as const, ...published }
})

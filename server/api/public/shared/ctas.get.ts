// Public Global CTAs content (shared across pages). Always an explicit status:
//   { status: 'disabled' }    — NUXT_CMS_CTAS_PUBLIC_ENABLED is off, or
//                               the record is dev seed data outside `nuxt dev`
//   { status: 'unpublished' } — nothing is live
//   { status: 'published', version, publishedAt, content }
// Published snapshot only (inactive items removed), never the draft. The
// flag comes from server runtime config, never from the request.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')

  if (!cmsPublicFlags(event).ctasPublicEnabled) return { status: 'disabled' as const }

  let page: Awaited<ReturnType<typeof getPublishedShared>>
  try {
    page = await getPublishedShared('ctas')
  } catch (err) {
    console.error('[cms] public Global CTAs read failed:', (err as Error).message)
    throw createError({ statusCode: 503, statusMessage: 'Unavailable' })
  }
  if (!page) return { status: 'unpublished' as const }
  if (page.dummy && !import.meta.dev) return { status: 'disabled' as const }

  const { dummy: _dummy, ...published } = page
  return { status: 'published' as const, ...published }
})

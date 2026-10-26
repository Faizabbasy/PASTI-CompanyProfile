// Public DORA product page content. Always an explicit status:
//   { status: 'disabled' }    — NUXT_CMS_DORA_PUBLIC_ENABLED is off, or
//                               the record is dev seed data outside `nuxt dev`
//   { status: 'unpublished' } — nothing is live
//   { status: 'published', version, publishedAt, content }
// Page wording from the published snapshot only, no workflow metadata, no
// shared company data and no form-delivery configuration (the form has
// none server-side). Never falls back to the draft. Nothing here is
// controllable by the request: the flag comes from server runtime config.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')

  if (!cmsPublicFlags(event).doraPublicEnabled) return { status: 'disabled' as const }

  let page: Awaited<ReturnType<typeof getPublishedDora>>
  try {
    page = await getPublishedDora()
  } catch (err) {
    console.error('[cms] public DORA read failed:', (err as Error).message)
    throw createError({ statusCode: 503, statusMessage: 'Unavailable' })
  }
  if (!page) return { status: 'unpublished' as const }
  if (page.dummy && !import.meta.dev) return { status: 'disabled' as const }

  const { dummy: _dummy, ...published } = page
  return { status: 'published' as const, ...published }
})

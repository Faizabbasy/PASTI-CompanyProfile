// Public Creative content. Always an explicit status:
//   { status: 'disabled' }    — NUXT_CMS_CREATIVE_PUBLIC_ENABLED is off, or
//                               the record is dev seed data outside `nuxt dev`
//   { status: 'unpublished' } — nothing is live
//   { status: 'published', version, publishedAt, content }
// Only the published snapshot, active items only, no workflow metadata.
// Never falls back to the draft. Nothing here is controllable by the
// request: the flag comes from server runtime config.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')

  if (!cmsPublicFlags(event).creativePublicEnabled) return { status: 'disabled' as const }

  let creative: Awaited<ReturnType<typeof getPublishedCreative>>
  try {
    creative = await getPublishedCreative(cmsLang(event))
  } catch (err) {
    console.error('[cms] public Creative read failed:', (err as Error).message)
    throw createError({ statusCode: 503, statusMessage: 'Unavailable' })
  }
  if (!creative) return { status: 'unpublished' as const }
  if (creative.dummy && !import.meta.dev) return { status: 'disabled' as const }

  const { dummy: _dummy, ...published } = creative
  return { status: 'published' as const, ...published }
})

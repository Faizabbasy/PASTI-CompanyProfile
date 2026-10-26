// Public Technology content. Always an explicit status:
//   { status: 'disabled' }    — NUXT_CMS_TECHNOLOGY_PUBLIC_ENABLED is off, or
//                               the record is dev seed data outside `nuxt dev`
//   { status: 'unpublished' } — nothing is live
//   { status: 'published', version, publishedAt, content }
// Only the published snapshot, active items only, no workflow metadata.
// Never falls back to the draft. Nothing here is controllable by the
// request: the flag comes from server runtime config.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')

  if (!cmsPublicFlags(event).technologyPublicEnabled) return { status: 'disabled' as const }

  let technology: Awaited<ReturnType<typeof getPublishedTechnology>>
  try {
    technology = await getPublishedTechnology()
  } catch (err) {
    console.error('[cms] public Technology read failed:', (err as Error).message)
    throw createError({ statusCode: 503, statusMessage: 'Unavailable' })
  }
  if (!technology) return { status: 'unpublished' as const }
  if (technology.dummy && !import.meta.dev) return { status: 'disabled' as const }

  const { dummy: _dummy, ...published } = technology
  return { status: 'published' as const, ...published }
})

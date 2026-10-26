// Public About content (Step 3). Always an explicit status:
//   { status: 'disabled' }    — NUXT_CMS_ABOUT_PUBLIC_ENABLED is off, or the
//                               record is dev seed data outside `nuxt dev`
//   { status: 'unpublished' } — nothing is live
//   { status: 'published', version, publishedAt, content }
// Only the published snapshot, active items only, no workflow metadata.
// Never falls back to the draft. Nothing here is controllable by the
// request: the flags come from server runtime config.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')

  const flags = cmsPublicFlags(event)
  if (!flags.aboutPublicEnabled) return { status: 'disabled' as const }

  let about: Awaited<ReturnType<typeof getPublishedAbout>>
  try {
    about = await getPublishedAbout({ includeProof: flags.aboutPublicProofEnabled })
  } catch (err) {
    console.error('[cms] public About read failed:', (err as Error).message)
    throw createError({ statusCode: 503, statusMessage: 'Unavailable' })
  }
  if (!about) return { status: 'unpublished' as const }
  if (about.dummy && !import.meta.dev) return { status: 'disabled' as const }

  const { dummy: _dummy, ...published } = about
  return { status: 'published' as const, ...published }
})

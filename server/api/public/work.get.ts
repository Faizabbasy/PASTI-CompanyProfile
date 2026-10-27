// Public Work content. Always an explicit status:
//   { status: 'disabled' }    — NUXT_CMS_WORK_PUBLIC_ENABLED is off, or the
//                               content is dev seed data outside nuxt dev
//   { status: 'unpublished' } — the Work page is not live
//   { status: 'published', version, publishedAt, content }
// Published snapshots only (page, projects, case studies); confirmed claims
// and media only; no drafts, source notes or workflow metadata. Nothing here
// is controllable by the request: the flag comes from server runtime config.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')

  if (!cmsPublicFlags(event).workPublicEnabled) return { status: 'disabled' as const }

  let work: Awaited<ReturnType<typeof getPublishedWork>>
  try {
    work = await getPublishedWork(cmsLang(event))
  } catch (err) {
    console.error('[cms] public Work read failed:', (err as Error).message)
    throw createError({ statusCode: 503, statusMessage: 'Unavailable' })
  }
  if (!work) return { status: 'unpublished' as const }
  if (work.dummy && !import.meta.dev) return { status: 'disabled' as const }

  const { dummy: _dummy, ...published } = work
  return { status: 'published' as const, ...published }
})

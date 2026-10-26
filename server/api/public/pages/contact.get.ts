// Public Contact content. Always an explicit status:
//   { status: 'disabled' }    — NUXT_CMS_CONTACT_PUBLIC_ENABLED is off, or
//                               the record is dev seed data outside `nuxt dev`
//   { status: 'unpublished' } — nothing is live
//   { status: 'published', version, publishedAt, content }
// Page wording from the published snapshot only, no workflow metadata, no
// shared company data and no form-delivery configuration (the form has
// none server-side). Never falls back to the draft. Nothing here is
// controllable by the request: the flag comes from server runtime config.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')

  if (!cmsPublicFlags(event).contactPublicEnabled) return { status: 'disabled' as const }

  let contact: Awaited<ReturnType<typeof getPublishedContact>>
  try {
    contact = await getPublishedContact()
  } catch (err) {
    console.error('[cms] public Contact read failed:', (err as Error).message)
    throw createError({ statusCode: 503, statusMessage: 'Unavailable' })
  }
  if (!contact) return { status: 'unpublished' as const }
  if (contact.dummy && !import.meta.dev) return { status: 'disabled' as const }

  const { dummy: _dummy, ...published } = contact
  return { status: 'published' as const, ...published }
})

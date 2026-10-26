// ADMIN only. Stops being public-eligible. Allowed even when a page
// references it: the page keeps its reference, nothing is substituted, and
// the admin UI shows the reference as unavailable.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return testimonialAdminResponse(await testimonialsCollection.setStatus(event, user, getRouterParam(event, 'id') ?? '', 'archived'))
})

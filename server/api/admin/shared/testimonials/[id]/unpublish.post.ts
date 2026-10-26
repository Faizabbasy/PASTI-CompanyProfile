// ADMIN only. published|archived → draft; stops being public-eligible.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return testimonialAdminResponse(await testimonialsCollection.setStatus(event, user, getRouterParam(event, 'id') ?? '', 'draft'))
})

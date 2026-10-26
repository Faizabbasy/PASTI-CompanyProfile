export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  await ensureTestimonialsSeeded()
  return testimonialAdminResponse(await testimonialsCollection.read(getRouterParam(event, 'id') ?? ''))
})

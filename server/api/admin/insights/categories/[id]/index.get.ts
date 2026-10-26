export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  return categoryAdminResponse(await categoriesCollection.read(getRouterParam(event, 'id') ?? ''))
})

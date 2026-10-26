export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  return articleAdminResponse(await articlesCollection.read(getRouterParam(event, 'id') ?? ''))
})

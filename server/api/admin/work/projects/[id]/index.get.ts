export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  return projectAdminResponse(await projectsCollection.read(getRouterParam(event, 'id') ?? ''))
})

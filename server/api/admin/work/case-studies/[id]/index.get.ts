export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  return caseAdminResponse(await casesCollection.read(getRouterParam(event, 'id') ?? ''))
})

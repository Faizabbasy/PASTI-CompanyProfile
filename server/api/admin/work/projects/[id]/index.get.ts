export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  return projectAdminResponse(await projectsCollection.forLocale(cmsLang(event)).read(getRouterParam(event, 'id') ?? ''), cmsLang(event))
})

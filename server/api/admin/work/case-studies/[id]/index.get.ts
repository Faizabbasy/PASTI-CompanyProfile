export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  return caseAdminResponse(await casesCollection.forLocale(cmsLang(event)).read(getRouterParam(event, 'id') ?? ''), cmsLang(event))
})

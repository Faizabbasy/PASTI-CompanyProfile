export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  return categoryAdminResponse(await categoriesCollection.forLocale(cmsLang(event)).read(getRouterParam(event, 'id') ?? ''), cmsLang(event))
})

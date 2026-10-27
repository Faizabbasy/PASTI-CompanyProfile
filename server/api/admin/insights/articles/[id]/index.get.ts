export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  return articleAdminResponse(await articlesCollection.forLocale(cmsLang(event)).read(getRouterParam(event, 'id') ?? ''), cmsLang(event))
})

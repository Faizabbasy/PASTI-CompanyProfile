// ADMIN only. published|archived → draft (hidden from the public).
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return articleAdminResponse(await articlesCollection.forLocale(cmsLang(event)).setStatus(event, user, getRouterParam(event, 'id') ?? '', 'draft'), cmsLang(event))
})

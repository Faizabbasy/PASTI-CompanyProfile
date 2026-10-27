// ADMIN only. published|archived → draft (hidden from the public).
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return categoryAdminResponse(await categoriesCollection.forLocale(cmsLang(event)).setStatus(event, user, getRouterParam(event, 'id') ?? '', 'draft'), cmsLang(event))
})

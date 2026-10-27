// ADMIN only. Blocked while the record is still in use.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return articleAdminResponse(await articlesCollection.forLocale(cmsLang(event)).setStatus(event, user, getRouterParam(event, 'id') ?? '', 'archived'), cmsLang(event))
})

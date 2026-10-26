// ADMIN only. Blocked while the record is still in use.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return categoryAdminResponse(await categoriesCollection.setStatus(event, user, getRouterParam(event, 'id') ?? '', 'archived'))
})

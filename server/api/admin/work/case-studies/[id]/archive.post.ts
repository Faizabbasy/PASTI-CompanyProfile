// ADMIN only. Blocked while the Work page still uses the record.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return caseAdminResponse(await casesCollection.setStatus(event, user, getRouterParam(event, 'id') ?? '', 'archived'))
})

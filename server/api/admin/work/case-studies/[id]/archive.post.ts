// ADMIN only. Blocked while the Work page still uses the record.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return caseAdminResponse(await casesCollection.forLocale(cmsLang(event)).setStatus(event, user, getRouterParam(event, 'id') ?? '', 'archived'), cmsLang(event))
})

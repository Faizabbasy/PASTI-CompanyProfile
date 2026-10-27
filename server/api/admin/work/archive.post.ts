// ADMIN only. draft|published → archived; /work falls back to its code content.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return workPage.forLocale(cmsLang(event)).setStatus(event, user, 'archived')
})

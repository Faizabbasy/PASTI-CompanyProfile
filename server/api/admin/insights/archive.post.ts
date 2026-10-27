// ADMIN only. draft|published → archived; /insights falls back to its code content.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return insightsPage.forLocale(cmsLang(event)).setStatus(event, user, 'archived')
})

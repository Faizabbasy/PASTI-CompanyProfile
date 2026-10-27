// ADMIN only. draft|published → archived; the public stops receiving ECORPORATE.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return ecorporateFor(cmsLang(event)).setStatus(event, user, 'archived')
})

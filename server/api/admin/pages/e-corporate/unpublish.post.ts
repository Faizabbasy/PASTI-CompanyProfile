// ADMIN only. published|archived → draft; the public stops receiving ECORPORATE.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return ecorporateFor(cmsLang(event)).setStatus(event, user, 'draft')
})

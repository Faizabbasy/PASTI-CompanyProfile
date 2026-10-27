// ADMIN only. published|archived → draft; the public stops receiving OPEN.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return openFor(cmsLang(event)).setStatus(event, user, 'draft')
})

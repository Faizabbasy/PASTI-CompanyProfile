// ADMIN only. published|archived → draft; the public stops receiving About.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return aboutFor(cmsLang(event)).setStatus(event, user, 'draft')
})

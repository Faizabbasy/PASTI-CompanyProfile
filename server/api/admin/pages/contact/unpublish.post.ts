// ADMIN only. published|archived → draft; the public stops receiving Contact.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return contactFor(cmsLang(event)).setStatus(event, user, 'draft')
})

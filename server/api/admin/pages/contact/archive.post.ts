// ADMIN only. draft|published → archived; the public stops receiving Contact.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return contactFor(cmsLang(event)).setStatus(event, user, 'archived')
})

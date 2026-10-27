// ADMIN only. draft|published → archived; the public stops receiving OPEN.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return openFor(cmsLang(event)).setStatus(event, user, 'archived')
})

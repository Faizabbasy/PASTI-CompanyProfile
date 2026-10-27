// ADMIN only. draft|published → archived; the public stops receiving Creative.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return creativeFor(cmsLang(event)).setStatus(event, user, 'archived')
})

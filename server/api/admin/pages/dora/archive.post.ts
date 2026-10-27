// ADMIN only. draft|published → archived; the public stops receiving DORA.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return doraFor(cmsLang(event)).setStatus(event, user, 'archived')
})

// ADMIN only. draft|published → archived; the public stops receiving Technology.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return setTechnologyStatus(event, user, 'archived')
})

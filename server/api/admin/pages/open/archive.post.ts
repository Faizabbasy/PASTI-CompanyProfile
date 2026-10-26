// ADMIN only. draft|published → archived; the public stops receiving OPEN.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return setOpenStatus(event, user, 'archived')
})

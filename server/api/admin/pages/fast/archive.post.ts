// ADMIN only. draft|published → archived; the public stops receiving FAST.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return setFastStatus(event, user, 'archived')
})

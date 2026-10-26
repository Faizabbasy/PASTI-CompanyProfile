// ADMIN only. draft|published → archived; the public stops receiving DORA.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return setDoraStatus(event, user, 'archived')
})

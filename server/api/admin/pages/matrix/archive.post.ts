// ADMIN only. draft|published → archived; the public stops receiving MATRIX.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return setMatrixStatus(event, user, 'archived')
})

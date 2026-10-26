// ADMIN only. draft|published → archived; /work falls back to its code content.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return workPage.setStatus(event, user, 'archived')
})

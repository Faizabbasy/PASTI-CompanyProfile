// ADMIN only. draft|published → archived; the public stops receiving MATRIX.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return matrixFor(cmsLang(event)).setStatus(event, user, 'archived')
})

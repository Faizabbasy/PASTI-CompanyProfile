// ADMIN only. published|archived → draft; the public stops receiving MATRIX.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return matrixFor(cmsLang(event)).setStatus(event, user, 'draft')
})

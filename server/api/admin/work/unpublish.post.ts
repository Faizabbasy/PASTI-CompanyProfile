// ADMIN only. published|archived → draft; /work falls back to its code content.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return workPage.setStatus(event, user, 'draft')
})

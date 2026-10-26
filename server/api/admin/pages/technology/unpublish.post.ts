// ADMIN only. published|archived → draft; the public stops receiving Technology.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return setTechnologyStatus(event, user, 'draft')
})

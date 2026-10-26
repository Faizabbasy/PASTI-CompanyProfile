// ADMIN only. published|archived → draft; the public stops receiving Creative.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return setCreativeStatus(event, user, 'draft')
})

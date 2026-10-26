// ADMIN only. published|archived → draft; the public stops receiving FAST.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return setFastStatus(event, user, 'draft')
})

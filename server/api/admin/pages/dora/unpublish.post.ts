// ADMIN only. published|archived → draft; the public stops receiving DORA.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return setDoraStatus(event, user, 'draft')
})

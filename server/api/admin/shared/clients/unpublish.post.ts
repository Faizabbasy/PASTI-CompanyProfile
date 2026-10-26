// ADMIN only. published|archived → draft; the public stops receiving Clients.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return sharedPages.clients.setStatus(event, user, 'draft')
})

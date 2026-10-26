// ADMIN only. draft|published → archived; the public stops receiving Clients.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return sharedPages.clients.setStatus(event, user, 'archived')
})

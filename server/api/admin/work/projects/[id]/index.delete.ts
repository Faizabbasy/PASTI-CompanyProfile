// ADMIN only, and only for records that were never published (archive otherwise).
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.delete')
  await projectsCollection.hardDelete(event, getRouterParam(event, 'id') ?? '')
  return { ok: true }
})

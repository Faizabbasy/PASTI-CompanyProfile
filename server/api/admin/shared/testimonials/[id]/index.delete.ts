// ADMIN only, and only for drafts that were never published and that no
// page references (archive otherwise).
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.delete')
  await testimonialsCollection.hardDelete(event, getRouterParam(event, 'id') ?? '')
  return { ok: true }
})

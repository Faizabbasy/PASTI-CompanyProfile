// Authenticated draft preview data (ADMIN + EDITOR). Lives under
// /api/admin, so the session + no-store/noindex rules apply.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  const draft = await sharedPages.clients.getDraftContent()
  await audit(event, { action: 'clients.preview', entityType: 'shared', entityId: 'clients', metadata: { draftVersion: draft.version, revision: draft.revision } })
  return draft
})

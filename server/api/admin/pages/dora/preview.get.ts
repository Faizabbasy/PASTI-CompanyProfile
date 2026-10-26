// Authenticated draft preview data (ADMIN + EDITOR). Lives under
// /api/admin, so the session + no-store/noindex rules apply.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  const draft = await getDoraDraftContent()
  await audit(event, { action: 'dora.preview', entityType: 'page', entityId: 'dora', metadata: { draftVersion: draft.version, revision: draft.revision } })
  return draft
})

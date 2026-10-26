// Authenticated draft preview data (ADMIN + EDITOR). Lives under
// /api/admin, so the session + no-store/noindex rules apply.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  const draft = await getCreativeDraftContent()
  await audit(event, { action: 'creative.preview', entityType: 'page', entityId: 'creative', metadata: { draftVersion: draft.version, revision: draft.revision } })
  return draft
})

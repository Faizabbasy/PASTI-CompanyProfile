// Authenticated draft preview data (ADMIN + EDITOR). Lives under
// /api/admin, so the session + no-store/noindex rules apply.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  const draft = await getTechnologyDraftContent()
  await audit(event, { action: 'technology.preview', entityType: 'page', entityId: 'technology', metadata: { draftVersion: draft.version, revision: draft.revision } })
  return draft
})

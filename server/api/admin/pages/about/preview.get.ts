// Authenticated draft preview data (ADMIN + EDITOR). Lives under
// /api/admin, so the session + no-store/noindex rules apply.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  const draft = await getAboutDraftContent()
  await audit(event, { action: 'about.preview', entityType: 'page', entityId: 'about', metadata: { draftVersion: draft.version, revision: draft.revision } })
  return draft
})

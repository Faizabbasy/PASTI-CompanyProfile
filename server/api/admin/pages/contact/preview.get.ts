// Authenticated draft preview data (ADMIN + EDITOR). Lives under
// /api/admin, so the session + no-store/noindex rules apply.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  const draft = await getContactDraftContent()
  await audit(event, { action: 'contact.preview', entityType: 'page', entityId: 'contact', metadata: { draftVersion: draft.version, revision: draft.revision } })
  return draft
})

// Authenticated draft preview data (ADMIN + EDITOR). Lives under
// /api/admin, so the session + no-store/noindex rules apply.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  const draft = await sharedPages.faqs.getDraftContent()
  await audit(event, { action: 'faqs.preview', entityType: 'shared', entityId: 'faqs', metadata: { draftVersion: draft.version, revision: draft.revision } })
  return draft
})

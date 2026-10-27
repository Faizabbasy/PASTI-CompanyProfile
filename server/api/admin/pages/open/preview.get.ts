// Authenticated draft preview data (ADMIN + EDITOR). Lives under
// /api/admin, so the session + no-store/noindex rules apply.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  const draft = await openFor(cmsLang(event)).getDraftContent()
  await audit(event, { action: 'open.preview', entityType: 'page', entityId: 'open', metadata: { lang: cmsLang(event), draftVersion: draft.version, revision: draft.revision } })
  return draft
})

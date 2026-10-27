// Authenticated draft preview data (ADMIN + EDITOR). Lives under
// /api/admin, so the session + no-store/noindex rules apply.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  const draft = await ecorporateFor(cmsLang(event)).getDraftContent()
  await audit(event, { action: 'ecorporate.preview', entityType: 'page', entityId: 'e-corporate', metadata: { lang: cmsLang(event), draftVersion: draft.version, revision: draft.revision } })
  return draft
})

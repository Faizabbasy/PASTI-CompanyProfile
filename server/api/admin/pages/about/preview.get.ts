// Authenticated draft preview data (ADMIN + EDITOR). Lives under
// /api/admin, so the session + no-store/noindex rules apply. `proofLive`:
// whether the website shows the CMS proof numbers (server flag), so the
// preview can show what the page really shows.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  const draft = await aboutFor(cmsLang(event)).getDraftContent()
  await audit(event, { action: 'about.preview', entityType: 'page', entityId: 'about', metadata: { lang: cmsLang(event), draftVersion: draft.version, revision: draft.revision } })
  return { ...draft, proofLive: cmsPublicFlags(event).aboutPublicProofEnabled }
})

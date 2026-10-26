// Authenticated draft preview data (ADMIN + EDITOR): the Work draft plus the
// drafts of every non-archived project / case study. Lives under /api/admin,
// so the session + no-store/noindex rules apply.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  const data = await getWorkPreviewData()
  await audit(event, { action: 'work.preview', entityType: 'page', entityId: 'work', metadata: { draftVersion: data.work.version, revision: data.work.revision } })
  return data
})

// Authenticated draft preview data (ADMIN + EDITOR): the landing draft plus
// the drafts of every non-archived article / category.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  const data = await getInsightsPreviewData()
  await audit(event, { action: 'insights.preview', entityType: 'page', entityId: 'insights', metadata: { draftVersion: data.insights.version, revision: data.insights.revision } })
  return data
})

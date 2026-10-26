// Authenticated draft preview data for one record (ADMIN + EDITOR).
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  const id = getRouterParam(event, 'id') ?? ''
  const data = await getArticlePreviewData(id)
  await audit(event, { action: 'article.preview', entityType: 'article', entityId: id, metadata: { draftVersion: data.record.version } })
  return data
})

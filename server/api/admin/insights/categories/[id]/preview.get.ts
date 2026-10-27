// Authenticated draft preview data for one record (ADMIN + EDITOR).
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  const id = getRouterParam(event, 'id') ?? ''
  const data = await getCategoryPreviewData(id, cmsLang(event))
  return data
})

// Authenticated draft preview data for one record (ADMIN + EDITOR).
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  return getRecordPreviewData('caseStudy', getRouterParam(event, 'id') ?? '', cmsLang(event))
})

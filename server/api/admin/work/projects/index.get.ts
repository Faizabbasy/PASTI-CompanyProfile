// Projects list (admin): drafts included, with derived relations.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  return listProjectRows(cmsLang(event))
})

// Case studies list (admin): drafts included, with derived relations.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  return listCaseRows(cmsLang(event))
})

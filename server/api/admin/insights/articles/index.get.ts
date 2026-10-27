// Articles list (admin): drafts included, with derived counts.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  return listArticleRows(cmsLang(event))
})

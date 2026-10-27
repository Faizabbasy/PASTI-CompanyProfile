// Work page CMS state: working draft + publication metadata. Seeds the dev
// dummy projects / case study first (the dummy page references them).
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  await ensureWorkSeeded()
  return workPage.forLocale(cmsLang(event)).getState()
})

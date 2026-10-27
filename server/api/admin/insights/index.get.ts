// Insights landing CMS state: working draft + publication metadata. Seeds the
// dev dummy categories / articles first (the dummy landing references them).
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  await ensureInsightsSeeded()
  return insightsPage.forLocale(cmsLang(event)).getState()
})

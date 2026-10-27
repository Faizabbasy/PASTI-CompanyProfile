// FAQs CMS state: working draft + publication metadata.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  return sharedPages.faqs.forLocale(cmsLang(event)).getState()
})

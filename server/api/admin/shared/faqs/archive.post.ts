// ADMIN only. draft|published → archived; the public stops receiving FAQs.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return sharedPages.faqs.forLocale(cmsLang(event)).setStatus(event, user, 'archived')
})

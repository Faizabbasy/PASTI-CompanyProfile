// ADMIN only. published|archived → draft; the public stops receiving FAQs.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return sharedPages.faqs.setStatus(event, user, 'draft')
})

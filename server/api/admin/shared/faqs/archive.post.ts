// ADMIN only. draft|published → archived; the public stops receiving FAQs.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return sharedPages.faqs.setStatus(event, user, 'archived')
})

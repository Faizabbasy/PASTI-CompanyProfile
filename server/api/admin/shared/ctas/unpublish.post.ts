// ADMIN only. published|archived → draft; the public stops receiving Global CTAs.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return sharedPages.ctas.setStatus(event, user, 'draft')
})

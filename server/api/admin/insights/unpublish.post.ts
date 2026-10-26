// ADMIN only. published|archived → draft; /insights falls back to its code content.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return insightsPage.setStatus(event, user, 'draft')
})

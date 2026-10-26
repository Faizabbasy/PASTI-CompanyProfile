// ADMIN only. published|archived → draft (hidden from the public).
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return projectAdminResponse(await projectsCollection.setStatus(event, user, getRouterParam(event, 'id') ?? '', 'draft'))
})

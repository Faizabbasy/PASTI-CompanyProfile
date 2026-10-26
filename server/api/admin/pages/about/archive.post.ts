// ADMIN only. draft|published → archived; the public stops receiving About.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return setAboutStatus(event, user, 'archived')
})

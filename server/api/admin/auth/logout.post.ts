export default defineEventHandler(async (event) => {
  const { user } = await requireCmsUser(event)
  await audit(event, { action: 'logout', entityType: 'auth', userId: user.id })
  await destroyCmsSession(event)
  return { ok: true }
})

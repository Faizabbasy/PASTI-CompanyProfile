export default defineEventHandler(async (event) => {
  const { user, session } = await requireCmsUser(event)
  return { user: toPublicUser(user), csrfToken: session.csrfToken, expiresAt: session.expiresAt }
})

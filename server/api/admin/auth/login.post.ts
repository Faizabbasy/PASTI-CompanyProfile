import { z } from 'zod'

const LoginBody = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(256)
  })
  .strict()

// Failed logins never answer faster than this, whatever the cause.
const MIN_FAILURE_MS = 400

export default defineEventHandler(async (event) => {
  const started = Date.now()
  const { email, password } = await readZodBody(event, LoginBody)

  await assertLoginAllowed(event, email)

  const user = await getUserByEmail(email)
  const ok = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()))

  if (!user || !ok || user.disabled) {
    await recordLoginFailure(event, email)
    await audit(event, {
      action: 'login.failure',
      entityType: 'auth',
      userId: user?.id ?? null,
      metadata: { email }
    })
    const wait = MIN_FAILURE_MS - (Date.now() - started)
    if (wait > 0) await new Promise((r) => setTimeout(r, wait))
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  await clearLoginFailures(event, email)
  const session = await createCmsSession(event, user)
  await audit(event, { action: 'login.success', entityType: 'auth', userId: user.id })

  return { user: toPublicUser(user), csrfToken: session.csrfToken, expiresAt: session.expiresAt }
})

import { createHmac, randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'
import type { CmsSession, CmsUser } from './types'

export const SESSION_IDLE_MS = 2 * 60 * 60 * 1000
export const SESSION_ABSOLUTE_MS = 8 * 60 * 60 * 1000
// Don't rewrite the session record on every request — only once a minute.
const TOUCH_INTERVAL_MS = 60 * 1000

// `__Host-` binds the cookie to this exact origin over HTTPS (no Domain,
// Path=/, Secure). Plain-HTTP dev can't satisfy that, so dev drops the prefix.
export function sessionCookieName(event: H3Event): string {
  return cmsConfig(event).isProd ? '__Host-pasti_admin' : 'pasti_admin'
}

// Storage only ever holds an HMAC of the cookie token, so a leaked storage
// dump can't be replayed as a valid session cookie.
function sessionKey(event: H3Event, token: string): string {
  const digest = createHmac('sha256', cmsConfig(event).sessionSecret).update(token).digest('hex')
  return `sessions:${digest}`
}

export async function createCmsSession(event: H3Event, user: CmsUser): Promise<CmsSession> {
  // Always a fresh token on login — never reuse an incoming one (fixation).
  const previous = getCookie(event, sessionCookieName(event))
  if (previous) await cmsStorage().removeItem(sessionKey(event, previous))

  const token = randomBytes(32).toString('base64url')
  const now = Date.now()
  const session: CmsSession = {
    userId: user.id,
    csrfToken: randomBytes(32).toString('base64url'),
    createdAt: now,
    lastSeenAt: now,
    expiresAt: now + SESSION_ABSOLUTE_MS,
    ip: clientIp(event),
    ua: (getRequestHeader(event, 'user-agent') || '').slice(0, 200)
  }
  await cmsStorage().setItem(sessionKey(event, token), session)
  setCookie(event, sessionCookieName(event), token, {
    httpOnly: true,
    secure: cmsConfig(event).isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: Math.floor(SESSION_ABSOLUTE_MS / 1000)
  })
  return session
}

export interface ResolvedSession {
  session: CmsSession
  user: CmsUser
}

// Validates the cookie against storage, enforces idle + absolute expiry, and
// re-reads the user so a role change or disable takes effect immediately.
export async function getCmsSession(event: H3Event): Promise<ResolvedSession | null> {
  if (event.context.cmsSession !== undefined) return event.context.cmsSession

  const resolved = await resolveSession(event)
  event.context.cmsSession = resolved
  return resolved
}

async function resolveSession(event: H3Event): Promise<ResolvedSession | null> {
  const token = getCookie(event, sessionCookieName(event))
  if (!token || token.length > 128) return null

  const key = sessionKey(event, token)
  const session = await cmsStorage().getItem<CmsSession>(key)
  if (!session) return null

  const now = Date.now()
  if (now > session.expiresAt || now - session.lastSeenAt > SESSION_IDLE_MS) {
    await cmsStorage().removeItem(key)
    return null
  }

  const user = await getUserById(session.userId)
  if (!user || user.disabled) {
    await cmsStorage().removeItem(key)
    return null
  }

  if (now - session.lastSeenAt > TOUCH_INTERVAL_MS) {
    session.lastSeenAt = now
    await cmsStorage().setItem(key, session)
  }
  return { session, user }
}

export async function destroyCmsSession(event: H3Event): Promise<void> {
  const name = sessionCookieName(event)
  const token = getCookie(event, name)
  if (token) await cmsStorage().removeItem(sessionKey(event, token))
  deleteCookie(event, name, {
    httpOnly: true,
    secure: cmsConfig(event).isProd,
    sameSite: 'strict',
    path: '/'
  })
  event.context.cmsSession = null
}

declare module 'h3' {
  interface H3EventContext {
    cmsSession?: ResolvedSession | null
  }
}

import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'

// Login throttling. Fixed windows kept in CMS storage, counting FAILED
// attempts only — successful logins never consume budget, so many people
// behind one office/NAT address can still sign in (Step 3 fix):
// - per IP + email: 5 failures / 15 min → that pair locked for 15 min
// - per IP: 20 failures / 15 min → IP locked for the rest of the window
const WINDOW_MS = 15 * 60 * 1000
const PAIR_MAX_FAILURES = 5
const IP_MAX_FAILURES = 20

interface Counter {
  count: number
  resetAt: number
}

const hashKey = (raw: string) => createHash('sha256').update(raw).digest('hex').slice(0, 32)
const pairKey = (ip: string, email: string) => `ratelimit:pair:${hashKey(`${ip}|${email}`)}`
const ipKey = (ip: string) => `ratelimit:ip:${hashKey(ip)}`

async function read(key: string): Promise<Counter | null> {
  const c = await cmsStorage().getItem<Counter>(key)
  if (!c || Date.now() > c.resetAt) return null
  return c
}

async function bump(key: string): Promise<Counter> {
  const now = Date.now()
  const c = (await read(key)) ?? { count: 0, resetAt: now + WINDOW_MS }
  c.count += 1
  await cmsStorage().setItem(key, c)
  return c
}

// Throws 429 with Retry-After when the pair or the IP is locked.
export async function assertLoginAllowed(event: H3Event, email: string): Promise<void> {
  const ip = clientIp(event)
  const [pair, ipCounter] = await Promise.all([read(pairKey(ip, email)), read(ipKey(ip))])

  const lockedUntil = Math.max(
    pair && pair.count >= PAIR_MAX_FAILURES ? pair.resetAt : 0,
    ipCounter && ipCounter.count >= IP_MAX_FAILURES ? ipCounter.resetAt : 0
  )
  if (lockedUntil > 0) {
    const retryAfter = Math.max(1, Math.ceil((lockedUntil - Date.now()) / 1000))
    setResponseHeader(event, 'retry-after', retryAfter)
    await audit(event, {
      action: 'login.locked',
      entityType: 'auth',
      metadata: { email, retryAfter }
    })
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many login attempts',
      data: { retryAfter }
    })
  }
}

export async function recordLoginFailure(event: H3Event, email: string): Promise<void> {
  const ip = clientIp(event)
  await bump(ipKey(ip))
  const pair = await bump(pairKey(ip, email))
  // Lock the pair with a fresh full window from the failure that tripped it.
  if (pair.count === PAIR_MAX_FAILURES) {
    pair.resetAt = Date.now() + WINDOW_MS
    await cmsStorage().setItem(pairKey(ip, email), pair)
  }
}

export async function clearLoginFailures(event: H3Event, email: string): Promise<void> {
  await cmsStorage().removeItem(pairKey(clientIp(event), email))
}

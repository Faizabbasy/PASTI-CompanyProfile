import { timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import type { CmsSession } from './types'

export const CSRF_HEADER = 'x-csrf-token'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export function isStateChanging(event: H3Event): boolean {
  return !SAFE_METHODS.has(event.method)
}

// The request must come from this site. Browsers always send Origin on
// cross-origin POST/fetch and modern ones send Sec-Fetch-Site; a request
// carrying neither (e.g. a curl script) still has to pass the CSRF token.
export function assertSameOrigin(event: H3Event): void {
  const fetchSite = getRequestHeader(event, 'sec-fetch-site')
  if (fetchSite && fetchSite !== 'same-origin') {
    throw createError({ statusCode: 403, statusMessage: 'Cross-site request blocked' })
  }
  const origin = getRequestHeader(event, 'origin')
  if (origin) {
    const expected = getRequestURL(event, { xForwardedHost: cmsConfig(event).trustProxy }).origin
    if (origin !== expected) {
      throw createError({ statusCode: 403, statusMessage: 'Cross-site request blocked' })
    }
  }
}

export function assertCsrf(event: H3Event, session: CmsSession): void {
  const sent = getRequestHeader(event, CSRF_HEADER) || ''
  const a = Buffer.from(sent)
  const b = Buffer.from(session.csrfToken)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid CSRF token' })
  }
}

// Admin CMS gate (defense in depth — every /api/admin handler still calls
// requireCmsUser/requirePermission itself).
//
// /api/admin/**  → valid session required (except login); state-changing
//                  requests must be same-origin and carry the CSRF token.
// /admin/**      → server-rendered page requests without a session are
//                  redirected to /admin/login before anything renders.

const LOGIN_API = '/api/admin/auth/login'

function isUnder(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`)
}

export default defineEventHandler(async (event) => {
  const path = event.path.split('?')[0]!

  if (isUnder(path, '/api/admin')) {
    if (isStateChanging(event)) assertSameOrigin(event)
    if (path === LOGIN_API) return

    const resolved = await getCmsSession(event)
    if (!resolved) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    if (isStateChanging(event)) assertCsrf(event, resolved.session)
    return
  }

  if (isUnder(path, '/admin') && (event.method === 'GET' || event.method === 'HEAD')) {
    const resolved = await getCmsSession(event)
    if (path === '/admin/login') {
      if (resolved) return sendRedirect(event, '/admin', 302)
      return
    }
    if (!resolved) {
      const next = encodeURIComponent(path)
      return sendRedirect(event, `/admin/login?next=${next}`, 302)
    }
  }
})

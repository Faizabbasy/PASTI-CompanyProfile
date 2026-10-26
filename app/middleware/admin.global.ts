// /admin/** route gate (UX layer). The server enforces the same rules in
// server/middleware/cms-guard.ts and in every /api/admin handler.

const ADMIN_ONLY: { prefix: string; permission: 'users.manage' }[] = [
  { prefix: '/admin/users', permission: 'users.manage' }
]

export default defineNuxtRouteMiddleware(async (to) => {
  if (!isAdminPath(to.path)) return

  const { fetchSession, can } = useCmsSession()
  const user = await fetchSession()

  if (to.path === '/admin/login') {
    return user ? navigateTo(safeAdminNext(to.query.next)) : undefined
  }
  if (!user) {
    return navigateTo({ path: '/admin/login', query: { next: to.fullPath } })
  }
  const gated = ADMIN_ONLY.find((g) => to.path === g.prefix || to.path.startsWith(`${g.prefix}/`))
  if (gated && !can(gated.permission)) {
    return navigateTo({ path: '/admin', query: { denied: gated.prefix.split('/').pop() } })
  }
})

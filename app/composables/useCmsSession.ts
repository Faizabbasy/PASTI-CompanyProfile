import { roleCan, type CmsPermission, type CmsPublicUser } from '#shared/utils/cmsPermissions'

// Admin CMS session, held in memory only (useState → SSR payload). The
// session cookie is HttpOnly and never readable here; the CSRF token lives
// in this state and is never written to localStorage/sessionStorage.
// Permission checks here only shape the UI — the server re-checks everything.

interface CmsSessionState {
  user: CmsPublicUser | null
  csrfToken: string | null
  expiresAt: number | null
  loaded: boolean
}

interface SessionPayload {
  user: CmsPublicUser
  csrfToken: string
  expiresAt: number
}

export function useCmsSession() {
  const state = useState<CmsSessionState>('cms-session', () => ({
    user: null,
    csrfToken: null,
    expiresAt: null,
    loaded: false
  }))
  const requestFetch = useRequestFetch()

  function apply(payload: SessionPayload | null) {
    state.value = {
      user: payload?.user ?? null,
      csrfToken: payload?.csrfToken ?? null,
      expiresAt: payload?.expiresAt ?? null,
      loaded: true
    }
  }

  async function fetchSession(force = false) {
    if (state.value.loaded && !force) return state.value.user
    try {
      apply(await requestFetch<SessionPayload>('/api/admin/auth/me'))
    } catch {
      apply(null)
    }
    return state.value.user
  }

  async function login(email: string, password: string) {
    const payload = await $fetch<SessionPayload>('/api/admin/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    apply(payload)
    return payload.user
  }

  async function logout() {
    try {
      await cmsFetch('/api/admin/auth/logout', { method: 'POST' })
    } finally {
      apply(null)
      // Full reload so no admin state survives in memory.
      await navigateTo('/admin/login', { external: true, replace: true })
    }
  }

  // Authenticated admin API call: adds the CSRF header to every request and
  // sends the user back to login when the session has gone. Editors with
  // unsaved work pass `keepOn401` and show their own session-expired notice
  // instead of navigating away.
  async function cmsFetch<T>(url: string, opts: Parameters<typeof $fetch>[1] & { keepOn401?: boolean } = {}): Promise<T> {
    const { keepOn401, ...fetchOpts } = opts
    const headers = new Headers(fetchOpts.headers as HeadersInit | undefined)
    if (state.value.csrfToken) headers.set('x-csrf-token', state.value.csrfToken)
    try {
      return (await requestFetch(url, { ...fetchOpts, headers } as never)) as T
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode
      if (status === 401 && import.meta.client && !keepOn401 && !url.endsWith('/auth/logout')) {
        apply(null)
        await navigateTo(`/admin/login?next=${encodeURIComponent(useRoute().fullPath)}`)
      }
      throw err
    }
  }

  const user = computed(() => state.value.user)
  const can = (permission: CmsPermission) => roleCan(state.value.user?.role, permission)

  return { state, user, can, fetchSession, login, logout, cmsFetch }
}

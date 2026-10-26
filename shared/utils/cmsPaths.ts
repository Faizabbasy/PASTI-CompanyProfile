export function isAdminPath(path: string): boolean {
  return path === '/admin' || path.startsWith('/admin/')
}

// Only same-app admin paths are accepted as a post-login redirect target.
export function safeAdminNext(next: unknown): string {
  if (typeof next !== 'string') return '/admin'
  if (!isAdminPath(next) || next.startsWith('/admin/login') || /[\\]|\/\//.test(next)) return '/admin'
  return next
}

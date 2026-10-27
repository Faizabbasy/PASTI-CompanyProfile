// Bilingual site (owner 2026-10-27): Indonesian is the main language at /…,
// English lives at /en/… (route twins added in nuxt.config `pages:extend`).
// The language is read from the URL — never from a cookie or the browser —
// so every URL always shows the same language (what search engines need).

export type Locale = 'id' | 'en'
export const LOCALES: readonly Locale[] = ['id', 'en']

export function localeOfPath(path: string): Locale {
  return path === '/en' || path.startsWith('/en/') || path.startsWith('/en?') || path.startsWith('/en#') ? 'en' : 'id'
}

/** Path without the /en prefix ('/en/fast' → '/fast', '/en' → '/'). */
export function stripLocale(path: string): string {
  if (path === '/en') return '/'
  if (/^\/en[/?#]/.test(path)) return path.slice(3).replace(/^([?#])/, '/$1')
  return path
}

/**
 * The same page in `locale`. Only site-relative paths change; https://,
 * mailto:, tel:, #anchors and /admin stay as they are.
 */
export function localePath(path: string, locale: Locale): string {
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/admin') || path.startsWith('/api/')) return path
  const base = stripLocale(path)
  if (locale === 'id') return base
  const m = base.match(/^([^?#]*)(.*)$/)!
  return m[1] === '/' ? `/en${m[2]}` : `/en${base}`
}

/** Current language. Outside a Nuxt app (migration scripts) → 'en', the language of the code base copy. */
export function useLocale(): Locale {
  try {
    const route = useRoute()
    // Admin draft previews render the real components in the language being
    // previewed (?lang=en), Indonesian otherwise.
    if (route.path.startsWith('/admin/preview')) return route.query.lang === 'en' ? 'en' : 'id'
    return localeOfPath(route.path)
  } catch {
    return 'en'
  }
}

/** `lp('/about')` → '/about' on Indonesian pages, '/en/about' on English pages. */
export function useLocalePath() {
  const locale = useLocale()
  return (path: string) => localePath(path, locale)
}

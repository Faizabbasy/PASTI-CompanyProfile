// One URL per page (SEO pass 2026-10-27): /about/ answered 200 next to
// /about, two addresses for the same content. Any page path with a trailing
// slash now 301s to the slash-less one (query kept). API, assets and the
// root are left alone.
export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname
  if (path === '/' || !path.endsWith('/')) return
  if (path.startsWith('/api/') || path.startsWith('/_') || /\.[a-z0-9]+\/?$/i.test(path)) return
  return sendRedirect(event, `${path.replace(/\/+$/, '') || '/'}${url.search}`, 301)
})

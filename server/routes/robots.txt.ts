// /robots.txt — open to all crawlers, pointing at the sitemap on the
// production origin (replaces the former static public/robots.txt).
export default defineEventHandler((event) => {
  const base = useRuntimeConfig(event).public.siteUrl.replace(/\/+$/, '')

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `User-Agent: *
Disallow:

Sitemap: ${base}/sitemap.xml
`
})

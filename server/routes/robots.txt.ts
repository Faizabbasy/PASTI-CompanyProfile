// /robots.txt — open to all crawlers except the internal CMS and API,
// pointing at the sitemap on the production origin.
export default defineEventHandler((event) => {
  const base = useRuntimeConfig(event).public.siteUrl.replace(/\/+$/, '')

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `User-Agent: *
Disallow: /admin
Disallow: /api/

Sitemap: ${base}/sitemap.xml
`
})

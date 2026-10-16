// /sitemap.xml — every public page, on the production origin
// (runtimeConfig.public.siteUrl). Add new routes here when a page ships.
const routes = ['/', '/about', '/work', '/creative', '/technology', '/insights', '/contact', '/open', '/e-corporate', '/shiftly']

export default defineEventHandler((event) => {
  const base = useRuntimeConfig(event).public.siteUrl.replace(/\/+$/, '')
  const urls = routes.map((r) => `  <url><loc>${base}${r === '/' ? '/' : r}</loc></url>`).join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
})

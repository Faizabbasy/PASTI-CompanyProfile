// /sitemap.xml — every public page, on the production origin
// (runtimeConfig.public.siteUrl). Add new routes here when a page ships.
// <lastmod> is the page's real CMS publish date when it has one (never a
// guessed date); pages without a CMS record simply omit it.
const routes: { path: string; cms?: string }[] = [
  { path: '/' },
  { path: '/about', cms: 'about' },
  { path: '/work', cms: 'work' },
  { path: '/creative', cms: 'creative' },
  { path: '/technology', cms: 'technology' },
  { path: '/insights', cms: 'insights' },
  { path: '/contact', cms: 'contact' },
  { path: '/open', cms: 'open' },
  { path: '/e-corporate', cms: 'e-corporate' },
  { path: '/shiftly', cms: 'shiftly' },
  { path: '/fast', cms: 'fast' },
  { path: '/dora', cms: 'dora' },
  { path: '/matrix', cms: 'matrix' }
]

async function publishedAt(id: string): Promise<string | null> {
  try {
    const r = await cmsStorage().getItem<{ status?: string; publishedAt?: string | null; dummy?: boolean }>(`pages:${id}`)
    return r && r.status === 'published' && !r.dummy && r.publishedAt ? r.publishedAt.slice(0, 10) : null
  } catch {
    // CMS store unavailable → the sitemap still works, just without dates.
    return null
  }
}

export default defineEventHandler(async (event) => {
  const base = useRuntimeConfig(event).public.siteUrl.replace(/\/+$/, '')
  const rows = await Promise.all(
    routes.map(async (r) => {
      const lastmod = r.cms ? await publishedAt(r.cms) : null
      return `  <url><loc>${base}${r.path}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
    })
  )

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.join('\n')}
</urlset>
`
})

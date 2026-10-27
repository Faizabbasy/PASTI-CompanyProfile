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
  // Every page in both languages (Indonesian at /…, English at /en/…), each
  // entry listing its alternates so search engines pair them.
  const enPath = (p: string) => (p === '/' ? '/en' : `/en${p}`)
  const rows = await Promise.all(
    routes.map(async (r) => {
      const lastmod = r.cms ? await publishedAt(r.cms) : null
      const alts = [
        `<xhtml:link rel="alternate" hreflang="id" href="${base}${r.path}"/>`,
        `<xhtml:link rel="alternate" hreflang="en" href="${base}${enPath(r.path)}"/>`,
        `<xhtml:link rel="alternate" hreflang="x-default" href="${base}${r.path}"/>`
      ].join('')
      const lm = lastmod ? `<lastmod>${lastmod}</lastmod>` : ''
      return [`  <url><loc>${base}${r.path}</loc>${lm}${alts}</url>`, `  <url><loc>${base}${enPath(r.path)}</loc>${lm}${alts}</url>`].join('\n')
    })
  )

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${rows.join('\n')}
</urlset>
`
})

// /sitemap.xml — every public page, on the production origin
// (runtimeConfig.public.siteUrl). Add new routes here when a page ships;
// article pages are listed from the Insights CMS.
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

  // Article pages (/insights/:slug): only where that language has a published
  // page. A slug is shared by both languages, so alternates pair up when
  // both exist. <lastmod> = that record's real publish date.
  const live = cmsPublicFlags(event).insightsPublicEnabled
  const articles = live ? await Promise.all((['id', 'en'] as const).map((l) => listPublishedArticlePages(l).catch(() => []))) : [[], []]
  const [idArts, enArts] = articles as [{ slug: string; publishedAt: string | null }[], { slug: string; publishedAt: string | null }[]]
  const slugs = [...new Set([...idArts, ...enArts].map((a) => a.slug))]
  for (const slug of slugs) {
    const id = idArts.find((a) => a.slug === slug)
    const en = enArts.find((a) => a.slug === slug)
    const idUrl = `${base}/insights/${slug}`
    const enUrl = `${base}/en/insights/${slug}`
    const alts = id && en
      ? [
          `<xhtml:link rel="alternate" hreflang="id" href="${idUrl}"/>`,
          `<xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>`,
          `<xhtml:link rel="alternate" hreflang="x-default" href="${idUrl}"/>`
        ].join('')
      : ''
    const lm = (d: string | null) => (d ? `<lastmod>${d.slice(0, 10)}</lastmod>` : '')
    if (id) rows.push(`  <url><loc>${idUrl}</loc>${lm(id.publishedAt)}${alts}</url>`)
    if (en) rows.push(`  <url><loc>${enUrl}</loc>${lm(en.publishedAt)}${alts}</url>`)
  }

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${rows.join('\n')}
</urlset>
`
})

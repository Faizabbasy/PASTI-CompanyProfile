// schema.org structured data (JSON-LD) so search engines understand who PASTI
// is, where the office is, what the products are and what the FAQ answers.
// Built only from facts the site already shows (useFooter contact facts,
// useCompany, page SEO copy) — nothing invented: no ratings, prices or
// reviews. Social profiles appear only once they are filled in (Global CTAs).
//
// Graph (SEO pass 2026-10-27): every page carries the Organization, the
// WebSite and its own WebPage (language, breadcrumb), linked by @id so Google
// reads them as one entity. "PASTI People" is the name the old site was
// indexed under — kept as an alternate name so brand searches carry over.

type Ld = Record<string, unknown>

function ldScript(key: string, data: Ld) {
  useHead({ script: [{ key: `ld-${key}`, type: 'application/ld+json', innerHTML: JSON.stringify(data) }] })
}

const ALTERNATE_NAMES = ['PASTI People', 'Pasti People']

function organization(): Ld {
  const { contact, socials, serviceLinks } = useFooter()
  const locale = useLocale()
  const url = useSiteUrl('/')
  return {
    '@type': 'ProfessionalService',
    '@id': `${url}#organization`,
    name: 'PASTI',
    alternateName: ALTERNATE_NAMES,
    legalName: contact.entity,
    description: contact.positioning,
    url,
    logo: useSiteUrl('/images/pasti-logo.webp'),
    image: useSiteUrl('/images/og/home.jpg'),
    foundingDate: '2020',
    email: contact.email ?? undefined,
    telephone: contact.whatsappDisplay,
    address: contact.address
      ? { '@type': 'PostalAddress', streetAddress: contact.address, addressLocality: 'Jakarta Selatan', addressRegion: 'DKI Jakarta', postalCode: '12430', addressCountry: 'ID' }
      : undefined,
    hasMap: contact.mapsUrl ?? undefined,
    areaServed: { '@type': 'Country', name: 'Indonesia' },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: contact.whatsappDisplay,
      email: contact.email ?? undefined,
      areaServed: 'ID',
      availableLanguage: ['Indonesian', 'English']
    },
    // The services the site lists (footer / homepage), each on its pillar page.
    knowsAbout: serviceLinks.map((s) => s.label),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: locale === 'id' ? 'Layanan PASTI' : 'PASTI services',
      itemListElement: serviceLinks.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.label, url: useSiteUrl(localePath(s.to, locale)) }
      }))
    },
    sameAs: socials.filter((s) => s.url && s.key !== 'whatsapp').map((s) => s.url)
  }
}

function website(): Ld {
  const url = useSiteUrl('/')
  return {
    '@type': 'WebSite',
    '@id': `${url}#website`,
    name: 'PASTI',
    alternateName: ALTERNATE_NAMES,
    url,
    inLanguage: ['id-ID', 'en-US'],
    publisher: { '@id': `${url}#organization` }
  }
}

/** Every public page (via usePageSeo): Organization + WebSite + this WebPage. */
export function usePageLd(page: { url: string; title: string; description: string; image: string; parent?: { name: string; path: string } }) {
  const route = useRoute()
  const locale = localeOfPath(route.path)
  const site = useSiteUrl('/')
  const home = useSiteUrl(localePath('/', locale))
  const isHome = page.url === home || page.url === `${home}/`
  // Breadcrumb label = the page name before the title's tagline ("Karya
  // Pilihan — Proyek & Studi Kasus | PASTI" → "Karya Pilihan").
  const name = page.title.split(/\s[—|–]\s/)[0]!.trim()
  const graph: Ld[] = [
    organization(),
    website(),
    {
      '@type': 'WebPage',
      '@id': `${page.url}#webpage`,
      url: page.url,
      name: page.title,
      description: page.description,
      inLanguage: locale === 'id' ? 'id-ID' : 'en-US',
      isPartOf: { '@id': `${site}#website` },
      about: { '@id': `${site}#organization` },
      primaryImageOfPage: { '@type': 'ImageObject', url: page.image },
      ...(isHome ? {} : { breadcrumb: { '@id': `${page.url}#breadcrumb` } })
    }
  ]
  if (!isHome) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${page.url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: locale === 'id' ? 'Beranda' : 'Home', item: home },
        ...(page.parent ? [{ '@type': 'ListItem', position: 2, name: page.parent.name, item: useSiteUrl(page.parent.path) }] : []),
        { '@type': 'ListItem', position: page.parent ? 3 : 2, name, item: page.url }
      ]
    })
  }
  ldScript('graph', { '@context': 'https://schema.org', '@graph': graph })
}

/** Article pages (/insights/:slug): the article itself. Author = the
 * written byline when there is one, else PASTI; dates only when real. */
export function useArticleLd(a: { headline: string; description: string; image: string; author: string; date: string; section: string; keywords: string[] }) {
  const route = useRoute()
  const url = useSiteUrl(route.path.replace(/\/+$/, '') || '/')
  const org = { '@id': `${useSiteUrl('/')}#organization` }
  ldScript('article', {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@id': `${url}#webpage` },
    headline: a.headline.slice(0, 110),
    description: a.description,
    image: [useSiteUrl(a.image)],
    inLanguage: localeOfPath(route.path) === 'id' ? 'id-ID' : 'en-US',
    articleSection: a.section || undefined,
    keywords: [...new Set(a.keywords.filter(Boolean))].join(', ') || undefined,
    ...(a.date ? { datePublished: a.date } : {}),
    author: a.author ? { '@type': 'Person', name: a.author } : org,
    publisher: org,
    isPartOf: { '@id': `${useSiteUrl('/')}#website` }
  })
}

/** Homepage: its FAQ (the site graph comes from usePageSeo). */
export function useHomeLd(faq: { question: string; answer: string }[]) {
  if (faq.length) {
    ldScript('faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } }))
    })
  }
}

/** Product pages (OPEN, SHIFTLY, e-CORPORATE, FAST, DORA, MATRIX). */
export function useProductLd(p: { name: string; description: string; image: string }) {
  const route = useRoute()
  ldScript('product', {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: p.name,
    description: p.description,
    url: useSiteUrl(route.path),
    image: useSiteUrl(p.image),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    inLanguage: localeOfPath(route.path) === 'id' ? 'id-ID' : 'en-US',
    publisher: { '@id': `${useSiteUrl('/')}#organization` },
    provider: { '@id': `${useSiteUrl('/')}#organization` }
  })
}

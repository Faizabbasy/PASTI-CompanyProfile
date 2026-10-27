// schema.org structured data (JSON-LD) so search engines understand who PASTI
// is, where the office is, what the products are and what the FAQ answers.
// Built only from facts the site already shows (useFooter contact facts,
// useCompany, page SEO copy) — nothing invented: no ratings, prices or
// reviews. Social profiles appear only once they are filled in (Global CTAs).

type Ld = Record<string, unknown>

function ldScript(key: string, data: Ld) {
  useHead({ script: [{ key: `ld-${key}`, type: 'application/ld+json', innerHTML: JSON.stringify(data) }] })
}

function organization(): Ld {
  const { contact, socials } = useFooter()
  const url = useSiteUrl('/')
  return {
    '@type': 'ProfessionalService',
    '@id': `${url}#organization`,
    name: 'PASTI',
    legalName: contact.entity,
    description: contact.positioning,
    url,
    logo: useSiteUrl('/images/pasti-logo.webp'),
    image: useSiteUrl('/images/og/home.jpg'),
    foundingDate: '2020',
    email: contact.email ?? undefined,
    telephone: contact.whatsappDisplay,
    address: contact.address
      ? { '@type': 'PostalAddress', streetAddress: contact.address, addressLocality: 'Jakarta Selatan', postalCode: '12430', addressCountry: 'ID' }
      : undefined,
    areaServed: 'ID',
    sameAs: socials.filter((s) => s.url && s.key !== 'whatsapp').map((s) => s.url)
  }
}

/** Every public page: the organisation (once per page, via usePageSeo). */
export function useOrganizationLd() {
  ldScript('org', { '@context': 'https://schema.org', ...organization() })
}

/** Homepage: the website itself + its FAQ. */
export function useHomeLd(faq: { question: string; answer: string }[]) {
  const url = useSiteUrl('/')
  ldScript('website', { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${url}#website`, name: 'PASTI', url, publisher: { '@id': `${url}#organization` } })
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
    publisher: { '@id': `${useSiteUrl('/')}#organization` }
  })
}

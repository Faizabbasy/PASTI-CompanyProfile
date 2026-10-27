import { PAGE_SEO_ID } from '~/i18n/content/seo'
import { CANONICAL_HOSTS } from '#shared/cms/fields'

/**
 * Search + share metadata for every page (2026-10-16). One place to edit the
 * title/description Google shows and the card WhatsApp/LinkedIn/X render when
 * a link is shared.
 *
 * Copy is drafted from each page's existing hero copy and COMPRO 2025 facts
 * (useCompany) — no new claims. Owner review pending. Product pages (OPEN,
 * e-CORPORATE, SHIFTLY) keep their copy in their own composables' `seo`.
 *
 * Share cards live in /public/images/og/ (1200×630 JPG — WhatsApp ignores
 * WebP and relative URLs, so the image is always made absolute against
 * `runtimeConfig.public.siteUrl`, overridable with NUXT_PUBLIC_SITE_URL).
 * They are interim cards built from existing site assets.
 */
export interface PageSeo {
  title: string
  description: string
  /** Share card path under /public, e.g. '/images/og/home.jpg'. */
  image: string
  /** Absolute canonical URL override (CMS SEO); default = this route on siteUrl. */
  canonical?: string
  /** CMS SEO: ask search engines not to index the page. */
  noIndex?: boolean
}

export const pageSeo = {
  home: {
    title: 'PASTI People — Software House & Creative Agency in Jakarta',
    description:
      'PASTI builds apps, custom software, enterprise platforms, AI and creative campaigns for businesses in Indonesia. 70+ projects for 50+ clients since 2020.',
    image: '/images/og/home.jpg'
  },
  about: {
    title: 'About PASTI — Technology & Creative Partner Since 2020',
    description:
      'PASTI merges technology and creativity into one service. Since 2020: 70+ projects for 50+ clients, from state-owned enterprises to leading brands.',
    image: '/images/og/about.jpg'
  },
  work: {
    title: 'Portfolio — PASTI Projects & Case Studies',
    description:
      'PASTI’s portfolio: technology and creative projects for IKEA Indonesia, Jasa Marga, Pertamina, CIMB Niaga and more — from the brief to results running today.',
    image: '/images/og/work.jpg'
  },
  creative: {
    title: 'Creative Agency in Jakarta — Brand, Campaign & Video | PASTI',
    description:
      'PASTI creative: brand identity & UI/UX, integrated campaigns, social media, vertical video and production house — creativity that gets business results.',
    image: '/images/og/creative.jpg'
  },
  technology: {
    title: 'Custom Software & App Development Company | PASTI',
    description:
      'PASTI builds custom software, enterprise platforms, mobile apps and MVPs, AI solutions and cybersecurity — secure, scalable and built for real business needs.',
    image: '/images/og/technology.jpg'
  },
  insights: {
    title: 'Insights — Technology, Business & Creative | PASTI',
    description:
      'The PASTI Journal: perspectives on cybersecurity, enterprise technology, AI, the future of business, brands and digital products — from our client work.',
    image: '/images/og/insights.jpg'
  },
  contact: {
    title: 'Contact PASTI — Discuss Your Software or Creative Project',
    description:
      'Talk to PASTI about your app, software or creative project on WhatsApp or email, or send us a brief. Our office is in South Jakarta, Indonesia.',
    image: '/images/og/contact.jpg'
  }
} satisfies Record<string, PageSeo>

/** Absolute URL on the production origin (no trailing slash on the base). */
export function useSiteUrl(path = '/') {
  // Media-library images are already absolute (Supabase Storage).
  if (/^https:\/\//.test(path)) return path
  const base = useRuntimeConfig().public.siteUrl.replace(/\/+$/, '')
  return base + (path.startsWith('/') ? path : `/${path}`)
}

/** A URL on one of our hosts, rewritten onto the canonical origin (siteUrl). */
function onOwnOrigin(href: string): string {
  try {
    const u = new URL(href)
    if (!CANONICAL_HOSTS.includes(u.hostname)) return href
    return useSiteUrl(`${u.pathname.replace(/\/+$/, '') || '/'}${u.search}`)
  } catch {
    return href
  }
}

/** Title, description, share card and canonical URL for the current page.
 * `parent`: the page above this one in the breadcrumb (article pages);
 * `type`: Open Graph type (default website). */
export function usePageSeo(seo: PageSeo, opts: { parent?: { name: string; path: string }; type?: 'website' | 'article' } = {}) {
  const route = useRoute()
  // One address per page: never a trailing slash (server/middleware 301s them).
  const path = route.path.replace(/\/+$/, '') || '/'
  const locale = localeOfPath(path)
  const own = useSiteUrl(path)
  // A CMS canonical on our own domain (with or without www — records
  // migrated before the apex switch say www) is moved onto the canonical
  // origin. One that is just the page's default address (…/fast) is
  // per-page, not per-language: on /en/fast it would declare the English
  // page a duplicate of the Indonesian one. Only a genuinely different
  // canonical overrides the page's own URL.
  const cms = seo.canonical ? onOwnOrigin(seo.canonical) : ''
  const url = cms && cms !== useSiteUrl(stripLocale(path)) ? cms : own
  const image = useSiteUrl(seo.image)
  const idUrl = useSiteUrl(localePath(path, 'id'))
  const enUrl = useSiteUrl(localePath(path, 'en'))

  if (seo.noIndex) useHead({ meta: [{ name: 'robots', content: 'noindex' }] })

  useHead({
    htmlAttrs: { lang: locale },
    link: [
      { rel: 'canonical', href: url },
      // The same page in each language (Indonesian is the default).
      { rel: 'alternate', hreflang: 'id', href: idUrl },
      { rel: 'alternate', hreflang: 'en', href: enUrl },
      { rel: 'alternate', hreflang: 'x-default', href: idUrl }
    ]
  })
  useSeoMeta({
    title: seo.title,
    description: seo.description,
    ogTitle: seo.title,
    ogDescription: seo.description,
    ogUrl: url,
    ogType: opts.type ?? 'website',
    ogImage: image,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: seo.title,
    ogLocale: locale === 'id' ? 'id_ID' : 'en_US',
    ogLocaleAlternate: locale === 'id' ? 'en_US' : 'id_ID',
    twitterCard: 'summary_large_image',
    twitterTitle: seo.title,
    twitterDescription: seo.description,
    twitterImage: image
  })
  // Who publishes the page and what it is (schema.org graph, useStructuredData).
  usePageLd({ url, title: seo.title, description: seo.description, image, parent: opts.parent })
}

/**
 * pageSeo for the current language (Indonesian overlay in
 * app/i18n/content/seo.ts). Outside a Nuxt app → English (migration scripts).
 */
export function localizedPageSeo(key: keyof typeof pageSeo): PageSeo {
  return localize(pageSeo[key], useLocale() === 'id' ? PAGE_SEO_ID[key] : undefined) as PageSeo
}

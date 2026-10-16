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
}

export const pageSeo = {
  home: {
    title: 'PASTI — Technology & Creative Agency in Indonesia',
    description:
      'We build technology and creative solutions for businesses ready to move forward — from enterprise platforms and AI to brand communication.',
    image: '/images/og/home.jpg'
  },
  about: {
    title: 'About PASTI — We Turn Complexity into Certainty',
    description:
      'PASTI merges technology and creativity into one unified service. Since 2020: 70+ projects for 50+ clients, from state-owned enterprises to leading brands.',
    image: '/images/og/about.jpg'
  },
  work: {
    title: 'Selected Work — Projects & Case Studies | PASTI',
    description:
      'A closer look at how we work with our clients — real projects, from the brief to the result that’s running today.',
    image: '/images/og/work.jpg'
  },
  creative: {
    title: 'Creative — Brand, Campaign & Video | PASTI',
    description:
      'Creative that gets business results. We combine creativity, strategy, and execution to build brands that stand out, win attention, and earn trust.',
    image: '/images/og/creative.jpg'
  },
  technology: {
    title: 'Technology — Enterprise Platforms, AI & Apps | PASTI',
    description:
      'Technology built to move business forward. PASTI builds customized systems that are secure, scalable, and aligned with real business needs.',
    image: '/images/og/technology.jpg'
  },
  insights: {
    title: 'Insights — The PASTI Journal',
    description:
      'Perspectives on technology, creative, and business — from the work we do with our clients every day.',
    image: '/images/og/insights.jpg'
  },
  contact: {
    title: 'Contact PASTI — Let’s Build What Matters',
    description:
      'Have a challenge? Talk to PASTI on WhatsApp or email, or send us a brief. We build technology and creative solutions for businesses ready to move forward.',
    image: '/images/og/contact.jpg'
  }
} satisfies Record<string, PageSeo>

/** Absolute URL on the production origin (no trailing slash on the base). */
export function useSiteUrl(path = '/') {
  const base = useRuntimeConfig().public.siteUrl.replace(/\/+$/, '')
  return base + (path.startsWith('/') ? path : `/${path}`)
}

/** Title, description, share card and canonical URL for the current page. */
export function usePageSeo(seo: PageSeo) {
  const route = useRoute()
  const url = useSiteUrl(route.path)
  const image = useSiteUrl(seo.image)

  useHead({ link: [{ rel: 'canonical', href: url }] })
  useSeoMeta({
    title: seo.title,
    description: seo.description,
    ogTitle: seo.title,
    ogDescription: seo.description,
    ogUrl: url,
    ogImage: image,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: seo.title,
    twitterCard: 'summary_large_image',
    twitterTitle: seo.title,
    twitterDescription: seo.description,
    twitterImage: image
  })
}

import type { InjectionKey } from 'vue'
import { isSafeLinkUrl } from '#shared/cms/fields'
import type { PerspectiveRef } from '#shared/utils/insightsSchema'
import {
  PublicInsightsResponseSchema,
  type InsightsArticleView,
  type InsightsPageContent,
  type PublicInsightsContent
} from '#shared/utils/insightsPublic'

// Public /insights content source. The page resolves content ONCE and the
// Insights sections read the same normalized shape via useInsightsPage().
//
//   legacy:  useInsights / useWhatsapp / pageSeo.insights → buildLegacyInsightsContent
//   cms:     GET /api/public/insights                     → adaptInsightsCms
//
// The CMS source is used only when the SERVER says so (runtime config flag,
// see server/api/public/insights.get.ts). Any failure, a disabled flag,
// nothing published or an unexpected response → legacy content.
// useInsights() itself stays untouched: the homepage Insights section reads it.

const STATE_KEY = 'insights-page-content'
const PREVIEW_KEY: InjectionKey<InsightsPageContent> = Symbol('insights-preview')
const pad = (n: number) => String(n).padStart(2, '0')

export function buildLegacyInsightsContent(): InsightsPageContent {
  const { articles } = useInsights()
  const { link: whatsappLink } = useWhatsapp()
  return {
    source: 'legacy',
    cmsVersion: null,
    hero: {
      eyebrow: 'The PASTI Journal',
      headline: 'Insights',
      lede: 'Perspectives on technology, creative, and business — from the work we do with our clients every day.',
      primaryCtaLabel: 'Read the issue',
      secondaryCta: { label: 'Tell us about it', href: whatsappLink }
    },
    contents: {
      sectionLabel: 'Contents',
      title: 'In this issue',
      topics: Array.from(new Set(articles.map((a) => a.page?.topic).filter(Boolean) as string[])),
      articles: articles.map((a) => ({ index: a.index, title: a.title, alt: a.title, image: a.image, page: a.page }))
    },
    seo: { ...pageSeo.insights }
  }
}

// PASTI perspective: the referenced sentence is read from the shared company
// content (the same sources the service / about pages use) — never stored in
// the CMS. Unknown refs resolve to nothing.
const refKey = (title: string) => title.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
export function resolvePerspective(ref: PerspectiveRef): { label: string; text: string; source: string } | null {
  const [kind, key] = ref.split(':') as [string, string]
  if (kind === 'company') {
    const company = useCompany()
    if (key === 'vision') return { label: 'Our vision', text: company.vision, source: 'useCompany().vision' }
    if (key === 'founder-quote') return { label: `${company.founder.name}, ${company.founder.role}`, text: company.founder.quote, source: 'useCompany().founder' }
    return null
  }
  const list = kind === 'technology' ? useTechnology().services : kind === 'creative' ? useCreative().services : []
  const svc = list.find((x) => refKey(x.title) === key)
  return svc ? { label: 'How PASTI approaches it', text: svc.body, source: `${kind} service: ${svc.title}` } : null
}

export function toInsightsArticleViews(list: PublicInsightsContent['contents']['articles']): InsightsArticleView[] {
  return list.map((a, i) => {
    const p = a.perspective ? resolvePerspective(a.perspective.sourceRef) : null
    return {
      index: pad(i + 1),
      title: a.title,
      alt: a.coverImageAlt,
      image: a.coverImage,
      page: {
        category: a.kicker,
        topic: a.topics[0] ?? '',
        topics: a.topics,
        headline: { ...a.headline },
        ...(a.tagline.text ? { tagline: { ...a.tagline } } : {}),
        description: a.excerpt,
        points: [...a.points],
        focus: a.coverFocus,
        ...(p && a.perspective
          ? { pasti: { ...p, links: a.perspective.links.filter((l) => isSafeLinkUrl(l.url)).map((l) => ({ label: l.label, to: l.url })) } }
          : {})
      }
    }
  })
}

// Maps the resolved, public-safe CMS content onto the normalized shape. An
// issue that resolves to no article keeps the legacy content (never blank).
export function adaptInsightsCms(legacy: InsightsPageContent, cms: { version: number; content: PublicInsightsContent }): InsightsPageContent {
  const c = cms.content
  if (!c.contents.articles.length) return legacy
  return {
    source: 'cms',
    cmsVersion: cms.version,
    hero: {
      eyebrow: c.hero.eyebrow,
      headline: c.hero.headline,
      lede: c.hero.lede,
      primaryCtaLabel: c.hero.primaryCtaLabel,
      secondaryCta: isSafeLinkUrl(c.hero.secondaryCtaUrl) ? { label: c.hero.secondaryCtaLabel, href: c.hero.secondaryCtaUrl } : legacy.hero.secondaryCta
    },
    contents: { sectionLabel: c.contents.sectionLabel, title: c.contents.title, topics: c.filters, articles: toInsightsArticleViews(c.contents.articles) },
    seo: {
      title: c.seo.metaTitle,
      description: c.seo.metaDescription,
      image: c.seo.ogImage || legacy.seo.image,
      ...(c.seo.canonicalUrl ? { canonical: c.seo.canonicalUrl } : {}),
      ...(c.seo.noIndex ? { noIndex: true } : {})
    }
  }
}

// Called once by pages/insights.vue.
export async function resolveInsightsPageContent() {
  const legacy = buildLegacyInsightsContent()
  const state = useState<InsightsPageContent>(STATE_KEY, () => legacy)

  const { data } = await useAsyncData('insights-cms-source', async () => {
    // SSR: skip the call entirely when the server-side flag is off.
    if (import.meta.server && !insightsCmsEnabledOnServer()) return { status: 'disabled' as const }
    try {
      const raw = await $fetch('/api/public/insights', { timeout: 2500 })
      const parsed = PublicInsightsResponseSchema.safeParse(raw)
      if (!parsed.success) {
        if (import.meta.server) console.error('[insights] CMS response failed validation — using legacy content')
        return { status: 'invalid' as const }
      }
      return parsed.data
    } catch (err) {
      if (import.meta.server) console.error('[insights] CMS source unavailable — using legacy content:', (err as Error).message)
      return { status: 'error' as const }
    }
  })

  state.value = data.value?.status === 'published' ? adaptInsightsCms(legacy, data.value) : legacy
  return state
}

function insightsCmsEnabledOnServer(): boolean {
  // Private runtime config — only readable during SSR, never in the bundle.
  const cms = useRuntimeConfig().cms as { insightsPublicEnabled?: unknown } | undefined
  return String(cms?.insightsPublicEnabled) === 'true'
}

export function provideInsightsPreview(content: InsightsPageContent) {
  provide(PREVIEW_KEY, content)
}

// Every Insights section reads content through this.
export function useInsightsPage(): InsightsPageContent {
  const preview = inject(PREVIEW_KEY, null)
  if (preview) return preview
  const state = useState<InsightsPageContent | undefined>(STATE_KEY)
  return state.value ?? buildLegacyInsightsContent()
}

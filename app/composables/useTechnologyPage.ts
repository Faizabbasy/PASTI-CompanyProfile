import type { InjectionKey } from 'vue'
import { TECHNOLOGY_PAGE_ID } from '~/i18n/content/technologyPage'
import { isSafeLinkUrl } from '#shared/cms/fields'
import { TECHNOLOGY_WORK_REFS } from '#shared/utils/technologySchema'
import {
  PublicTechnologyResponseSchema,
  type PublicTechnologyPublished,
  type TechnologyPageContent,
  type TechnologyWorkCard
} from '#shared/utils/technologyPublic'

// Public /technology content source. The page resolves content ONCE and the
// Technology sections read the same normalized shape via useTechnologyPage()
// — no section knows whether it came from code or from the CMS.
//
//   legacy:  useTechnology / useWhatsapp / pageSeo  → buildLegacyTechnologyContent
//   cms:     GET /api/public/pages/technology        → adaptTechnologyCms(legacy, …)
//
// The CMS source is used only when the SERVER says so (runtime config flag,
// see server/api/public/pages/technology.get.ts). Any failure, a disabled
// flag, no published snapshot or an unexpected response → legacy content.
// useTechnology() itself stays untouched (useInsights reads it).

const STATE_KEY = 'technology-page-content'
const PREVIEW_KEY: InjectionKey<TechnologyPageContent> = Symbol('technology-preview')

export function buildLegacyTechnologyContent(): TechnologyPageContent {
  const t = useTechnology()
  const { link: whatsappLink } = useWhatsapp()
  // "Technology built to move business forward." → the hero's three lines.
  const words = t.heading.replace(/\.$/, '').split(' ')
  // English base; Indonesian wording (incl. the three hero lines) overlaid on
  // Indonesian pages (app/i18n/content/technologyPage.ts).
  return localize<TechnologyPageContent>({
    source: 'legacy',
    cmsVersion: null,
    hero: {
      eyebrow: t.eyebrow,
      headlineLines: [words.slice(0, 2).join(' '), words.slice(2, 5).join(' '), words.slice(5).join(' ')],
      lede: t.introBody,
      primaryCta: { label: 'Start a project', href: whatsappLink },
      secondaryCtaLabel: 'Explore capabilities'
    },
    capabilities: {
      eyebrow: t.servicesEyebrow,
      title: t.servicesHeading,
      items: t.services.map((s) => ({
        key: s.index,
        index: s.index,
        title: s.title,
        body: s.body,
        keywords: [...s.keywords],
        related: s.related.map((r) => ({ ...r })),
        image: s.image,
        imageAlt: ''
      }))
    },
    work: { sectionLabel: 'Case studies', eyebrow: 'Proof of delivery', title: 'Technology case studies', cards: t.cases },
    seo: { ...localizedPageSeo('technology') }
  }, useLocale() === 'id' ? TECHNOLOGY_PAGE_ID : undefined)
}

// TEMPORARY reference layer (until a Work CMS exists): a ref names an
// existing record — `case:<featured case id>` or `work:<selected work
// index>` — and the card is built from that record exactly as useTechnology
// builds it. Unknown refs resolve to nothing.
export function resolveTechnologyWorkRef(ref: string): TechnologyWorkCard | null {
  if (!(TECHNOLOGY_WORK_REFS as readonly string[]).includes(ref)) return null
  const [kind, id] = ref.split(':') as ['case' | 'work', string]
  if (kind === 'case') {
    const c = useFeaturedCases().publicCases.find((x) => x.id === id)
    if (!c) return null
    const v = approvedVisuals(c)[0]
    return {
      kind: 'case',
      title: c.title,
      client: c.client,
      category: c.category,
      image: v?.src ?? '',
      imageKind: v?.kind === 'poster' ? 'poster' : 'screen',
      metrics: approvedMetrics(c).map((m) => ({ value: m.value, label: m.label })),
      to: `/work#case-${c.id}`
    }
  }
  const p = useSelectedWork().projects.find((x) => x.index === id)
  if (!p) return null
  return { kind: 'project', title: p.title, category: p.category, image: p.image, imageKind: 'poster', metrics: [], to: `/work#work-${p.index}` }
}

// The ref a legacy card corresponds to (used by the migration).
export function technologyWorkRefFor(card: TechnologyWorkCard): string {
  const m = /^\/work#(case|work)-(.+)$/.exec(card.to)
  return m ? `${m[1]}:${m[2]}` : ''
}

// Maps the published CMS content onto the normalized shape. Lists arrive
// active-only and in sortOrder from the server. Links are re-checked here
// (defense in depth); anything unusable keeps the legacy value.
export function adaptTechnologyCms(legacy: TechnologyPageContent, cms: Pick<PublicTechnologyPublished, 'version' | 'content'>): TechnologyPageContent {
  const c = cms.content
  const out: TechnologyPageContent = structuredClone(legacy)
  out.source = 'cms'
  out.cmsVersion = cms.version

  out.hero = {
    eyebrow: c.hero.eyebrow,
    headlineLines: [c.hero.headlineLine1, c.hero.headlineLine2, c.hero.headlineLine3],
    lede: c.hero.lede,
    primaryCta: isSafeLinkUrl(c.hero.primaryCtaUrl) ? { label: c.hero.primaryCtaLabel, href: c.hero.primaryCtaUrl } : legacy.hero.primaryCta,
    secondaryCtaLabel: c.hero.secondaryCtaLabel
  }

  if (c.capabilities.items.length) {
    out.capabilities = {
      eyebrow: c.capabilities.eyebrow,
      title: c.capabilities.title,
      items: c.capabilities.items.map((s, i) => ({
        key: s.id,
        index: String(i + 1).padStart(2, '0'),
        title: s.title,
        body: s.body,
        keywords: s.keywords,
        related: s.related.map((r) => (r.url && isSafeLinkUrl(r.url) ? { label: r.label, to: r.url } : { label: r.label })),
        image: s.image,
        imageAlt: s.imageAlt
      }))
    }
  }

  const cards = c.work.items.map((w) => resolveTechnologyWorkRef(w.ref)).filter((x): x is TechnologyWorkCard => !!x)
  out.work = { sectionLabel: c.work.sectionLabel, eyebrow: c.work.eyebrow, title: c.work.title, cards: cards.length ? cards : legacy.work.cards }

  out.seo = {
    title: c.seo.metaTitle,
    description: c.seo.metaDescription,
    image: c.seo.ogImage || legacy.seo.image,
    ...(c.seo.canonicalUrl ? { canonical: c.seo.canonicalUrl } : {}),
    ...(c.seo.noIndex ? { noIndex: true } : {})
  }
  return out
}

// Called once by pages/technology.vue.
export async function resolveTechnologyPageContent() {
  const legacy = buildLegacyTechnologyContent()
  const locale = useLocale()
  const state = useState<TechnologyPageContent>(`${STATE_KEY}-${locale}`, () => legacy)

  const { data } = await useAsyncData(`technology-cms-source-${locale}`, async () => {
    // SSR: skip the call entirely when the server-side flag is off.
    if (import.meta.server && !technologyCmsEnabledOnServer()) return { status: 'disabled' as const }
    try {
      const raw = await $fetch('/api/public/pages/technology', { query: { lang: locale }, timeout: 2500 })
      const parsed = PublicTechnologyResponseSchema.safeParse(raw)
      if (!parsed.success) {
        if (import.meta.server) console.error('[technology] CMS response failed validation — using legacy content')
        return { status: 'invalid' as const }
      }
      return parsed.data
    } catch (err) {
      if (import.meta.server) console.error('[technology] CMS source unavailable — using legacy content:', (err as Error).message)
      return { status: 'error' as const }
    }
  })

  state.value = data.value?.status === 'published' ? adaptTechnologyCms(legacy, data.value) : legacy
  return state
}

function technologyCmsEnabledOnServer(): boolean {
  // Private runtime config — only readable during SSR, never in the bundle.
  const cms = useRuntimeConfig().cms as { technologyPublicEnabled?: unknown } | undefined
  return String(cms?.technologyPublicEnabled) === 'true'
}

// Admin draft preview: renders the real Technology components with draft
// content provided to that subtree only (never written to public state).
export function provideTechnologyPreview(content: TechnologyPageContent) {
  provide(PREVIEW_KEY, content)
}

// Every Technology section reads content through this.
export function useTechnologyPage(): TechnologyPageContent {
  const preview = inject(PREVIEW_KEY, null)
  if (preview) return preview
  const state = useState<TechnologyPageContent | undefined>(`${STATE_KEY}-${useLocale()}`)
  return state.value ?? buildLegacyTechnologyContent()
}

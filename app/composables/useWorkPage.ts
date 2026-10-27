import type { InjectionKey } from 'vue'
import { WORK_PAGE_ID } from '~/i18n/content/workPage'
import { isSafeLinkUrl } from '#shared/cms/fields'
import type { CaseStudyContent } from '#shared/utils/caseStudySchema'
import type { ProjectContent } from '#shared/utils/projectSchema'
import {
  PublicWorkResponseSchema,
  projectAnchor,
  type PublicWorkContent,
  type WorkCaseView,
  type WorkPageContent,
  type WorkProjectCard,
  type WorkSourceRecord
} from '#shared/utils/workPublic'

// Public /work content source. The page resolves content ONCE and the Work
// sections read the same normalized shape via useWorkPage() — no section
// knows whether it came from code or from the CMS.
//
//   legacy:  useWorkPortfolio / useFeaturedCases / useWhatsapp / pageSeo → buildLegacyWorkContent
//   cms:     GET /api/public/work                                         → adaptWorkCms
//
// The CMS source is used only when the SERVER says so (runtime config flag,
// see server/api/public/work.get.ts). Any failure, a disabled flag, nothing
// published or an unexpected response → legacy content. The legacy
// composables stay untouched: useSelectedWork feeds the homepage, and
// useFeaturedCases feeds /technology.

const STATE_KEY = 'work-page-content'
const PREVIEW_KEY: InjectionKey<WorkPageContent> = Symbol('work-preview')
const pad = (n: number) => String(n).padStart(2, '0')

export function buildLegacyWorkContent(): WorkPageContent {
  const { projects, groups } = useWorkPortfolio()
  const { publicCases } = useFeaturedCases()
  const { link: whatsappLink } = useWhatsapp()
  // English base; Indonesian wording overlaid on Indonesian pages
  // (app/i18n/content/workPage.ts). Projects and cases arrive translated;
  // filter groups stay English keys (shown through t()).
  return localize<WorkPageContent>({
    source: 'legacy',
    cmsVersion: null,
    hero: {
      eyebrow: 'Work',
      headlineLines: ['Selected', 'work'],
      lede: 'A closer look at how we work with our clients — real projects, from the brief to the result that\'s running today.',
      primaryCtaLabel: 'Browse projects',
      secondaryCta: { label: 'Tell us about it', href: whatsappLink }
    },
    index: {
      sectionLabel: 'Index',
      projects: projects.map((p) => ({
        key: `work-${p.index}`,
        index: p.index,
        anchor: `work-${p.index}`,
        title: p.title,
        category: p.category,
        group: p.group,
        description: p.description,
        image: p.image,
        alt: p.title,
        ...(p.caseId ? { caseId: p.caseId } : {})
      })),
      groups
    },
    cases: {
      sectionLabel: 'Case studies',
      titleLead: 'Featured',
      titleAccent: 'case studies.',
      supportingCopy: 'Real challenges. Practical solutions. Meaningful outcomes.',
      items: publicCases.map((c) => ({
        id: c.id,
        index: c.index,
        title: c.title,
        client: c.client,
        category: c.category,
        year: c.year,
        businessContext: c.businessContext,
        challenge: c.challenge,
        solution: c.solution,
        request: c.request,
        outcome: c.outcome,
        insight: c.insight,
        timeline: c.timeline,
        technologyStack: c.technologyStack,
        metrics: approvedMetrics(c).map((m) => ({ value: m.value, label: m.label })),
        visuals: approvedVisuals(c).map((v) => ({ src: v.src, alt: v.alt, kind: v.kind }))
      }))
    },
    seo: { ...localizedPageSeo('work') }
  }, useLocale() === 'id' ? WORK_PAGE_ID : undefined)
}

const orUndef = <T>(list: T[]) => (list.length ? list : undefined)

// Resolved public CMS records → the shapes the Work components render.
// Numbering is positional; anchors stay stable (legacy #work-NN kept).
export function toWorkProjectCards(list: PublicWorkContent['projectIndex']['projects']): WorkProjectCard[] {
  return list.map((p, i) => ({
    key: p.anchor,
    index: pad(i + 1),
    anchor: p.anchor,
    title: p.title,
    category: p.category,
    group: p.group,
    description: p.description,
    image: p.image,
    alt: p.alt,
    ...(p.caseSlug ? { caseId: p.caseSlug } : {})
  }))
}

export function toWorkCaseViews(list: PublicWorkContent['featuredCases']['cases']): WorkCaseView[] {
  return list.map((k, i) => ({
    id: k.slug,
    index: pad(i + 1),
    title: k.title,
    client: k.client,
    category: k.category,
    year: k.year,
    businessContext: k.context || undefined,
    challenge: orUndef(k.challenge),
    ...(k.approach.mode === 'solution' ? { solution: orUndef(k.approach.points) } : { request: orUndef(k.approach.points) }),
    outcome: orUndef(k.outcome),
    insight: k.insight || undefined,
    timeline: k.timeline ?? undefined,
    technologyStack: orUndef(k.technologyLabels),
    metrics: k.metrics.map((m) => ({ value: m.value, label: m.label })),
    visuals: k.visuals
  }))
}

// Maps the resolved, public-safe CMS content onto the normalized shape. The
// server already dropped inactive selections, unpublished records and every
// non-confirmed claim / image. If either list comes back empty the whole page
// stays on legacy content (never a blank section, never mixed sources).
export function adaptWorkCms(legacy: WorkPageContent, cms: { version: number; content: PublicWorkContent }): WorkPageContent {
  const c = cms.content
  if (!c.projectIndex.projects.length || !c.featuredCases.cases.length) return legacy

  const projects = toWorkProjectCards(c.projectIndex.projects)
  const items = toWorkCaseViews(c.featuredCases.cases)

  return {
    source: 'cms',
    cmsVersion: cms.version,
    hero: {
      eyebrow: c.hero.eyebrow,
      headlineLines: [c.hero.headlineLine1, c.hero.headlineLine2],
      lede: c.hero.lede,
      primaryCtaLabel: c.hero.primaryCtaLabel,
      secondaryCta: isSafeLinkUrl(c.hero.secondaryCtaUrl) ? { label: c.hero.secondaryCtaLabel, href: c.hero.secondaryCtaUrl } : legacy.hero.secondaryCta
    },
    index: {
      sectionLabel: c.projectIndex.sectionLabel,
      projects,
      groups: ['All', ...Array.from(new Set(projects.map((p) => p.group)))]
    },
    cases: {
      sectionLabel: c.featuredCases.sectionLabel,
      titleLead: c.featuredCases.titleLead,
      titleAccent: c.featuredCases.titleAccent,
      supportingCopy: c.featuredCases.supportingCopy,
      items
    },
    seo: {
      title: c.seo.metaTitle,
      description: c.seo.metaDescription,
      image: c.seo.ogImage || legacy.seo.image,
      ...(c.seo.canonicalUrl ? { canonical: c.seo.canonicalUrl } : {}),
      ...(c.seo.noIndex ? { noIndex: true } : {})
    }
  }
}

// Called once by pages/work.vue.
export async function resolveWorkPageContent() {
  const nuxtApp = useNuxtApp()
  const legacy = buildLegacyWorkContent()
  const locale = useLocale()
  const state = useState<WorkPageContent>(`${STATE_KEY}-${locale}`, () => legacy)

  const { data } = await useAsyncData(`work-cms-source-${locale}`, async () => {
    // SSR: skip the call entirely when the server-side flag is off.
    if (import.meta.server && !workCmsEnabledOnServer()) return { status: 'disabled' as const }
    try {
      const raw = await $fetch('/api/public/work', { query: { lang: locale }, timeout: 2500 })
      const parsed = PublicWorkResponseSchema.safeParse(raw)
      if (!parsed.success) {
        if (import.meta.server) console.error('[work] CMS response failed validation — using legacy content')
        return { status: 'invalid' as const }
      }
      return parsed.data
    } catch (err) {
      if (import.meta.server) console.error('[work] CMS source unavailable — using legacy content:', (err as Error).message)
      return { status: 'error' as const }
    }
  })

  // The adapter can call composables (testimonials, perspectives, locale);
  // after the await above the Nuxt context is gone, so restore it.
  const published = data.value?.status === 'published' ? data.value : null
  state.value = published ? await nuxtApp.runWithContext(() => adaptWorkCms(legacy, published)) : legacy
  return state
}

function workCmsEnabledOnServer(): boolean {
  // Private runtime config — only readable during SSR, never in the bundle.
  const cms = useRuntimeConfig().cms as { workPublicEnabled?: unknown } | undefined
  return String(cms?.workPublicEnabled) === 'true'
}

// Admin draft preview: renders the real Work components with draft content
// provided to that subtree only (never written to public state).
// Admin previews ("klik teks untuk edit"): where each Work text is edited.
// Records: undefined = the Work page, `project:<anchor>`, `case:<slug>`. A
// case path starting `project.` is a field of the case's project (name,
// client, year come from it); the case category falls back to the project's.
export function provideWorkCmsMarks(lang: string, records: () => { projects: WorkSourceRecord<ProjectContent>[]; cases: WorkSourceRecord<CaseStudyContent>[] }) {
  provideCmsMarks({
    href: (record, path) => {
      if (!record) return cmsFieldHref('/admin/work', lang, path)
      const { projects, cases } = records()
      const projectHref = (id: string, p: string) => cmsFieldHref(`/admin/work/projects/${id}`, lang, p)
      if (record.startsWith('project:')) {
        const p = projects.find((x) => projectAnchor(x) === record.slice('project:'.length))
        return p ? projectHref(p.id, path) : null
      }
      const c = cases.find((x) => x.content.slug === record.slice('case:'.length))
      if (!c) return null
      if (path.startsWith('project.')) return projectHref(c.content.projectId, path.slice('project.'.length))
      if (path === 'categoryOverride' && !c.content.categoryOverride) return projectHref(c.content.projectId, 'category')
      return cmsFieldHref(`/admin/work/case-studies/${c.id}`, lang, path)
    }
  })
}

export function provideWorkPreview(content: WorkPageContent) {
  provide(PREVIEW_KEY, content)
}

// Every Work section reads content through this.
export function useWorkPage(): WorkPageContent {
  const preview = inject(PREVIEW_KEY, null)
  if (preview) return preview
  const state = useState<WorkPageContent | undefined>(`${STATE_KEY}-${useLocale()}`)
  return state.value ?? buildLegacyWorkContent()
}

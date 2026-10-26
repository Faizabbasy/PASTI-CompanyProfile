import { z } from 'zod'
import type { CaseStudyContent } from '#shared/utils/caseStudySchema'
import type { ProjectContent } from '#shared/utils/projectSchema'
import type { WorkContent } from '#shared/utils/workSchema'

// Public Work contract.
//
// 1. `resolveWorkView` — pure join of the Work page selections with Project
//    and Case Study contents. The public API runs it on PUBLISHED snapshots;
//    the admin preview runs it on drafts. Both apply the same public filter:
//    active selections only, metrics/media only when confirmed + active,
//    internal source notes and ids of workflow state never included.
// 2. `PublicWorkResponse` — what GET /api/public/work returns.
// 3. `WorkPageContent` — the one normalized shape the /work components
//    render, whichever source (legacy code or CMS) produced it.

export interface WorkProjectCard {
  key: string
  index: string
  // DOM id / deep link target, e.g. 'work-01' (legacy) or 'work-<slug>'.
  anchor: string
  title: string
  category: string
  group: string
  description: string
  image: string
  alt: string
  // Featured case on this page that the card opens, if any.
  caseId?: string
}

export interface WorkCaseView {
  id: string
  index: string
  title: string
  client?: string
  category: string
  year?: string
  businessContext?: string
  challenge?: string[]
  solution?: string[]
  request?: string[]
  outcome?: string[]
  insight?: string
  timeline?: { steps: { label: string; weeks: number }[]; total: string }
  technologyStack?: string[]
  // Already filtered to public-approved items.
  metrics: { value: string; label: string }[]
  visuals: { src: string; alt: string; kind: 'poster' | 'screen' | 'dashboard' }[]
}

export interface WorkPageContent {
  source: 'legacy' | 'cms'
  cmsVersion: number | null
  hero: {
    eyebrow: string
    headlineLines: [string, string]
    lede: string
    primaryCtaLabel: string
    secondaryCta: { label: string; href: string }
  }
  index: { sectionLabel: string; projects: WorkProjectCard[]; groups: string[] }
  cases: { sectionLabel: string; titleLead: string; titleAccent: string; supportingCopy: string; items: WorkCaseView[] }
  seo: { title: string; description: string; image: string; canonical?: string; noIndex?: boolean }
}

// ---- resolver -------------------------------------------------------------

export interface WorkSourceRecord<C> {
  id: string
  meta: Record<string, string>
  content: C
}

export function projectAnchor(p: WorkSourceRecord<ProjectContent>): string {
  return p.meta.legacyAnchor ? `work-${p.meta.legacyAnchor}` : `work-${p.content.slug}`
}

const s = z.string()
const PublicProjectSchema = z.object({ anchor: s, title: s, category: s, group: s, description: s, image: s, alt: s, caseSlug: s.optional() })
const PublicCaseSchema = z.object({
  slug: s,
  title: s,
  client: s.optional(),
  category: s,
  year: s.optional(),
  context: s,
  challenge: z.array(s),
  approach: z.object({ mode: z.enum(['solution', 'request']), points: z.array(s) }),
  outcome: z.array(s),
  insight: s,
  timeline: z.object({ total: s, steps: z.array(z.object({ label: s, weeks: z.number() })) }).nullable(),
  technologyLabels: z.array(s),
  metrics: z.array(z.object({ value: s, label: s, context: s.optional() })),
  visuals: z.array(z.object({ src: s, alt: s, kind: z.enum(['poster', 'screen', 'dashboard']) }))
})
const PublicWorkContentSchema = z.object({
  hero: z.object({
    eyebrow: s,
    headlineLine1: s.min(1),
    headlineLine2: s.min(1),
    lede: s,
    primaryCtaLabel: s,
    secondaryCtaLabel: s,
    secondaryCtaUrl: s
  }),
  projectIndex: z.object({ sectionLabel: s, projects: z.array(PublicProjectSchema) }),
  featuredCases: z.object({ sectionLabel: s, titleLead: s, titleAccent: s, supportingCopy: s, cases: z.array(PublicCaseSchema) }),
  seo: z.object({ metaTitle: s, metaDescription: s, ogImage: s, canonicalUrl: s, noIndex: z.boolean() })
})
export type PublicWorkContent = z.infer<typeof PublicWorkContentSchema>

const sorted = <T extends { sortOrder: number }>(list: T[]) => [...list].sort((a, b) => a.sortOrder - b.sortOrder)

export function resolveWorkView(
  work: WorkContent,
  projects: WorkSourceRecord<ProjectContent>[],
  cases: WorkSourceRecord<CaseStudyContent>[]
): PublicWorkContent & { counts: { claimsWithheld: number; mediaWithheld: number; missingRefs: number } } {
  const projectById = new Map(projects.map((p) => [p.id, p]))
  const caseById = new Map(cases.map((c) => [c.id, c]))
  let missingRefs = 0
  let claimsWithheld = 0
  let mediaWithheld = 0

  // A case renders only with its project available (identity comes from it).
  const featured = sorted(work.featuredCases.items.filter((i) => i.active))
    .map((i) => {
      const c = caseById.get(i.caseStudyId)
      const p = c ? projectById.get(c.content.projectId) : undefined
      if (!c || !p) missingRefs++
      return c && p ? { c, p } : null
    })
    .filter((x): x is NonNullable<typeof x> => !!x)

  const caseSlugByProject = new Map(featured.map(({ c, p }) => [p.id, c.content.slug]))

  const indexProjects = sorted(work.projectIndex.items.filter((i) => i.active))
    .map((i) => {
      const p = projectById.get(i.projectId)
      if (!p) {
        missingRefs++
        return null
      }
      const caseSlug = caseSlugByProject.get(p.id)
      return {
        anchor: projectAnchor(p),
        title: p.content.name,
        category: p.content.category,
        group: p.content.filterGroup,
        description: p.content.shortDescription,
        image: p.content.poster,
        alt: p.content.posterAlt,
        ...(caseSlug ? { caseSlug } : {})
      }
    })
    .filter((x): x is NonNullable<typeof x> => !!x)

  const resolvedCases = featured.map(({ c, p }) => {
    const cc = c.content
    const metrics = sorted(cc.metrics).filter((m) => {
      const ok = m.active && m.claimStatus === 'confirmed'
      if (m.active && !ok) claimsWithheld++
      return ok
    })
    const visuals = sorted(cc.gallery).filter((g) => {
      const ok = g.active && g.approvalStatus === 'confirmed'
      if (g.active && !ok) mediaWithheld++
      return ok
    })
    return {
      slug: cc.slug,
      title: p.content.name,
      ...(p.content.clientDisplayName ? { client: p.content.clientDisplayName } : {}),
      category: cc.categoryOverride || p.content.category,
      ...(p.content.year ? { year: p.content.year } : {}),
      context: cc.context.body,
      challenge: [...cc.challenge.points],
      approach: { mode: cc.approach.mode, points: [...cc.approach.points] },
      outcome: [...cc.outcome.points],
      insight: cc.insight,
      timeline: cc.timeline.total && cc.timeline.steps.length ? { total: cc.timeline.total, steps: cc.timeline.steps.map((t) => ({ ...t })) } : null,
      technologyLabels: [...cc.technologyLabels],
      metrics: metrics.map((m) => ({ value: m.value, label: m.label, ...(m.context ? { context: m.context } : {}) })),
      visuals: visuals.map((g) => ({ src: g.src, alt: g.alt, kind: g.kind }))
    }
  })

  return {
    hero: { ...work.hero },
    projectIndex: { sectionLabel: work.projectIndex.sectionLabel, projects: indexProjects },
    featuredCases: {
      sectionLabel: work.featuredCases.sectionLabel,
      titleLead: work.featuredCases.titleLead,
      titleAccent: work.featuredCases.titleAccent,
      supportingCopy: work.featuredCases.supportingCopy,
      cases: resolvedCases
    },
    seo: { ...work.seo },
    counts: { claimsWithheld, mediaWithheld, missingRefs }
  }
}

// ---- response -------------------------------------------------------------

// A response that doesn't match falls back to legacy content (useWorkPage).
const ResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('disabled') }),
  z.object({ status: z.literal('unpublished') }),
  z.object({ status: z.literal('published'), version: z.number().int(), publishedAt: s, content: PublicWorkContentSchema })
])
export const PublicWorkResponseSchema = ResponseSchema
export type PublicWorkResponse = z.infer<typeof ResponseSchema>
export type PublicWorkPublished = Extract<PublicWorkResponse, { status: 'published' }>

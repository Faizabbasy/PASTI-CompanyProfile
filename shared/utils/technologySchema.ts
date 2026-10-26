import { z } from 'zod'
import {
  linkUrl,
  maxActive,
  mediaRef,
  SeoSchema,
  itemId,
  sortOrder,
  text,
  type SingletonAdminState,
  type WithId
} from '#shared/cms/fields'

// Technology page CMS content model. Maps the CURRENT /technology sections
// that carry page-specific copy: Hero, Capabilities, Case studies, SEO.
// Marquee (derived from capability titles), Platforms (locked copy, shared
// with Home), Why PASTI (company data, useCompany) and the UI microcopy stay
// code-managed. Plain text only — layout, order of sections, typography,
// colour and motion are owned by the code.

// Design-safe limits from the copy stress test on the real Technology
// components at 390/820/1366/1920px. Values above these were schema-valid but
// broke the layout: a headline line wrapping to two lines (mobile + wide), a
// two-line hero marker on mobile, a two-line case-studies title pushing the
// pinned 100svh stage's heading off-screen on desktop, an over-tall hero lede.
export const TECHNOLOGY_LIMITS = {
  heroEyebrow: 20,
  eyebrow: 24,
  // Each hero line is one masked line of the display headline; line 3 sits
  // on the yellow marker and gets the yellow period from code.
  headlineLine: 18,
  lede: 200,
  ctaLabel: 24,
  sectionTitle: 28,
  capabilityTitle: 44,
  capabilityBody: 260,
  keyword: 28,
  keywords: 6,
  relatedLabel: 40,
  related: 4,
  capabilitiesActive: 8,
  workActive: 10
} as const

// TEMPORARY reference layer until a Work CMS exists: the case studies rail
// may only show (and reorder/hide) the projects it shows today. Each ref is
// resolved at render time from the existing project data (useFeaturedCases /
// useSelectedWork) — no project content is copied into the Technology CMS.
// Excluded on purpose: work:03/04 duplicate the PowerHours/HDI cases, and
// work:05 (Pertamina) awaits owner confirmation.
export const TECHNOLOGY_WORK_REFS = ['case:textile', 'case:at-wf', 'case:powerhours', 'case:hdi', 'work:01', 'work:02', 'work:06'] as const
export type TechnologyWorkRef = (typeof TECHNOLOGY_WORK_REFS)[number]

const HeroSchema = z
  .object({
    eyebrow: text(TECHNOLOGY_LIMITS.heroEyebrow, { required: true }),
    headlineLine1: text(TECHNOLOGY_LIMITS.headlineLine, { required: true }),
    headlineLine2: text(TECHNOLOGY_LIMITS.headlineLine, { required: true }),
    headlineLine3: text(TECHNOLOGY_LIMITS.headlineLine, { required: true }).refine((v) => !/[.!?]$/.test(v), 'Leave out the final period — the design adds it.'),
    lede: text(TECHNOLOGY_LIMITS.lede, { required: true }),
    primaryCtaLabel: text(TECHNOLOGY_LIMITS.ctaLabel, { required: true }),
    primaryCtaUrl: linkUrl.refine((v) => v !== '', 'Required.'),
    // The secondary button scrolls to Capabilities (code-managed action).
    secondaryCtaLabel: text(TECHNOLOGY_LIMITS.ctaLabel, { required: true })
  })
  .strict()

const RelatedSchema = z
  .object({
    label: text(TECHNOLOGY_LIMITS.relatedLabel, { required: true }),
    // Empty = plain label without a link.
    url: linkUrl
  })
  .strict()

const CapabilitySchema = z
  .object({
    id: itemId,
    title: text(TECHNOLOGY_LIMITS.capabilityTitle, { required: true }),
    body: text(TECHNOLOGY_LIMITS.capabilityBody, { required: true }),
    keywords: z.array(text(TECHNOLOGY_LIMITS.keyword, { required: true })).max(TECHNOLOGY_LIMITS.keywords, `Max ${TECHNOLOGY_LIMITS.keywords} keywords.`),
    related: z.array(RelatedSchema).max(TECHNOLOGY_LIMITS.related, `Max ${TECHNOLOGY_LIMITS.related} related links.`),
    image: mediaRef.refine((v) => v !== '', 'Required.'),
    // Optional: the public image is decorative (the title sits next to it).
    imageAlt: text(160),
    sortOrder,
    active: z.boolean()
  })
  .strict()

const WorkItemSchema = z
  .object({
    id: itemId,
    ref: z.enum(TECHNOLOGY_WORK_REFS, { message: 'Pick one of the existing projects.' }),
    sortOrder,
    active: z.boolean()
  })
  .strict()

function atLeastOneActive(label: string) {
  return (list: { active: boolean }[], ctx: z.RefinementCtx) => {
    if (!list.some((i) => i.active)) ctx.addIssue({ code: 'custom', message: `Keep at least one active ${label}.` })
  }
}

function unique<T>(key: (i: T) => string, label: string) {
  return (list: T[], ctx: z.RefinementCtx) => {
    const seen = new Set<string>()
    list.forEach((item, i) => {
      const k = key(item).toLowerCase()
      if (seen.has(k)) ctx.addIssue({ code: 'custom', path: [i], message: `Duplicate ${label}.` })
      seen.add(k)
    })
  }
}

export const TechnologyContentSchema = z
  .object({
    hero: HeroSchema,
    capabilities: z
      .object({
        eyebrow: text(TECHNOLOGY_LIMITS.eyebrow, { required: true }),
        title: text(TECHNOLOGY_LIMITS.sectionTitle, { required: true }),
        items: z
          .array(CapabilitySchema)
          .max(12, 'Max 12 capabilities.')
          .superRefine(maxActive(TECHNOLOGY_LIMITS.capabilitiesActive, 'capabilities'))
          .superRefine(atLeastOneActive('capability'))
          .superRefine(unique((i: { title: string }) => i.title, 'capability title'))
      })
      .strict(),
    work: z
      .object({
        sectionLabel: text(TECHNOLOGY_LIMITS.eyebrow, { required: true }),
        eyebrow: text(TECHNOLOGY_LIMITS.eyebrow, { required: true }),
        title: text(TECHNOLOGY_LIMITS.sectionTitle, { required: true }),
        items: z
          .array(WorkItemSchema)
          .max(TECHNOLOGY_WORK_REFS.length, `Max ${TECHNOLOGY_WORK_REFS.length} projects.`)
          .superRefine(maxActive(TECHNOLOGY_LIMITS.workActive, 'projects'))
          .superRefine(atLeastOneActive('project'))
          .superRefine(unique((i: { ref: string }) => i.ref, 'project'))
      })
      .strict(),
    seo: SeoSchema
  })
  .strict()

export type TechnologyContentInput = z.infer<typeof TechnologyContentSchema>

type CapabilityInput = TechnologyContentInput['capabilities']['items'][number]
type WorkItemInput = TechnologyContentInput['work']['items'][number]
export interface TechnologyContent extends Omit<TechnologyContentInput, 'capabilities' | 'work'> {
  capabilities: Omit<TechnologyContentInput['capabilities'], 'items'> & { items: WithId<CapabilityInput>[] }
  work: Omit<TechnologyContentInput['work'], 'items'> & { items: WithId<WorkItemInput>[] }
}

export type TechnologySectionKey = keyof TechnologyContent
export type TechnologyAdminState = SingletonAdminState<'technology', TechnologyContent>

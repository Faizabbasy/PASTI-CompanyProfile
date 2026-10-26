import { z } from 'zod'
import {
  itemId,
  linkUrl,
  maxActive,
  mediaRef,
  SeoSchema,
  sortOrder,
  text,
  type SingletonAdminState,
  type WithId
} from '#shared/cms/fields'

// Creative page CMS content model. Owner rule: content that exists only on
// /creative is fully editable (hero, services, studio wall, the OCTO feature
// case, section titles); content shared with other pages — project records,
// testimonials, company standards/milestones — is only PICKED here by
// reference and resolved at render time, never copied. The Tapes marquee is
// derived from the service titles; interaction microcopy, case sub-headings
// and badges stay in code. Plain text only — design is owned by the code.

// Design-safe limits from the copy stress test on the real Creative
// components at 390/820/1366/1920px. Values above these were schema-valid
// but broke the layout: a 3-line hero headline (mobile + wide), a 3-line
// sticky Services title on desktop, a 3-line Studio Wall title on mobile,
// a wrapping UI/UX heading and two-line funnel stage names.
export const CREATIVE_LIMITS = {
  heroEyebrow: 20,
  markerMeta: 24,
  headlineLine: 18,
  lede: 200,
  ctaLabel: 24,
  label: 24,
  sectionTitle: 28,
  servicesTitle: 24,
  wallLead: 16,
  serviceTitle: 40,
  serviceBody: 260,
  keyword: 28,
  keywords: 6,
  relatedLabel: 40,
  related: 4,
  servicesActive: 8,
  wallAccent: 12,
  visualLabel: 40,
  visualsMin: 3,
  visualsActive: 16,
  caseTitle: 44,
  caseCategory: 40,
  challengeItem: 200,
  challenge: 5,
  gamePlan: 240,
  funnelStage: 14,
  funnelText: 120,
  playbookItem: 160,
  playbook: 6,
  uiuxTitle: 32,
  uiux: 4
} as const

// TEMPORARY reference layer until the Work / Testimonial / Company CMS
// exist. Each ref names an existing record and is resolved at render time
// (useSelectedWork / useTestimonials / useCompany); the migration script
// asserts every value still resolves.
export const CREATIVE_WORK_REFS = ['work:01', 'work:02', 'work:03', 'work:04', 'work:05', 'work:06'] as const
export const CREATIVE_TESTIMONIAL_REFS = ['t:rizki-aprianto', 't:yodi-izharivan', 't:banu-wimbadi', 't:calvin-kim'] as const
export const COMPANY_STANDARD_REFS = ['innovation', 'security', 'efficiency', 'integrity'] as const
export const COMPANY_MILESTONE_REFS = ['2020', '2021', '2022', '2023', 'since-2024'] as const
export const WHY_STATEMENT_SOURCES = ['mission', 'vision'] as const

const workRef = z.enum(CREATIVE_WORK_REFS, { message: 'Pick one of the existing projects.' })

function atLeastOneActive(label: string) {
  return (list: { active: boolean }[], ctx: z.RefinementCtx) => {
    if (!list.some((i) => i.active)) ctx.addIssue({ code: 'custom', message: `Keep at least one active ${label}.` })
  }
}

function minActive(min: number, label: string) {
  return (list: { active: boolean }[], ctx: z.RefinementCtx) => {
    if (list.filter((i) => i.active).length < min) ctx.addIssue({ code: 'custom', message: `Keep at least ${min} active ${label} — the design needs them.` })
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

const noFinalPeriod = (v: string) => !/[.!?]$/.test(v)
const PERIOD_MSG = 'Leave out the final period — the design adds it.'

const HeroSchema = z
  .object({
    eyebrow: text(CREATIVE_LIMITS.heroEyebrow, { required: true }),
    markerMeta: text(CREATIVE_LIMITS.markerMeta),
    headlineLine1: text(CREATIVE_LIMITS.headlineLine, { required: true }),
    // The last word of line 2 is outlined and followed by the period (code).
    headlineLine2: text(CREATIVE_LIMITS.headlineLine, { required: true }).refine(noFinalPeriod, PERIOD_MSG),
    lede: text(CREATIVE_LIMITS.lede, { required: true }),
    primaryCtaLabel: text(CREATIVE_LIMITS.ctaLabel, { required: true }),
    primaryCtaUrl: linkUrl.refine((v) => v !== '', 'Required.'),
    // The secondary button scrolls to Services (code-managed action).
    secondaryCtaLabel: text(CREATIVE_LIMITS.ctaLabel, { required: true })
  })
  .strict()

const ServiceSchema = z
  .object({
    id: itemId,
    title: text(CREATIVE_LIMITS.serviceTitle, { required: true }),
    body: text(CREATIVE_LIMITS.serviceBody, { required: true }),
    keywords: z.array(text(CREATIVE_LIMITS.keyword, { required: true })).max(CREATIVE_LIMITS.keywords, `Max ${CREATIVE_LIMITS.keywords} keywords.`),
    related: z
      .array(z.object({ label: text(CREATIVE_LIMITS.relatedLabel, { required: true }), url: linkUrl }).strict())
      .max(CREATIVE_LIMITS.related, `Max ${CREATIVE_LIMITS.related} related links.`),
    // Owner visual, shown whole at its own ratio (title + logo baked in).
    image: mediaRef.refine((v) => v !== '', 'Required.'),
    imageWidth: z.number().int().min(200, 'Min 200.').max(6000, 'Max 6000.'),
    imageHeight: z.number().int().min(200, 'Min 200.').max(6000, 'Max 6000.'),
    // Empty = "<title> — PASTI".
    imageAlt: text(160),
    sortOrder,
    active: z.boolean()
  })
  .strict()

const VisualSchema = z
  .object({
    id: itemId,
    image: mediaRef.refine((v) => v !== '', 'Required.'),
    label: text(CREATIVE_LIMITS.visualLabel, { required: true }),
    sortOrder,
    active: z.boolean()
  })
  .strict()

const UiuxItemSchema = z.object({ id: itemId, ref: workRef, sortOrder, active: z.boolean() }).strict()

const FeatureSchema = z
  .object({
    title: text(CREATIVE_LIMITS.caseTitle, { required: true }),
    category: text(CREATIVE_LIMITS.caseCategory, { required: true }),
    // Image comes from the referenced project record.
    imageRef: workRef,
    challenge: z.array(text(CREATIVE_LIMITS.challengeItem, { required: true })).min(1, 'Add at least one point.').max(CREATIVE_LIMITS.challenge, `Max ${CREATIVE_LIMITS.challenge} points.`),
    gamePlan: text(CREATIVE_LIMITS.gamePlan, { required: true }),
    // The funnel is a 4-column row: exactly four stages.
    funnel: z
      .array(z.object({ stage: text(CREATIVE_LIMITS.funnelStage, { required: true }), text: text(CREATIVE_LIMITS.funnelText, { required: true }) }).strict())
      .length(4, 'The funnel has exactly 4 stages.')
      .superRefine(unique((s: { stage: string }) => s.stage, 'stage')),
    playbook: z.array(text(CREATIVE_LIMITS.playbookItem, { required: true })).min(1, 'Add at least one point.').max(CREATIVE_LIMITS.playbook, `Max ${CREATIVE_LIMITS.playbook} points.`)
  })
  .strict()

export const CreativeContentSchema = z
  .object({
    hero: HeroSchema,
    services: z
      .object({
        sectionLabel: text(CREATIVE_LIMITS.label, { required: true }),
        eyebrow: text(CREATIVE_LIMITS.label, { required: true }),
        title: text(CREATIVE_LIMITS.servicesTitle, { required: true }).refine(noFinalPeriod, PERIOD_MSG),
        items: z
          .array(ServiceSchema)
          .max(12, 'Max 12 services.')
          .superRefine(maxActive(CREATIVE_LIMITS.servicesActive, 'services'))
          .superRefine(atLeastOneActive('service'))
          .superRefine(unique((i: { title: string }) => i.title, 'service title'))
      })
      .strict(),
    wall: z
      .object({
        sectionLabel: text(CREATIVE_LIMITS.label, { required: true }),
        titleLead: text(CREATIVE_LIMITS.wallLead, { required: true }),
        // Shown in yellow, followed by the period (code).
        titleAccent: text(CREATIVE_LIMITS.wallAccent, { required: true }).refine(noFinalPeriod, PERIOD_MSG),
        visuals: z
          .array(VisualSchema)
          .max(24, 'Max 24 visuals.')
          .superRefine(maxActive(CREATIVE_LIMITS.visualsActive, 'visuals'))
          .superRefine(minActive(CREATIVE_LIMITS.visualsMin, 'visuals'))
      })
      .strict(),
    work: z
      .object({
        sectionLabel: text(CREATIVE_LIMITS.label, { required: true }),
        sectionMeta: text(CREATIVE_LIMITS.label),
        eyebrow: text(CREATIVE_LIMITS.label, { required: true }),
        title: text(CREATIVE_LIMITS.sectionTitle, { required: true }).refine(noFinalPeriod, PERIOD_MSG),
        feature: FeatureSchema,
        campaignRef: workRef,
        testimonialRef: z.enum(CREATIVE_TESTIMONIAL_REFS, { message: 'Pick one of the verified testimonials.' }),
        uiux: z
          .object({
            title: text(CREATIVE_LIMITS.uiuxTitle, { required: true }),
            label: text(CREATIVE_LIMITS.uiuxTitle),
            items: z
              .array(UiuxItemSchema)
              .max(CREATIVE_WORK_REFS.length, `Max ${CREATIVE_WORK_REFS.length} projects.`)
              .superRefine(maxActive(CREATIVE_LIMITS.uiux, 'projects'))
              .superRefine(atLeastOneActive('project'))
              .superRefine(unique((i: { ref: string }) => i.ref, 'project'))
          })
          .strict()
      })
      .strict(),
    why: z
      .object({
        leadLabel: text(CREATIVE_LIMITS.label, { required: true }),
        statementSource: z.enum(WHY_STATEMENT_SOURCES),
        standardRefs: z
          .array(z.enum(COMPANY_STANDARD_REFS, { message: 'Pick one of the company standards.' }))
          .min(1, 'Pick at least one standard.')
          .max(4, 'Max 4 standards.')
          .superRefine(unique((s: string) => s, 'standard')),
        // The milestone row is laid out for 3 or 4 entries.
        milestoneRefs: z
          .array(z.enum(COMPANY_MILESTONE_REFS, { message: 'Pick one of the company milestones.' }))
          .min(3, 'Pick 3 or 4 milestones.')
          .max(4, 'Pick 3 or 4 milestones.')
          .superRefine(unique((s: string) => s, 'milestone'))
      })
      .strict(),
    seo: SeoSchema
  })
  .strict()

export type CreativeContentInput = z.infer<typeof CreativeContentSchema>

type ServiceInput = CreativeContentInput['services']['items'][number]
type VisualInput = CreativeContentInput['wall']['visuals'][number]
type UiuxInput = CreativeContentInput['work']['uiux']['items'][number]
export interface CreativeContent extends Omit<CreativeContentInput, 'services' | 'wall' | 'work'> {
  services: Omit<CreativeContentInput['services'], 'items'> & { items: WithId<ServiceInput>[] }
  wall: Omit<CreativeContentInput['wall'], 'visuals'> & { visuals: WithId<VisualInput>[] }
  work: Omit<CreativeContentInput['work'], 'uiux'> & { uiux: Omit<CreativeContentInput['work']['uiux'], 'items'> & { items: WithId<UiuxInput>[] } }
}

export type CreativeAdminState = SingletonAdminState<'creative', CreativeContent>

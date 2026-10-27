import { z } from 'zod'
import {
  CLAIM_STATUSES,
  itemId,
  maxActive,
  mediaRef,
  recordRef,
  slug,
  sortOrder,
  text,
  type ActorRef,
  type RecordLangStates,
  type PageSource,
  type PageStatus,
  type WithId
} from '#shared/cms/fields'

// Work CMS — Case Study record (collection). Always linked to one Project
// (projectId); project identity (name, client, year, poster) is read from
// that Project at render time and never copied here. Maps the chapters the
// current /work case dossier renders: context, challenge, what we built /
// what was requested, outcome (+ metrics), insight, delivery timeline,
// technology stack, gallery. Chapter labels stay code-managed microcopy.
//
// Two separate concepts:
//   record status (draft / published / archived) — the whole case
//   claim status  (confirmed / needs_approval / hidden) — per metric and per
//                 gallery item. Only `confirmed` + active ever renders
//                 publicly; publishing the case never approves a claim.

export const CASE_LIMITS = {
  category: 60,
  context: 600,
  point: 240,
  points: 8,
  insight: 400,
  timelineTotal: 24,
  stepLabel: 40,
  steps: 6,
  techLabel: 40,
  techLabels: 10,
  metricValue: 12,
  metricLabel: 80,
  metricContext: 160,
  sourceNote: 300,
  metrics: 6,
  metricsActive: 4,
  alt: 200,
  gallery: 8
} as const

const claimStatus = z.enum(CLAIM_STATUSES, { message: 'Pick a claim status.' })
const points = (max: number) => z.array(text(CASE_LIMITS.point, { required: true })).max(max, `Max ${max} points.`)

const MetricSchema = z
  .object({
    id: itemId,
    value: text(CASE_LIMITS.metricValue, { required: true }),
    label: text(CASE_LIMITS.metricLabel, { required: true }),
    context: text(CASE_LIMITS.metricContext),
    // Internal only — never public.
    sourceNote: text(CASE_LIMITS.sourceNote),
    claimStatus,
    active: z.boolean(),
    sortOrder
  })
  .strict()

const GalleryItemSchema = z
  .object({
    id: itemId,
    src: mediaRef.refine((v) => v !== '', 'Required.'),
    alt: text(CASE_LIMITS.alt, { required: true }),
    // poster = full-bleed photo; screen / dashboard = floating UI sheet.
    kind: z.enum(['poster', 'screen', 'dashboard']),
    sourceNote: text(CASE_LIMITS.sourceNote),
    // Client-sensitive screenshots need the same approval as claims.
    approvalStatus: claimStatus,
    active: z.boolean(),
    sortOrder
  })
  .strict()

const TimelineStepSchema = z
  .object({
    label: text(CASE_LIMITS.stepLabel, { required: true }),
    weeks: z.number().int().min(1, 'Min 1 week.').max(104, 'Max 104 weeks.')
  })
  .strict()

const CaseStudyContentObject = z
  .object({
    projectId: recordRef,
    // Deep link on /work: #case-<slug>.
    slug,
    // Empty = the project's category.
    categoryOverride: text(CASE_LIMITS.category),
    context: z.object({ body: text(CASE_LIMITS.context) }).strict(),
    challenge: z.object({ points: points(6) }).strict(),
    approach: z
      .object({
        // Chapter label in code: "What we built" (solution) / "What was requested" (request).
        mode: z.enum(['solution', 'request']),
        points: points(CASE_LIMITS.points)
      })
      .strict(),
    outcome: z.object({ points: points(6) }).strict(),
    insight: text(CASE_LIMITS.insight),
    timeline: z
      .object({
        total: text(CASE_LIMITS.timelineTotal),
        steps: z.array(TimelineStepSchema).max(CASE_LIMITS.steps, `Max ${CASE_LIMITS.steps} steps.`)
      })
      .strict()
      .superRefine((t, ctx) => {
        if (t.total && !t.steps.length) ctx.addIssue({ code: 'custom', path: ['steps'], message: 'Add at least one step, or clear the total.' })
        if (!t.total && t.steps.length) ctx.addIssue({ code: 'custom', path: ['total'], message: 'Add the total duration (e.g. ~3.5 months).' })
      }),
    technologyLabels: z.array(text(CASE_LIMITS.techLabel, { required: true })).max(CASE_LIMITS.techLabels, `Max ${CASE_LIMITS.techLabels} labels.`),
    metrics: z
      .array(MetricSchema)
      .max(CASE_LIMITS.metrics, `Max ${CASE_LIMITS.metrics} metrics.`)
      .superRefine(maxActive(CASE_LIMITS.metricsActive, 'metrics')),
    gallery: z.array(GalleryItemSchema).max(CASE_LIMITS.gallery, `Max ${CASE_LIMITS.gallery} images.`)
  })
  .strict()

export const CaseStudyContentSchema = CaseStudyContentObject

export type CaseStudyContentInput = z.infer<typeof CaseStudyContentObject>
type MetricInput = CaseStudyContentInput['metrics'][number]
type GalleryInput = CaseStudyContentInput['gallery'][number]
export interface CaseStudyContent extends Omit<CaseStudyContentInput, 'metrics' | 'gallery'> {
  metrics: WithId<MetricInput>[]
  gallery: WithId<GalleryInput>[]
}

export interface CaseStudyListRow {
  id: string
  slug: string
  projectId: string
  projectName: string | null
  status: PageStatus
  dummy: boolean
  source: PageSource
  hasUnpublishedChanges: boolean
  publishedVersion: number | null
  featuredInWork: boolean
  claims: { confirmed: number; needsApproval: number; hidden: number }
  languages: RecordLangStates
  updatedAt: string
  updatedBy: ActorRef
}

export interface CaseStudyExtra {
  project: { id: string; name: string; status: PageStatus } | null
  publishedSlug: string | null
  usedInWork: { draft: boolean; published: boolean }
}

import { z } from 'zod'
import { ctaPair, itemId, linkUrl, maxActive, recordRef, SeoSchema, sortOrder, text, type SingletonAdminState, type WithId } from '#shared/cms/fields'

// Work page CMS (singleton). Decides WHAT /work shows and in which order:
// editorial labels + references to Project and Case Study records. No
// project or case-study content is stored here.
//
// Code-managed: the hero marker counts, the poster deck (built from the
// selected projects), "Browse projects" scroll action, the index meta
// ("Filter · Grid / List"), "Select a case" / swipe hints, cursor labels,
// chapter labels, badges, layout and motion. There is no page CTA section on
// /work (the footer CTA is global), so none is modelled.

// Design-safe limits (copy stress test on the real Work components at
// 390/820/1366/1920px).
export const WORK_LIMITS = {
  heroEyebrow: 16,
  headlineLine: 10,
  lede: 180,
  ctaLabel: 22,
  sectionLabel: 20,
  titleLead: 12,
  titleAccent: 16,
  supportingCopy: 90,
  projects: 24,
  projectsActive: 12,
  cases: 12,
  casesActive: 6
} as const

const HeroSchema = z
  .object({
    eyebrow: text(WORK_LIMITS.heroEyebrow, { required: true }),
    headlineLine1: text(WORK_LIMITS.headlineLine, { required: true }),
    // The yellow period is added by the design.
    headlineLine2: text(WORK_LIMITS.headlineLine, { required: true }).refine((v) => !/[.!?]$/.test(v), 'Leave out the final period — the design adds it.'),
    lede: text(WORK_LIMITS.lede, { required: true }),
    // The primary button scrolls to the project index (code-managed action).
    primaryCtaLabel: text(WORK_LIMITS.ctaLabel, { required: true }),
    secondaryCtaLabel: text(WORK_LIMITS.ctaLabel, { required: true }),
    secondaryCtaUrl: linkUrl.refine((v) => v !== '', 'Required.')
  })
  .strict()
  .superRefine(ctaPair('secondaryCtaLabel', 'secondaryCtaUrl'))

const ProjectPickSchema = z.object({ id: itemId, projectId: recordRef, sortOrder, active: z.boolean() }).strict()
const CasePickSchema = z.object({ id: itemId, caseStudyId: recordRef, sortOrder, active: z.boolean() }).strict()

function atLeastOneActive(label: string) {
  return (list: { active: boolean }[], ctx: z.RefinementCtx) => {
    if (!list.some((i) => i.active)) ctx.addIssue({ code: 'custom', message: `Keep at least one active ${label}.` })
  }
}
function uniqueBy<T>(get: (i: T) => string, label: string) {
  return (list: T[], ctx: z.RefinementCtx) => {
    const seen = new Set<string>()
    list.forEach((item, i) => {
      if (seen.has(get(item))) ctx.addIssue({ code: 'custom', path: [i], message: `Duplicate ${label}.` })
      seen.add(get(item))
    })
  }
}

const WorkContentObject = z
  .object({
    hero: HeroSchema,
    projectIndex: z
      .object({
        sectionLabel: text(WORK_LIMITS.sectionLabel, { required: true }),
        items: z
          .array(ProjectPickSchema)
          .max(WORK_LIMITS.projects, `Max ${WORK_LIMITS.projects} projects.`)
          .superRefine(maxActive(WORK_LIMITS.projectsActive, 'projects'))
          .superRefine(atLeastOneActive('project'))
          .superRefine(uniqueBy((i: { projectId: string }) => i.projectId, 'project'))
      })
      .strict(),
    featuredCases: z
      .object({
        sectionLabel: text(WORK_LIMITS.sectionLabel, { required: true }),
        titleLead: text(WORK_LIMITS.titleLead, { required: true }),
        // Shown in yellow after the lead word.
        titleAccent: text(WORK_LIMITS.titleAccent, { required: true }),
        supportingCopy: text(WORK_LIMITS.supportingCopy, { required: true }),
        items: z
          .array(CasePickSchema)
          .max(WORK_LIMITS.cases, `Max ${WORK_LIMITS.cases} case studies.`)
          .superRefine(maxActive(WORK_LIMITS.casesActive, 'case studies'))
          .superRefine(atLeastOneActive('case study'))
          .superRefine(uniqueBy((i: { caseStudyId: string }) => i.caseStudyId, 'case study'))
      })
      .strict(),
    seo: SeoSchema
  })
  .strict()

export const WorkContentSchema = WorkContentObject

export type WorkContentInput = z.infer<typeof WorkContentObject>
type ProjectPick = WorkContentInput['projectIndex']['items'][number]
type CasePick = WorkContentInput['featuredCases']['items'][number]
export interface WorkContent extends Omit<WorkContentInput, 'projectIndex' | 'featuredCases'> {
  projectIndex: Omit<WorkContentInput['projectIndex'], 'items'> & { items: WithId<ProjectPick>[] }
  featuredCases: Omit<WorkContentInput['featuredCases'], 'items'> & { items: WithId<CasePick>[] }
}

export type WorkAdminState = SingletonAdminState<'work', WorkContent>

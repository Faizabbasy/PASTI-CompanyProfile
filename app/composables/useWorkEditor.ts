import { CaseStudyContentSchema, type CaseStudyContent } from '#shared/utils/caseStudySchema'
import { ProjectContentSchema, type ProjectContent } from '#shared/utils/projectSchema'
import { WorkContentSchema, type WorkContent } from '#shared/utils/workSchema'
import { keyed, unkeyed, zodFieldErrors, type Keyed } from './useSingletonEditor'

// Form state for the Work CMS editors (/admin/work, /admin/work/projects/:id,
// /admin/work/case-studies/:id). Editor logic: useSingletonEditor (record
// endpoints answer the same { state, revision } shape as a singleton page).

// ---- Work page ---------------------------------------------------------------

type ProjectPick = WorkContent['projectIndex']['items'][number]
type CasePick = WorkContent['featuredCases']['items'][number]

export type WorkForm = Omit<WorkContent, 'projectIndex' | 'featuredCases'> & {
  projectIndex: Omit<WorkContent['projectIndex'], 'items'> & { items: Keyed<ProjectPick>[] }
  featuredCases: Omit<WorkContent['featuredCases'], 'items'> & { items: Keyed<CasePick>[] }
}

export const WORK_TABS = [
  { key: 'hero', label: 'Hero', sections: ['hero'] },
  { key: 'projectIndex', label: 'Project Index', sections: ['projectIndex'] },
  { key: 'featuredCases', label: 'Featured Case Studies', sections: ['featuredCases'] },
  { key: 'seo', label: 'SEO', sections: ['seo'] },
  { key: 'code', label: 'Code-managed', sections: [] }
] as const

export function toWorkForm(c: WorkContent): WorkForm {
  const copy = JSON.parse(JSON.stringify(c)) as WorkContent
  return {
    ...copy,
    projectIndex: { ...copy.projectIndex, items: keyed(copy.projectIndex.items) },
    featuredCases: { ...copy.featuredCases, items: keyed(copy.featuredCases.items) }
  }
}

export function toWorkPayload(f: WorkForm) {
  return {
    ...f,
    projectIndex: { ...f.projectIndex, items: unkeyed(f.projectIndex.items) },
    featuredCases: { ...f.featuredCases, items: unkeyed(f.featuredCases.items) }
  }
}

export const validateWorkForm = (f: WorkForm) => zodFieldErrors(WorkContentSchema.safeParse(toWorkPayload(f)))

// ---- Project -----------------------------------------------------------------

export type ProjectForm = ProjectContent

export const PROJECT_TABS = [
  { key: 'identity', label: 'Identity', sections: ['name', 'slug', 'clientDisplayName', 'category', 'year'] },
  { key: 'card', label: 'Work Card', sections: ['shortDescription', 'filterGroup', 'poster', 'posterAlt'] },
  { key: 'relations', label: 'Relations & Visibility', sections: [] }
] as const

export const emptyProject = (): ProjectForm => ({
  name: '',
  slug: '',
  clientDisplayName: '',
  category: '',
  filterGroup: '',
  year: '',
  shortDescription: '',
  poster: '',
  posterAlt: ''
})
export const toProjectForm = (c: ProjectContent): ProjectForm => JSON.parse(JSON.stringify(c))
export const toProjectPayload = (f: ProjectForm) => ({ ...f })
export const validateProjectForm = (f: ProjectForm) => zodFieldErrors(ProjectContentSchema.safeParse(toProjectPayload(f)))

// ---- Case study --------------------------------------------------------------

type Metric = CaseStudyContent['metrics'][number]
type GalleryItem = CaseStudyContent['gallery'][number]

export type CaseStudyForm = Omit<CaseStudyContent, 'metrics' | 'gallery'> & {
  metrics: Keyed<Metric>[]
  gallery: Keyed<GalleryItem>[]
}

export const CASE_TABS = [
  { key: 'header', label: 'Header', sections: ['projectId', 'slug', 'categoryOverride'] },
  { key: 'context', label: 'Context', sections: ['context'] },
  { key: 'challenge', label: 'Challenge', sections: ['challenge'] },
  { key: 'approach', label: 'What We Built', sections: ['approach'] },
  { key: 'outcome', label: 'Outcome', sections: ['outcome', 'insight'] },
  { key: 'metrics', label: 'Metrics', sections: ['metrics'] },
  { key: 'gallery', label: 'Gallery', sections: ['gallery'] },
  { key: 'delivery', label: 'Timeline & Stack', sections: ['timeline', 'technologyLabels'] }
] as const

export const emptyCaseStudy = (projectId = ''): CaseStudyForm => ({
  projectId,
  slug: '',
  categoryOverride: '',
  context: { body: '' },
  challenge: { points: [] },
  approach: { mode: 'solution', points: [] },
  outcome: { points: [] },
  insight: '',
  timeline: { total: '', steps: [] },
  technologyLabels: [],
  metrics: [],
  gallery: []
})

export function toCaseStudyForm(c: CaseStudyContent): CaseStudyForm {
  const copy = JSON.parse(JSON.stringify(c)) as CaseStudyContent
  return { ...copy, metrics: keyed(copy.metrics), gallery: keyed(copy.gallery) }
}

export function toCaseStudyPayload(f: CaseStudyForm) {
  return {
    ...f,
    context: { ...f.context },
    challenge: { points: [...f.challenge.points] },
    approach: { mode: f.approach.mode, points: [...f.approach.points] },
    outcome: { points: [...f.outcome.points] },
    timeline: { total: f.timeline.total, steps: f.timeline.steps.map((s) => ({ ...s })) },
    technologyLabels: [...f.technologyLabels],
    metrics: unkeyed(f.metrics),
    gallery: unkeyed(f.gallery)
  }
}

export const validateCaseStudyForm = (f: CaseStudyForm) => zodFieldErrors(CaseStudyContentSchema.safeParse(toCaseStudyPayload(f)))

export const CLAIM_LABELS = {
  confirmed: { label: 'Confirmed', mark: '✓', cls: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  needs_approval: { label: 'Needs approval', mark: '!', cls: 'border-amber-300 bg-amber-50 text-amber-900' },
  hidden: { label: 'Hidden', mark: '–', cls: 'border-gray-300 bg-gray-100 text-gray-700' }
} as const

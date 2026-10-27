import { z } from 'zod'
import { mediaRef, slug, text, type ActorRef, type PageSource, type PageStatus, type RecordLangStates } from '#shared/cms/fields'

// Work CMS — Project record (collection). Owns project identity only: name,
// client display name, category, filter group, year, description and the
// poster. Where a project appears and in which order is decided by the Work
// page (selection by id), and its case study points at it (projectId) — so
// there is no showInWork / featured / sortOrder / caseStudyId here.
// No SEO: projects have no public detail route.

export const PROJECT_LIMITS = {
  name: 60,
  client: 80,
  category: 60,
  filterGroup: 20,
  description: 320,
  alt: 160
} as const

const ProjectContentObject = z
  .object({
    name: text(PROJECT_LIMITS.name, { required: true }),
    slug,
    // Temporary until a Shared Clients collection exists (then: clientId).
    clientDisplayName: text(PROJECT_LIMITS.client),
    category: text(PROJECT_LIMITS.category, { required: true }),
    // Filter chip on the /work index (e.g. Commerce, Wellness).
    filterGroup: text(PROJECT_LIMITS.filterGroup, { required: true }),
    year: z
      .string()
      .trim()
      .refine((v) => v === '' || /^(19|20)\d{2}$/.test(v), 'Use a 4-digit year or leave empty.'),
    shortDescription: text(PROJECT_LIMITS.description, { required: true }),
    poster: mediaRef.refine((v) => v !== '', 'Required.'),
    posterAlt: text(PROJECT_LIMITS.alt, { required: true })
  })
  .strict()

export const ProjectContentSchema = ProjectContentObject

export type ProjectContent = z.infer<typeof ProjectContentObject>

// Admin list row (GET /api/admin/work/projects).
export interface ProjectListRow {
  id: string
  name: string
  slug: string
  category: string
  status: PageStatus
  dummy: boolean
  source: PageSource
  hasUnpublishedChanges: boolean
  publishedVersion: number | null
  // Derived: the case study whose projectId is this project (single owner of
  // the relation).
  caseStudy: { id: string; slug: string; status: PageStatus } | null
  selectedInWork: boolean
  languages: RecordLangStates
  updatedAt: string
  updatedBy: ActorRef
}

export interface ProjectExtra {
  caseStudy: { id: string; slug: string; status: PageStatus } | null
  publishedSlug: string | null
  usedInWork: { draft: boolean; published: boolean }
}

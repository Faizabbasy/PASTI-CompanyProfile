import { roleCan } from '#shared/utils/cmsPermissions'
import { CaseStudyContentSchema, type CaseStudyContent, type CaseStudyContentInput, type CaseStudyExtra, type CaseStudyListRow } from '#shared/utils/caseStudySchema'
import { ProjectContentSchema, type ProjectContent, type ProjectExtra, type ProjectListRow } from '#shared/utils/projectSchema'
import { resolveWorkView, type WorkSourceRecord } from '#shared/utils/workPublic'
import { WorkContentSchema, type WorkContent, type WorkContentInput } from '#shared/utils/workSchema'
import type { ClaimStatus } from '#shared/cms/fields'
import { WORK_DUMMY_CASES, WORK_DUMMY_CONTENT, WORK_DUMMY_PROJECTS } from '../../data/workDummy'
import { defineCollection, type CollectionRecord } from './collection'
import { defineSingletonPage } from './singletonPage'

// Work CMS = three layers on the shared engines:
//
//   work         singleton  (pages:work)              — what /work shows, in which order
//   projects     collection (collections:projects:*)  — project identity
//   case-studies collection (collections:case-studies:*) — narratives, linked by projectId
//
// Relations are references only and are checked here, server-side, on every
// save / publish / archive / delete. Claim approval (metrics + media) is
// enforced in the case-study save path.

type ProjectRec = CollectionRecord<ProjectContent>
type CaseRec = CollectionRecord<CaseStudyContent>

function fieldError(statusCode: 400 | 422, path: string, message: string): never {
  throw createError({ statusCode, statusMessage: statusCode === 400 ? 'Invalid input' : 'Not ready to publish', data: { fields: [{ path, message }] } })
}
function conflict(message: string): never {
  throw createError({ statusCode: 409, statusMessage: message })
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const projectsCollection = defineCollection<ProjectContent>({
  name: 'projects',
  entityType: 'project',
  idPrefix: 'prj',
  schema: ProjectContentSchema,
  lists: [],
  actions: { create: 'project.create', update: 'project.update', publish: 'project.publish', unpublish: 'project.unpublish', archive: 'project.archive', delete: 'project.delete' },
  dummyRecords: WORK_DUMMY_PROJECTS,
  async validate(content, { id }) {
    const all = await projectsCollection.readAll()
    if (all.some((r) => r.id !== id && r.draft.content.slug === content.slug)) fieldError(400, 'slug', 'Another project already uses this slug.')
  },
  async beforeArchive(rec) {
    const cases = (await casesCollection.readAll()).filter((c) => c.draft.content.projectId === rec.id && c.status !== 'archived')
    if (cases.length) conflict('This project has a case study. Archive the case study first.')
    const use = await workUsage()
    if (use.projects.draftActive.has(rec.id) || use.projects.publishedActive.has(rec.id)) conflict('This project is selected on the Work page. Remove or deactivate it there first.')
  },
  async beforeDelete(rec) {
    const cases = (await casesCollection.readAll()).filter((c) => c.draft.content.projectId === rec.id || c.published?.content.projectId === rec.id)
    if (cases.length) conflict('A case study references this project. Remove that link first.')
    const use = await workUsage()
    if (use.projects.any.has(rec.id)) conflict('This project is referenced by the Work page. Remove it there first.')
  }
})

// ---------------------------------------------------------------------------
// Case studies
// ---------------------------------------------------------------------------

const METRIC_SENSITIVE = ['value', 'label', 'context'] as const
const MEDIA_SENSITIVE = ['src', 'kind'] as const

interface ClaimChange {
  list: 'metrics' | 'gallery'
  itemId: string
  from: ClaimStatus | null
  to: ClaimStatus
  auto: boolean
}

// Only an ADMIN (claims.approve) may make a claim or a client-sensitive image
// eligible for public rendering. An EDITOR who edits the substance of an
// already confirmed item sends it back to needs_approval instead of keeping
// an approval that was given to different content.
function enforceApprovals(content: CaseStudyContent, current: CaseStudyContent | null, canApprove: boolean): ClaimChange[] {
  const changes: ClaimChange[] = []
  const run = <T extends { id: string }>(list: 'metrics' | 'gallery', items: T[], prevItems: T[], statusKey: keyof T, sensitive: readonly (keyof T)[]) => {
    items.forEach((item, i) => {
      const prev = prevItems.find((p) => p.id === item.id)
      const from = (prev?.[statusKey] as ClaimStatus | undefined) ?? null
      let to = item[statusKey] as ClaimStatus
      let auto = false
      if (!canApprove && to === 'confirmed') {
        const substanceChanged = !!prev && sensitive.some((k) => JSON.stringify(prev[k]) !== JSON.stringify(item[k]))
        if (from !== 'confirmed') {
          throw createError({ statusCode: 403, statusMessage: 'Only an admin can confirm public claims.', data: { fields: [{ path: `${list}.${i}.${String(statusKey)}`, message: 'Only an admin can set Confirmed.' }] } })
        }
        if (substanceChanged) {
          to = 'needs_approval'
          auto = true
          ;(item as Record<string, unknown>)[statusKey as string] = to
        }
      }
      if (from !== to) changes.push({ list, itemId: item.id, from, to, auto })
    })
  }
  run('metrics', content.metrics, current?.metrics ?? [], 'claimStatus', METRIC_SENSITIVE)
  run('gallery', content.gallery, current?.gallery ?? [], 'approvalStatus', MEDIA_SENSITIVE)
  return changes
}

export const casesCollection = defineCollection<CaseStudyContent, CaseStudyContentInput>({
  name: 'case-studies',
  entityType: 'caseStudy',
  idPrefix: 'cs',
  schema: CaseStudyContentSchema,
  lists: [
    { path: 'metrics', prefix: 'm' },
    { path: 'gallery', prefix: 'g' }
  ],
  actions: { create: 'caseStudy.create', update: 'caseStudy.update', publish: 'caseStudy.publish', unpublish: 'caseStudy.unpublish', archive: 'caseStudy.archive', delete: 'caseStudy.delete' },
  dummyRecords: WORK_DUMMY_CASES,
  async beforeSave(content, { event, user, id, current }) {
    const changes = enforceApprovals(content, current, roleCan(user.role, 'claims.approve'))
    return {
      content,
      afterSave: async () => {
        for (const c of changes) {
          // Status transition only — never the claim text itself.
          await audit(event, { action: 'claim.statusChange', entityType: 'caseStudy', entityId: id, metadata: { list: c.list, itemId: c.itemId, fromStatus: c.from, toStatus: c.to, automatic: c.auto, actorName: user.name } })
        }
      }
    }
  },
  async validate(content, { id }) {
    const all = await casesCollection.readAll()
    if (all.some((r) => r.id !== id && r.draft.content.slug === content.slug)) fieldError(400, 'slug', 'Another case study already uses this slug.')
    const project = await projectsCollection.peek(content.projectId)
    if (!project) fieldError(400, 'projectId', 'This project does not exist.')
    if (project.status === 'archived') fieldError(400, 'projectId', 'This project is archived.')
    if (all.some((r) => r.id !== id && r.status !== 'archived' && r.draft.content.projectId === content.projectId)) {
      fieldError(400, 'projectId', 'This project already has a case study.')
    }
  },
  async beforePublish(rec) {
    const project = await projectsCollection.peek(rec.draft.content.projectId)
    if (project?.status !== 'published') fieldError(422, 'projectId', 'Publish the linked project first — the case study takes its name, client and year from it.')
  },
  async beforeArchive(rec) {
    const use = await workUsage()
    if (use.cases.draftActive.has(rec.id) || use.cases.publishedActive.has(rec.id)) conflict('This case study is featured on the Work page. Remove or deactivate it there first.')
  },
  async beforeDelete(rec) {
    const use = await workUsage()
    if (use.cases.any.has(rec.id)) conflict('This case study is referenced by the Work page. Remove it there first.')
  }
})

// ---------------------------------------------------------------------------
// Work page (singleton)
// ---------------------------------------------------------------------------

async function validateWorkRefs(content: WorkContent | WorkContentInput) {
  const projects = new Map((await projectsCollection.readAll()).map((r) => [r.id, r]))
  const cases = new Map((await casesCollection.readAll()).map((r) => [r.id, r]))
  content.projectIndex.items.forEach((i, n) => {
    const p = projects.get(i.projectId)
    if (!p) fieldError(400, `projectIndex.items.${n}.projectId`, 'This project does not exist.')
    if (p.status === 'archived') fieldError(400, `projectIndex.items.${n}.projectId`, 'This project is archived.')
  })
  content.featuredCases.items.forEach((i, n) => {
    const c = cases.get(i.caseStudyId)
    if (!c) fieldError(400, `featuredCases.items.${n}.caseStudyId`, 'This case study does not exist.')
    if (c.status === 'archived') fieldError(400, `featuredCases.items.${n}.caseStudyId`, 'This case study is archived.')
  })
}

async function assertWorkRefsPublished(content: WorkContent) {
  const projects = new Map((await projectsCollection.readAll()).map((r) => [r.id, r]))
  const cases = new Map((await casesCollection.readAll()).map((r) => [r.id, r]))
  content.projectIndex.items.forEach((i, n) => {
    if (i.active && projects.get(i.projectId)?.status !== 'published') {
      fieldError(422, `projectIndex.items.${n}.projectId`, 'Publish this project first, or set it inactive.')
    }
  })
  content.featuredCases.items.forEach((i, n) => {
    if (!i.active) return
    const c = cases.get(i.caseStudyId)
    if (c?.status !== 'published') fieldError(422, `featuredCases.items.${n}.caseStudyId`, 'Publish this case study first, or set it inactive.')
    if (projects.get(c.draft.content.projectId)?.status !== 'published') fieldError(422, `featuredCases.items.${n}.caseStudyId`, 'The project of this case study is not published.')
  })
}

export const workPage = defineSingletonPage<'work', WorkContent, WorkContentInput>({
  id: 'work',
  schema: WorkContentSchema,
  dummyContent: WORK_DUMMY_CONTENT,
  lists: [
    { path: 'projectIndex.items', prefix: 'wp' },
    { path: 'featuredCases.items', prefix: 'wc' }
  ],
  actions: { update: 'work.update', publish: 'work.publish', unpublish: 'work.unpublish', archive: 'work.archive' },
  validate: validateWorkRefs,
  beforePublish: assertWorkRefsPublished
})

// Which records the Work page references (draft and live published snapshot).
async function workUsage() {
  const r = await workPage.peekRecord()
  const sets = () => ({ any: new Set<string>(), draftActive: new Set<string>(), publishedActive: new Set<string>() })
  const out = { projects: sets(), cases: sets() }
  if (!r) return out
  const add = (c: WorkContent, kind: 'draftActive' | 'publishedActive') => {
    for (const i of c.projectIndex.items) {
      out.projects.any.add(i.projectId)
      if (i.active) out.projects[kind].add(i.projectId)
    }
    for (const i of c.featuredCases.items) {
      out.cases.any.add(i.caseStudyId)
      if (i.active) out.cases[kind].add(i.caseStudyId)
    }
  }
  add(r.draft.content, 'draftActive')
  if (r.published) add(r.published.content, r.status === 'published' ? 'publishedActive' : 'draftActive')
  return out
}

// Dev seed: the dummy Work page references the dummy records, so seed those first.
export async function ensureWorkSeeded() {
  await projectsCollection.ensureSeeded()
  await casesCollection.ensureSeeded()
}

// ---------------------------------------------------------------------------
// Admin views
// ---------------------------------------------------------------------------

export async function listProjectRows(): Promise<ProjectListRow[]> {
  await ensureWorkSeeded()
  const [projects, cases, use] = await Promise.all([projectsCollection.readAll(), casesCollection.readAll(), workUsage()])
  return projects.map((p) => {
    const cs = cases.find((c) => c.draft.content.projectId === p.id && c.status !== 'archived')
    return {
      id: p.id,
      name: p.draft.content.name,
      slug: p.draft.content.slug,
      category: p.draft.content.category,
      status: p.status,
      dummy: p.dummy,
      source: p.source ?? { kind: 'seed' },
      hasUnpublishedChanges: p.draft.changedSincePublish,
      publishedVersion: p.published?.version ?? null,
      caseStudy: cs ? { id: cs.id, slug: cs.draft.content.slug, status: cs.status } : null,
      selectedInWork: use.projects.draftActive.has(p.id) || use.projects.publishedActive.has(p.id),
      updatedAt: p.updatedAt,
      updatedBy: p.updatedBy
    }
  })
}

export async function listCaseRows(): Promise<CaseStudyListRow[]> {
  await ensureWorkSeeded()
  const [projects, cases, use] = await Promise.all([projectsCollection.readAll(), casesCollection.readAll(), workUsage()])
  return cases.map((c) => {
    const count = (s: ClaimStatus) => c.draft.content.metrics.filter((m) => m.claimStatus === s).length + c.draft.content.gallery.filter((g) => g.approvalStatus === s).length
    return {
      id: c.id,
      slug: c.draft.content.slug,
      projectId: c.draft.content.projectId,
      projectName: projects.find((p) => p.id === c.draft.content.projectId)?.draft.content.name ?? null,
      status: c.status,
      dummy: c.dummy,
      source: c.source ?? { kind: 'seed' },
      hasUnpublishedChanges: c.draft.changedSincePublish,
      publishedVersion: c.published?.version ?? null,
      featuredInWork: use.cases.draftActive.has(c.id) || use.cases.publishedActive.has(c.id),
      claims: { confirmed: count('confirmed'), needsApproval: count('needs_approval'), hidden: count('hidden') },
      updatedAt: c.updatedAt,
      updatedBy: c.updatedBy
    }
  })
}

export async function projectAdminResponse(rec: ProjectRec) {
  const [cases, use] = await Promise.all([casesCollection.readAll(), workUsage()])
  const cs = cases.find((c) => c.draft.content.projectId === rec.id && c.status !== 'archived')
  const extra: ProjectExtra = {
    caseStudy: cs ? { id: cs.id, slug: cs.draft.content.slug, status: cs.status } : null,
    publishedSlug: rec.published?.content.slug ?? null,
    usedInWork: { draft: use.projects.draftActive.has(rec.id), published: use.projects.publishedActive.has(rec.id) }
  }
  return { state: projectsCollection.toAdminState(rec, extra), revision: rec.draft.revision }
}

export async function caseAdminResponse(rec: CaseRec) {
  const [project, use] = await Promise.all([projectsCollection.peek(rec.draft.content.projectId), workUsage()])
  const extra: CaseStudyExtra = {
    project: project ? { id: project.id, name: project.draft.content.name, status: project.status } : null,
    publishedSlug: rec.published?.content.slug ?? null,
    usedInWork: { draft: use.cases.draftActive.has(rec.id), published: use.cases.publishedActive.has(rec.id) }
  }
  return { state: casesCollection.toAdminState(rec, extra), revision: rec.draft.revision }
}

// Draft preview data: the Work draft + drafts of every non-archived record.
export async function getWorkPreviewData() {
  await ensureWorkSeeded()
  const draft = await workPage.getDraftContent()
  const src = <C>(r: CollectionRecord<C>) => ({ id: r.id, meta: r.meta, status: r.status, content: r.draft.content })
  const [projects, cases] = await Promise.all([projectsCollection.readAll(), casesCollection.readAll()])
  return {
    work: draft,
    projects: projects.filter((r) => r.status !== 'archived').map(src),
    caseStudies: cases.filter((r) => r.status !== 'archived').map(src)
  }
}

export async function getRecordPreviewData(kind: 'project' | 'caseStudy', id: string) {
  if (kind === 'project') {
    const r = await projectsCollection.read(id)
    return { record: { id: r.id, meta: r.meta, status: r.status, version: r.draft.version, updatedAt: r.draft.updatedAt, content: r.draft.content }, project: null }
  }
  const r = await casesCollection.read(id)
  const p = await projectsCollection.peek(r.draft.content.projectId)
  return {
    record: { id: r.id, meta: r.meta, status: r.status, version: r.draft.version, updatedAt: r.draft.updatedAt, content: r.draft.content },
    project: p ? { id: p.id, meta: p.meta, status: p.status, content: p.draft.content } : null
  }
}

// ---------------------------------------------------------------------------
// Public read path
// ---------------------------------------------------------------------------

// Published Work snapshot joined with PUBLISHED projects / case studies only.
// Confirmed + active claims and media only; no source notes, ids of drafts,
// actors or workflow metadata. Never reads drafts and never seeds.
export async function getPublishedWork(lang: CmsLang = 'en') {
  const snap = await workPage.forLocale(lang).getPublishedSnapshot()
  if (!snap) return null
  const [projects, cases] = await Promise.all([projectsCollection.getPublishedAll(), casesCollection.getPublishedAll()])
  const publishedProjectIds = new Set(projects.map((p) => p.id))
  const usableCases = cases.filter((c) => publishedProjectIds.has(c.content.projectId))
  const toSrc = <C>(r: { id: string; meta: Record<string, string>; content: C }): WorkSourceRecord<C> => ({ id: r.id, meta: r.meta, content: r.content })
  const { counts: _counts, ...content } = resolveWorkView(snap.content, projects.map(toSrc), usableCases.map(toSrc))

  const usedIds = new Set([...snap.content.projectIndex.items.map((i) => i.projectId), ...snap.content.featuredCases.items.map((i) => i.caseStudyId)])
  const dummy = snap.dummy || [...projects, ...cases].some((r) => r.dummy && usedIds.has(r.id))
  return { dummy, version: snap.version, publishedAt: snap.publishedAt, content }
}


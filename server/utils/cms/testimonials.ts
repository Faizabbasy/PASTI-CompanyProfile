import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { H3Event } from 'h3'
import type { ActorRef } from '#shared/cms/fields'
import { roleCan } from '#shared/utils/cmsPermissions'
import {
  TestimonialContentSchema,
  type TestimonialApproval,
  type TestimonialContent,
  type TestimonialExtra,
  type TestimonialListRow,
  type TestimonialUsage
} from '#shared/utils/testimonialSchema'
import type { PublicTestimonial } from '#shared/utils/testimonialPublic'
import { TESTIMONIALS_DUMMY } from '../../data/testimonialsDummy'
import { defineCollection, type CollectionRecord } from './collection'
import { testimonialApprovalHash } from './testimonialApproval'
import type { CmsUser } from './types'

// Shared Testimonials collection (collections:testimonials:*) on the shared
// collection engine — same draft / published / revision model, storage and
// audit as Work projects. Pages reference testimonial ids; they never hold
// testimonial content.
//
// Publication approval is RECORD-LEVEL (record.meta), separate from the
// publish workflow:
//   meta.approval       confirmed | needs_approval | hidden
//   meta.approvedHash   fingerprint of the wording a `confirmed` covers
//   meta.approvalAt / approvalBy / approvalByName
// Only an ADMIN (claims.approve) can set `confirmed`. Anyone who can edit may
// lower it (needs_approval / hidden), which takes effect immediately.
//
// Public eligibility (server-side, the only rule):
//   status === 'published' && published.active
//   && approval === 'confirmed' && approvedHash === hash(published content)
// so a newly published wording never rides on an approval given to older
// wording — publishing such a change also resets approval to needs_approval.

type Rec = CollectionRecord<TestimonialContent>

function conflict(message: string): never {
  throw createError({ statusCode: 409, statusMessage: message })
}

const approvalOf = (r: Rec): TestimonialApproval => {
  const v = r.meta.approval
  return v === 'confirmed' || v === 'hidden' ? v : 'needs_approval'
}

export function isPublicEligible(r: Rec): boolean {
  return (
    r.status === 'published' &&
    !!r.published &&
    r.published.content.active === true &&
    approvalOf(r) === 'confirmed' &&
    !!r.meta.approvedHash &&
    r.meta.approvedHash === testimonialApprovalHash(r.published.content)
  )
}

export const testimonialsCollection = defineCollection<TestimonialContent>({
  name: 'testimonials',
  entityType: 'testimonial',
  idPrefix: 'tst',
  schema: TestimonialContentSchema,
  lists: [],
  actions: {
    create: 'testimonial.create',
    update: 'testimonial.update',
    publish: 'testimonial.publish',
    unpublish: 'testimonial.unpublish',
    archive: 'testimonial.archive',
    delete: 'testimonial.delete'
  },
  dummyRecords: TESTIMONIALS_DUMMY,
  async validate(content) {
    if (content.photo && publicFileMissing(content.photo)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: { fields: [{ path: 'photo', message: 'No image exists at this path.' }] } })
    }
  },
  async beforeDelete(rec) {
    const use = await testimonialUsage()
    if (use.has(rec.id)) conflict('A page references this testimonial. Remove it from that page first, or archive it instead.')
  }
})

// The photo must be an existing file under /public. The path itself is
// already restricted by the schema (/images/…, image types, no traversal).
// Checked where the public folder is on disk (dev, Node server); on hosts
// that serve /public from a CDN only, the schema check alone applies.
function publicFileMissing(path: string): boolean {
  // Media-library uploads live in Supabase Storage, not under /public.
  if (/^https:\/\//.test(path)) return false
  const dir = join(process.cwd(), 'public')
  if (!existsSync(dir)) return false
  return !existsSync(join(dir, ...path.split('/').filter(Boolean)))
}

const KEY = (id: string) => `${testimonialsCollection.PREFIX}:${id}`

async function store(r: Rec) {
  await cmsStorage().setItem(KEY(r.id), r)
}

// Dev seed. Seeded `confirmed` dummies get the fingerprint of their seeded
// wording so the public filter can be exercised end to end.
export async function ensureTestimonialsSeeded() {
  await testimonialsCollection.ensureSeeded()
  for (const r of await testimonialsCollection.readAll()) {
    if (r.dummy && r.meta.approval === 'confirmed' && !r.meta.approvedHash) {
      r.meta = { ...r.meta, approvedHash: testimonialApprovalHash(r.draft.content), approvalAt: r.createdAt, approvalByName: 'Dev seed' }
      await store(r)
    }
  }
}

// New records always start as needs_approval — creating never approves.
export async function createTestimonial(event: H3Event, user: CmsUser, content: TestimonialContent) {
  const r = await testimonialsCollection.create(event, user, content)
  r.meta = { ...r.meta, approval: 'needs_approval' }
  await store(r)
  return r
}

// Change publication approval. `revision` must match the stored draft: an
// ADMIN confirms exactly the wording they reviewed (the current draft).
export function setTestimonialApproval(event: H3Event, user: CmsUser, id: string, revision: number, to: TestimonialApproval) {
  return withCmsLock(KEY(id), () => setApprovalUnlocked(event, user, id, revision, to))
}

async function setApprovalUnlocked(event: H3Event, user: CmsUser, id: string, revision: number, to: TestimonialApproval) {
  const r = await testimonialsCollection.read(id)
  if (revision !== r.draft.revision) conflict('This testimonial changed since you loaded it. Reload and review before changing approval.')
  if (to === 'confirmed' && !roleCan(user.role, 'claims.approve')) {
    throw createError({ statusCode: 403, statusMessage: 'Only an admin can confirm a testimonial for public use.' })
  }
  const from = approvalOf(r)
  const hash = testimonialApprovalHash(r.draft.content)
  if (from === to && (to !== 'confirmed' || r.meta.approvedHash === hash)) return r

  const now = new Date().toISOString()
  r.meta = {
    ...r.meta,
    approval: to,
    approvedHash: to === 'confirmed' ? hash : '',
    approvalAt: now,
    approvalBy: user.id,
    approvalByName: user.name
  }
  r.updatedAt = now
  r.updatedBy = { id: user.id, name: user.name }
  await store(r)
  await audit(event, {
    action: 'testimonial.approvalChange',
    entityType: 'testimonial',
    entityId: id,
    metadata: { testimonialId: id, previousApproval: from, newApproval: to, actorName: user.name, draftVersion: r.draft.version, automatic: false }
  })
  return r
}

// Publish, then make sure a `confirmed` approval never covers wording it
// was not given for: if the published identity fields differ from the
// approved fingerprint, approval drops to needs_approval (audited).
export async function publishTestimonial(event: H3Event, user: CmsUser, id: string, revision: number) {
  await testimonialsCollection.publish(event, user, id, revision)
  return withCmsLock(KEY(id), async () => {
  // Re-read under the lock: never write back a stale copy.
  const r = await testimonialsCollection.read(id)
  if (approvalOf(r) === 'confirmed' && r.published && r.meta.approvedHash !== testimonialApprovalHash(r.published.content)) {
    const now = new Date().toISOString()
    r.meta = { ...r.meta, approval: 'needs_approval', approvedHash: '', approvalAt: now, approvalBy: user.id, approvalByName: user.name }
    await store(r)
    await audit(event, {
      action: 'testimonial.approvalChange',
      entityType: 'testimonial',
      entityId: id,
      metadata: { testimonialId: id, previousApproval: 'confirmed', newApproval: 'needs_approval', actorName: user.name, reason: 'published wording differs from the approved wording', automatic: true }
    })
  }
  return r
  })
}

// ---------------------------------------------------------------------------
// References from page CMS records (read-only). Pages store ids only.
// Today: the Creative page's temporary ref `t:<slug>` names the testimonial
// whose migrated id is `tst-<slug>`. Archiving a referenced testimonial is
// allowed — it simply stops being public-eligible; nothing is substituted.
// ---------------------------------------------------------------------------

interface PageRecordLike {
  status: string
  draft: { content: unknown }
  published: { content: unknown } | null
}

const PAGE_REFS: { key: string; label: string; ids: (content: unknown) => string[] }[] = [
  {
    key: 'pages:creative',
    label: 'Creative page · campaign + testimonial',
    ids: (c) => {
      const ref = (c as { work?: { testimonialRef?: string } })?.work?.testimonialRef
      return typeof ref === 'string' && ref.startsWith('t:') ? [`tst-${ref.slice(2)}`] : []
    }
  }
]

async function usageMap(): Promise<Map<string, TestimonialUsage[]>> {
  const map = new Map<string, TestimonialUsage[]>()
  const add = (id: string, u: TestimonialUsage) => map.set(id, [...(map.get(id) ?? []), u])
  for (const p of PAGE_REFS) {
    const r = await cmsStorage().getItem<PageRecordLike>(p.key)
    if (!r) continue
    for (const id of p.ids(r.draft.content)) add(id, { page: p.key, label: p.label, where: 'draft' })
    if (r.published && r.status === 'published') for (const id of p.ids(r.published.content)) add(id, { page: p.key, label: p.label, where: 'published' })
  }
  return map
}

export async function testimonialUsage(): Promise<Set<string>> {
  return new Set((await usageMap()).keys())
}

// ---------------------------------------------------------------------------
// Admin views
// ---------------------------------------------------------------------------

function approvalExtra(r: Rec): TestimonialExtra['approval'] {
  const value = approvalOf(r)
  const changedBy: ActorRef | null = r.meta.approvalByName ? { id: r.meta.approvalBy ?? '', name: r.meta.approvalByName } : null
  return {
    value,
    changedAt: r.meta.approvalAt || null,
    changedBy,
    coversDraft: value === 'confirmed' && r.meta.approvedHash === testimonialApprovalHash(r.draft.content),
    coversPublished: value === 'confirmed' && !!r.published && r.meta.approvedHash === testimonialApprovalHash(r.published.content)
  }
}

export async function listTestimonialRows(): Promise<TestimonialListRow[]> {
  await ensureTestimonialsSeeded()
  const [recs, use] = await Promise.all([testimonialsCollection.readAll(), usageMap()])
  return recs
    .map((r) => {
      const c = r.draft.content
      return {
        id: r.id,
        personName: c.personName,
        roleTitle: c.roleTitle,
        companyDisplayName: c.companyDisplayName,
        clientId: c.clientId,
        quotePreview: c.quote.length > 120 ? `${c.quote.slice(0, 117).trimEnd()}…` : c.quote,
        type: c.type,
        categoryIds: [...c.categoryIds],
        active: c.active,
        sortOrder: c.sortOrder,
        status: r.status,
        approval: approvalOf(r),
        publicEligible: isPublicEligible(r),
        referenced: use.has(r.id),
        dummy: r.dummy,
        source: r.source ?? { kind: 'seed' as const },
        hasUnpublishedChanges: r.draft.changedSincePublish,
        publishedVersion: r.published?.version ?? null,
        updatedAt: r.updatedAt,
        updatedBy: r.updatedBy
      }
    })
    .sort((a, b) => a.sortOrder - b.sortOrder || a.personName.localeCompare(b.personName))
}

export async function testimonialAdminResponse(r: Rec) {
  const use = await usageMap()
  const extra: TestimonialExtra = {
    approval: approvalExtra(r),
    publicEligible: isPublicEligible(r),
    usage: use.get(r.id) ?? [],
    legacyRoleLine: r.meta.legacyRoleLine || null
  }
  return { state: testimonialsCollection.toAdminState(r, extra), revision: r.draft.revision }
}

// ---------------------------------------------------------------------------
// Public read path: eligible records only, explicit field whitelist, from
// the published snapshot. Never drafts, never metadata.
// ---------------------------------------------------------------------------

// `allowDummy` is false outside `nuxt dev`: dev seed records never go public.
export async function getPublicTestimonials(ids: string[] | null, opts: { allowDummy: boolean }): Promise<PublicTestimonial[]> {
  const recs = (await testimonialsCollection.readAll()).filter((r) => isPublicEligible(r) && (opts.allowDummy || !r.dummy))
  const toPublic = (r: Rec): PublicTestimonial => {
    const c = r.published!.content
    return {
      id: r.id,
      quote: c.quote,
      personName: c.personName,
      roleTitle: c.roleTitle,
      companyDisplayName: c.companyDisplayName,
      clientId: c.clientId,
      photo: c.photo,
      photoAlt: c.photoAlt,
      type: c.type,
      categoryIds: [...c.categoryIds],
      tags: [...c.tags]
    }
  }
  const picked = ids
    ? ids.map((id) => recs.find((r) => r.id === id)).filter((r): r is Rec => !!r)
    : [...recs].sort((a, b) => a.published!.content.sortOrder - b.published!.content.sortOrder || a.id.localeCompare(b.id))
  return picked.map(toPublic)
}

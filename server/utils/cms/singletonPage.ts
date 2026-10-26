import { randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'
import type { ZodType } from 'zod'
import type { ActorRef, PageSource, PageStatus, SingletonAdminState } from '#shared/cms/fields'
import type { AuditAction, CmsUser } from './types'

// Singleton page engine (About, Technology). One record per page holds two
// separate copies:
//
//   draft     — the working copy every Save Draft overwrites
//   published — an immutable snapshot taken at Publish time
//
// Saving only ever touches `draft`, so editing a published page can't change
// what the public receives. Publish copies draft → published (and keeps a
// revision snapshot); the public read path only looks at `published`, and
// only while status === 'published'.
//
// Versions: `draft.version` is the number the draft will carry once
// published (published v3 + edits → draft v4). `draft.revision` bumps on
// every save and is the optimistic-lock token for save and publish.

export interface SingletonRecord<Id extends string, C> {
  id: Id
  dummy: boolean
  // Where the record's content came from. Admin-only; never public.
  source?: PageSource
  status: PageStatus
  draft: {
    version: number
    revision: number
    changedSincePublish: boolean
    content: C
    updatedAt: string
    updatedBy: ActorRef
  }
  published: {
    version: number
    content: C
    publishedAt: string
    publishedBy: ActorRef
  } | null
  revisions: { version: number; publishedAt: string; publishedBy: ActorRef }[]
  createdAt: string
  updatedAt: string
  updatedBy: ActorRef
  publishedAt: string | null
  publishedBy: ActorRef | null
}

interface ListItem {
  id?: string
  sortOrder: number
}

export interface SingletonPageConfig<Id extends string, C> {
  id: Id
  // Re-validates the stored draft at publish time (defense in depth).
  schema: ZodType
  dummyContent: C
  // Repeater lists inside the content, as dotted paths ('values',
  // 'mission.points'), each with the prefix for server-assigned ids.
  lists: { path: string; prefix: string }[]
  actions: { update: AuditAction; publish: AuditAction; unpublish: AuditAction; archive: AuditAction }
  // Optional async checks for content that references other records (Work
  // page → projects / case studies). Throw an h3 error to reject. About,
  // Technology and Creative don't use them.
  validate?: (content: C) => Promise<void>
  beforePublish?: (content: C) => Promise<void>
}

const SYSTEM: ActorRef = { id: 'system', name: 'Dev seed' }
const actor = (u: CmsUser): ActorRef => ({ id: u.id, name: u.name })
const clone = <T>(v: T): T => structuredClone(v)

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj)
}
function setPath(obj: unknown, path: string, value: unknown) {
  const keys = path.split('.')
  const last = keys.pop()!
  const parent = keys.reduce<Record<string, unknown>>((o, k) => o[k] as Record<string, unknown>, obj as Record<string, unknown>)
  parent[last] = value
}

function badRequest(message: string, path?: string): never {
  throw createError({ statusCode: 400, statusMessage: 'Invalid input', data: { fields: [{ path: path ?? '', message }] } })
}

function conflict(message: string): never {
  throw createError({ statusCode: 409, statusMessage: message })
}

// Ids from the client are trusted only if they already exist in the stored
// draft for that same list; new items arrive without an id and get one here.
// Items that are live in the published version can't be removed, only
// deactivated. Order comes from sortOrder, then renumbered 1..n.
export function normalizeList<T extends ListItem>(
  incoming: T[],
  current: { id: string }[],
  publishedIds: Set<string>,
  prefix: string,
  path: string
): (Omit<T, 'id'> & { id: string })[] {
  const known = new Set(current.map((i) => i.id))
  const seen = new Set<string>()
  incoming.forEach((item, i) => {
    if (item.id === undefined) return
    if (!known.has(item.id)) badRequest('Unknown item id.', `${path}.${i}.id`)
    if (seen.has(item.id)) badRequest('Duplicate item id.', `${path}.${i}.id`)
    seen.add(item.id)
  })
  for (const id of known) {
    if (!seen.has(id) && publishedIds.has(id)) {
      badRequest('A published item cannot be removed — set it inactive instead.', path)
    }
  }
  return incoming
    .map((item, index) => ({ item, index }))
    .sort((a, b) => a.item.sortOrder - b.item.sortOrder || a.index - b.index)
    .map(({ item }, i) => ({ ...item, id: item.id ?? `${prefix}-${randomBytes(6).toString('hex')}`, sortOrder: i + 1 }))
}

export function activeOnly<T extends { active: boolean }>(list: T[]): Omit<T, 'active'>[] {
  return list.filter((i) => i.active).map(({ active: _a, ...rest }) => rest)
}

export function defineSingletonPage<Id extends string, C extends object, I = C>(cfg: SingletonPageConfig<Id, C>) {
  type Rec = SingletonRecord<Id, C>
  const KEY = `pages:${cfg.id}`
  const REVISION_PREFIX = `page-revisions:${cfg.id}`
  const revisionKey = (v: number) => `${REVISION_PREFIX}:v${String(v).padStart(4, '0')}`

  async function readRecord(): Promise<Rec> {
    const existing = await cmsStorage().getItem<Rec>(KEY)
    if (existing) return existing
    // First access seeds the dummy draft (never published).
    const now = new Date().toISOString()
    const seeded: Rec = {
      id: cfg.id,
      dummy: true,
      source: { kind: 'seed' },
      status: 'draft',
      draft: { version: 1, revision: 1, changedSincePublish: true, content: clone(cfg.dummyContent), updatedAt: now, updatedBy: SYSTEM },
      published: null,
      revisions: [],
      createdAt: now,
      updatedAt: now,
      updatedBy: SYSTEM,
      publishedAt: null,
      publishedBy: null
    }
    await cmsStorage().setItem(KEY, seeded)
    return seeded
  }

  // A fresh record holding migrated real content as an unpublished draft.
  // Used by the scripts/cms-migrate-*.mjs scripts; nothing is published.
  function buildMigratedRecord(content: C, version: string, now: string): Rec {
    const who: ActorRef = { id: 'system', name: `Migration ${version}` }
    return {
      id: cfg.id,
      dummy: false,
      source: { kind: 'migration', version, migratedAt: now },
      status: 'draft',
      draft: { version: 1, revision: 1, changedSincePublish: true, content: clone(content), updatedAt: now, updatedBy: who },
      published: null,
      revisions: [],
      createdAt: now,
      updatedAt: now,
      updatedBy: who,
      publishedAt: null,
      publishedBy: null
    }
  }

  function itemIds(c: C): Set<string> {
    const lists = cfg.lists.map((l) => (getPath(c, l.path) as { id: string }[] | undefined) ?? [])
    return new Set(lists.flat().map((i) => i.id))
  }

  function toAdminState(r: Rec): SingletonAdminState<Id, C> {
    return {
      id: r.id,
      dummy: r.dummy,
      source: r.source ?? { kind: 'seed' },
      status: r.status,
      draft: { version: r.draft.version, content: r.draft.content, updatedAt: r.draft.updatedAt, updatedBy: r.draft.updatedBy },
      published: r.published ? { version: r.published.version, publishedAt: r.published.publishedAt, publishedBy: r.published.publishedBy } : null,
      hasUnpublishedChanges: r.draft.changedSincePublish,
      publishedItemIds: r.published ? [...itemIds(r.published.content)] : [],
      revisions: r.revisions.slice(-10).reverse(),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      updatedBy: r.updatedBy,
      publishedAt: r.publishedAt,
      publishedBy: r.publishedBy
    }
  }

  function normalizeContent(input: I, current: C, publishedIds: Set<string>): C {
    const out = clone(input) as unknown as C
    for (const l of cfg.lists) {
      const incoming = (getPath(out, l.path) as ListItem[] | undefined) ?? []
      const existing = (getPath(current, l.path) as { id: string }[] | undefined) ?? []
      setPath(out, l.path, normalizeList(incoming, existing, publishedIds, l.prefix, l.path))
    }
    return out
  }

  function changedSections(a: C, b: C): string[] {
    return Object.keys(b).filter((k) => JSON.stringify((a as Record<string, unknown>)[k]) !== JSON.stringify((b as Record<string, unknown>)[k]))
  }

  async function getState() {
    const r = await readRecord()
    return { state: toAdminState(r), revision: r.draft.revision }
  }

  async function getDraftContent() {
    const r = await readRecord()
    return { version: r.draft.version, revision: r.draft.revision, content: r.draft.content, updatedAt: r.draft.updatedAt, status: r.status }
  }

  async function saveDraftUnlocked(event: H3Event, user: CmsUser, baseRevision: number, input: I) {
    const r = await readRecord()
    if (baseRevision !== r.draft.revision) {
      conflict('The draft was changed elsewhere. Reload to get the latest version.')
    }
    const publishedIds = r.published ? itemIds(r.published.content) : new Set<string>()
    const content = normalizeContent(input, r.draft.content, publishedIds)
    if (cfg.validate) await cfg.validate(content)
    const sections = changedSections(r.draft.content, content)
    if (sections.length === 0) {
      return { state: toAdminState(r), revision: r.draft.revision, changedSections: sections }
    }

    const now = new Date().toISOString()
    const who = actor(user)
    // First edit after a publish opens the next version number.
    const version = r.draft.changedSincePublish ? r.draft.version : (r.published?.version ?? 0) + 1
    r.draft = { version, revision: r.draft.revision + 1, changedSincePublish: true, content, updatedAt: now, updatedBy: who }
    r.updatedAt = now
    r.updatedBy = who
    await cmsStorage().setItem(KEY, r)
    await audit(event, { action: cfg.actions.update, entityType: 'page', entityId: cfg.id, metadata: { draftVersion: version, revision: r.draft.revision, changedSections: sections } })
    return { state: toAdminState(r), revision: r.draft.revision, changedSections: sections }
  }

  async function publishUnlocked(event: H3Event, user: CmsUser, revision: number) {
    const r = await readRecord()
    if (revision !== r.draft.revision) {
      conflict('The draft changed since you loaded it. Reload and review before publishing.')
    }
    const isLiveAndCurrent = r.status === 'published' && !r.draft.changedSincePublish
    if (isLiveAndCurrent) conflict('Nothing new to publish.')

    // Defense in depth: the stored draft must still satisfy the schema.
    const check = cfg.schema.safeParse(r.draft.content)
    if (!check.success) {
      throw createError({ statusCode: 422, statusMessage: 'Draft is not valid for publishing', data: { fields: check.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) } })
    }
    if (cfg.validate) await cfg.validate(r.draft.content)
    if (cfg.beforePublish) await cfg.beforePublish(r.draft.content)

    const now = new Date().toISOString()
    const who = actor(user)
    const fromStatus = r.status
    if (r.draft.changedSincePublish || !r.published) {
      r.published = { version: r.draft.version, content: clone(r.draft.content), publishedAt: now, publishedBy: who }
      r.revisions.push({ version: r.published.version, publishedAt: now, publishedBy: who })
      await cmsStorage().setItem(revisionKey(r.published.version), r.published)
    }
    // else: archived page with no new edits → the existing snapshot goes live again.
    r.status = 'published'
    r.draft.changedSincePublish = false
    r.draft.version = r.published.version
    r.publishedAt = r.published.publishedAt
    r.publishedBy = r.published.publishedBy
    r.updatedAt = now
    r.updatedBy = who
    await cmsStorage().setItem(KEY, r)
    await audit(event, { action: cfg.actions.publish, entityType: 'page', entityId: cfg.id, metadata: { version: r.published.version, fromStatus } })
    return { state: toAdminState(r), revision: r.draft.revision }
  }

  async function setStatusUnlocked(event: H3Event, user: CmsUser, to: 'draft' | 'archived') {
    const r = await readRecord()
    const from = r.status
    const allowed = to === 'draft' ? from === 'published' || from === 'archived' : from === 'draft' || from === 'published'
    if (!allowed) conflict(`Cannot move from ${from} to ${to}.`)

    const now = new Date().toISOString()
    r.status = to
    r.updatedAt = now
    r.updatedBy = actor(user)
    await cmsStorage().setItem(KEY, r)
    await audit(event, {
      action: to === 'archived' ? cfg.actions.archive : cfg.actions.unpublish,
      entityType: 'page',
      entityId: cfg.id,
      metadata: { fromStatus: from, toStatus: to, publishedVersion: r.published?.version ?? null }
    })
    return { state: toAdminState(r), revision: r.draft.revision }
  }

  // Every mutation runs under the record lock: the revision check and the
  // write are one step, across all server instances (storage.ts).
  const saveDraft = (...a: Parameters<typeof saveDraftUnlocked>) => withCmsLock(KEY, () => saveDraftUnlocked(...a))
  const publish = (...a: Parameters<typeof publishUnlocked>) => withCmsLock(KEY, () => publishUnlocked(...a))
  const setStatus = (...a: Parameters<typeof setStatusUnlocked>) => withCmsLock(KEY, () => setStatusUnlocked(...a))

  // Public read path: the published snapshot only, only while live, no
  // actor/workflow metadata. Each page filters the content itself (active
  // items, sub-flags). `dummy` lets the endpoint refuse to serve dev seed
  // content outside `nuxt dev`. Never reads the draft and never seeds.
  // Raw stored record for server-side relation checks. Never seeds.
  async function peekRecord(): Promise<Rec | null> {
    return (await cmsStorage().getItem<Rec>(KEY)) ?? null
  }

  async function getPublishedSnapshot() {
    const r = await cmsStorage().getItem<Rec>(KEY)
    if (!r || r.status !== 'published' || !r.published) return null
    return { dummy: r.dummy === true, version: r.published.version, publishedAt: r.published.publishedAt, content: r.published.content }
  }

  return {
    RECORD_KEY: KEY,
    REVISION_PREFIX,
    buildMigratedRecord,
    toAdminState,
    getState,
    getDraftContent,
    saveDraft,
    publish,
    setStatus,
    peekRecord,
    getPublishedSnapshot
  }
}

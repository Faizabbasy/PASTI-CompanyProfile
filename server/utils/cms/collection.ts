import { randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'
import type { ZodType } from 'zod'
import type { ActorRef, CollectionAdminState, PageSource, PageStatus, RecordLangStates } from '#shared/cms/fields'
import { langSuffix, normalizeList, type CmsLang } from './singletonPage'
import { applyLangSync, langSyncEmpty, langSyncOf, type LangSync } from './langSync'

export type { CollectionAdminState }
import type { AuditAction, CmsUser } from './types'

// Collection engine (Work projects, case studies). The same draft /
// published / revision model as the singleton engine, one record per item:
//
//   collections:<name>:<id>                    — the record (draft + published snapshot)
//   collection-revisions:<name>:<id>:vNNNN      — immutable published snapshots
//   collection-meta:<name>                      — dev-seed marker
//
// Save Draft only touches `draft`; Publish copies draft → published; the
// public read path only looks at `published` while status === 'published'.
// `draft.revision` is the optimistic-lock token (409 on mismatch).
// Records that were ever published are archived, never hard deleted.
//
// Bilingual (2026-10-27): every item has one record per language with the
// SAME id — English keeps the original keys, Indonesian lives at
// `collections:<name>@id:<id>` (revisions `collection-revisions:<name>@id:…`).
// Each language has its own draft / publish cycle; images and the
// `sharedPaths` fields follow the other language on every save (langSync.ts).
// Create makes both records; archive / restore / delete act on both. A
// record missing in one language (made before the split) is copied from the
// other the first time an admin opens it or lists the collection.

export interface CollectionRecord<C> {
  id: string
  dummy: boolean
  source?: PageSource
  // Server-owned values that are not content (e.g. a legacy deep-link anchor).
  meta: Record<string, string>
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
  createdBy: ActorRef
  updatedAt: string
  updatedBy: ActorRef
  publishedAt: string | null
  publishedBy: ActorRef | null
}

type Actions = { create: AuditAction; update: AuditAction; publish: AuditAction; unpublish: AuditAction; archive: AuditAction; delete: AuditAction }

export interface SaveContext<C> {
  event: H3Event
  user: CmsUser
  id: string
  lang: CmsLang
  // Stored draft before this save; null on create.
  current: C | null
}

export interface CollectionConfig<C> {
  name: string
  entityType: string
  idPrefix: string
  // Re-validates the stored draft at publish time (defense in depth).
  schema: ZodType
  lists: { path: string; prefix: string }[]
  actions: Actions
  dummyRecords?: { id: string; content: C; meta?: Record<string, string> }[]
  // After list normalization, before storing: may adjust the content
  // (e.g. downgrade claim status) and return audit side effects to run once
  // the record is stored. Throw an h3 error to reject.
  beforeSave?: (content: C, ctx: SaveContext<C>) => Promise<{ content: C; afterSave?: () => Promise<void> }>
  // Relation / uniqueness checks on save and again on publish. `lang` = the
  // language record being checked; relations are checked against records of
  // the same language.
  validate?: (content: C, ctx: { id: string; lang: CmsLang }) => Promise<void>
  beforePublish?: (rec: CollectionRecord<C>, lang: CmsLang) => Promise<void>
  beforeArchive?: (rec: CollectionRecord<C>, lang: CmsLang) => Promise<void>
  beforeDelete?: (rec: CollectionRecord<C>, lang: CmsLang) => Promise<void>
  // Language-neutral content paths (slug, relations, …), kept identical in
  // both languages on every save. Images always are.
  sharedPaths?: string[]
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

function conflict(message: string): never {
  throw createError({ statusCode: 409, statusMessage: message })
}
function notFound(): never {
  throw createError({ statusCode: 404, statusMessage: 'Not found' })
}

export const COLLECTION_ID = /^[a-z0-9][a-z0-9_-]{0,63}$/

// Admin list views: every record of both languages (missing twins copied
// first), keyed by id.
export async function readBothLangs<C>(c: { forLocale: (l: CmsLang) => { ensureSiblings: () => Promise<void>; readAll: () => Promise<CollectionRecord<C>[]> } }) {
  await Promise.all([c.forLocale('id').ensureSiblings(), c.forLocale('en').ensureSiblings()])
  const [id, en] = await Promise.all([c.forLocale('id').readAll(), c.forLocale('en').readAll()])
  return { id: new Map(id.map((r) => [r.id, r])), en: new Map(en.map((r) => [r.id, r])) }
}

// Both languages' state of one item, for the list badges.
export function collectionLangStates<C>(byLang: Record<CmsLang, Map<string, CollectionRecord<C>>>, id: string): RecordLangStates {
  const one = (r: CollectionRecord<C> | undefined) => (r ? { status: r.status, hasUnpublishedChanges: r.draft.changedSincePublish } : null)
  return { id: one(byLang.id.get(id)), en: one(byLang.en.get(id)) }
}

export const byCreated = <R extends { createdAt: string; id: string }>(a: R, b: R) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)

// The engine returned directly is the English one (unchanged behaviour for
// every existing caller); `forLocale(lang)` picks a language.
export function defineCollection<C extends object, I = C>(cfg: CollectionConfig<C>) {
  type Engine = CollectionEngine<C, I>
  let id: Engine | undefined
  const forLocale = (lang: CmsLang): Engine => (lang === 'id' ? (id ??= buildCollectionEngine<C, I>(cfg, 'id', forLocale)) : en)
  const en: Engine = buildCollectionEngine<C, I>(cfg, 'en', forLocale)
  return { ...en, forLocale }
}

type CollectionEngine<C extends object, I> = ReturnType<typeof buildCollectionEngine<C, I>>

function buildCollectionEngine<C extends object, I = C>(cfg: CollectionConfig<C>, lang: CmsLang, sibling: (lang: CmsLang) => CollectionEngine<C, I>) {
  type Rec = CollectionRecord<C>
  const other: CmsLang = lang === 'id' ? 'en' : 'id'
  const PREFIX = `collections:${cfg.name}${langSuffix(lang)}`
  const key = (id: string) => `${PREFIX}:${id}`
  const revisionKey = (id: string, v: number) => `collection-revisions:${cfg.name}${langSuffix(lang)}:${id}:v${String(v).padStart(4, '0')}`
  // One dev-seed marker for both languages (the English engine seeds).
  const META_KEY = `collection-meta:${cfg.name}`

  function freshRecord(id: string, content: C, who: ActorRef, now: string, extra: Partial<Rec> = {}): Rec {
    return {
      id,
      dummy: false,
      meta: {},
      status: 'draft',
      draft: { version: 1, revision: 1, changedSincePublish: true, content: clone(content), updatedAt: now, updatedBy: who },
      published: null,
      revisions: [],
      createdAt: now,
      createdBy: who,
      updatedAt: now,
      updatedBy: who,
      publishedAt: null,
      publishedBy: null,
      ...extra
    }
  }

  // First admin access seeds the dev dummy records once (never published).
  // The marker stops a re-seed after records are deleted or migrated.
  async function ensureSeeded(): Promise<void> {
    if (lang !== 'en') return sibling('en').ensureSeeded()
    if (!cfg.dummyRecords?.length) return
    if (await cmsStorage().getItem(META_KEY)) return
    const now = new Date().toISOString()
    for (const d of cfg.dummyRecords) {
      if (await cmsStorage().getItem(key(d.id))) continue
      await cmsStorage().setItem(key(d.id), freshRecord(d.id, d.content, SYSTEM, now, { dummy: true, source: { kind: 'seed' }, meta: d.meta ?? {} }))
    }
    await cmsStorage().setItem(META_KEY, { seededAt: now })
  }

  // A fresh record holding migrated real content as an unpublished draft
  // (scripts/cms-migrate-work.mjs). Nothing is published.
  function buildMigratedRecord(id: string, content: C, meta: Record<string, string>, version: string, now: string): Rec {
    const who: ActorRef = { id: 'system', name: `Migration ${version}` }
    return freshRecord(id, content, who, now, { source: { kind: 'migration', version, migratedAt: now }, meta })
  }

  async function readAll(): Promise<Rec[]> {
    const keys = await cmsStorage().getKeys(PREFIX)
    const recs = await Promise.all(keys.map((k) => cmsStorage().getItem<Rec>(k)))
    return recs.filter((r): r is Rec => !!r).sort(byCreated)
  }

  async function peek(id: string): Promise<Rec | null> {
    if (!COLLECTION_ID.test(id)) return null
    return (await cmsStorage().getItem<Rec>(key(id))) ?? null
  }

  async function read(id: string): Promise<Rec> {
    const r = (await peek(id)) ?? (await materialize(id))
    if (!r) notFound()
    return r
  }

  // This language's record for an item that so far exists only in the other
  // language: a copy of the other draft (not published), to translate.
  async function materializeUnlocked(id: string): Promise<Rec | null> {
    const existing = await peek(id)
    if (existing) return existing
    const src = await sibling(other).peek(id)
    if (!src) return null
    const r = freshRecord(id, src.draft.content, src.createdBy, src.draft.updatedAt, {
      dummy: src.dummy,
      ...(src.source ? { source: clone(src.source) } : {}),
      meta: clone(src.meta),
      status: src.status === 'archived' ? 'archived' : 'draft',
      createdAt: src.createdAt,
      updatedBy: src.draft.updatedBy
    })
    await cmsStorage().setItem(key(id), r)
    return r
  }
  const materialize = (id: string): Promise<Rec | null> => (COLLECTION_ID.test(id) ? withCmsLock(key(id), () => materializeUnlocked(id)) : Promise.resolve(null))

  // Admin list views: make sure every item of the other language has a
  // record here too (cheap when nothing is missing).
  async function ensureSiblings() {
    const [mine, theirs] = await Promise.all([cmsStorage().getKeys(PREFIX), cmsStorage().getKeys(sibling(other).PREFIX)])
    const idOf = (k: string) => k.slice(k.lastIndexOf(':') + 1)
    const have = new Set(mine.map(idOf))
    for (const k of theirs) if (!have.has(idOf(k))) await materialize(idOf(k))
  }

  function itemIds(c: C): Set<string> {
    const lists = cfg.lists.map((l) => (getPath(c, l.path) as { id: string }[] | undefined) ?? [])
    return new Set(lists.flat().map((i) => i.id))
  }

  function toAdminState<X>(r: Rec, extra: X): CollectionAdminState<C, X> {
    return {
      id: r.id,
      dummy: r.dummy,
      source: r.source ?? { kind: 'seed' },
      status: r.status,
      meta: r.meta,
      draft: { version: r.draft.version, content: r.draft.content, updatedAt: r.draft.updatedAt, updatedBy: r.draft.updatedBy },
      published: r.published ? { version: r.published.version, publishedAt: r.published.publishedAt, publishedBy: r.published.publishedBy } : null,
      hasUnpublishedChanges: r.draft.changedSincePublish,
      publishedItemIds: r.published ? [...itemIds(r.published.content)] : [],
      revisions: r.revisions.slice(-10).reverse(),
      createdAt: r.createdAt,
      createdBy: r.createdBy,
      updatedAt: r.updatedAt,
      updatedBy: r.updatedBy,
      publishedAt: r.publishedAt,
      publishedBy: r.publishedBy,
      extra
    }
  }

  function normalizeContent(input: I, current: C | null, publishedIds: Set<string>): C {
    const out = clone(input) as unknown as C
    for (const l of cfg.lists) {
      const incoming = (getPath(out, l.path) as { id?: string; sortOrder: number }[] | undefined) ?? []
      const existing = current ? ((getPath(current, l.path) as { id: string }[] | undefined) ?? []) : []
      setPath(out, l.path, normalizeList(incoming, existing, publishedIds, l.prefix, l.path))
    }
    return out
  }

  function changedSections(a: C, b: C): string[] {
    return Object.keys(b).filter((k) => JSON.stringify((a as Record<string, unknown>)[k]) !== JSON.stringify((b as Record<string, unknown>)[k]))
  }

  // Creates the item in this language and its copy in the other one.
  async function create(event: H3Event, user: CmsUser, input: I) {
    const id = `${cfg.idPrefix}-${randomBytes(6).toString('hex')}`
    let content = normalizeContent(input, null, new Set())
    let afterSave: (() => Promise<void>) | undefined
    if (cfg.beforeSave) ({ content, afterSave } = await cfg.beforeSave(content, { event, user, id, lang, current: null }))
    if (cfg.validate) await cfg.validate(content, { id, lang })
    const now = new Date().toISOString()
    const r = freshRecord(id, content, actor(user), now)
    await cmsStorage().setItem(key(id), r)
    await audit(event, { action: cfg.actions.create, entityType: cfg.entityType, entityId: id, metadata: { lang, revision: 1 } })
    await afterSave?.()
    await sibling(other).materialize(id)
    return r
  }

  async function saveDraftUnlocked(event: H3Event, user: CmsUser, id: string, baseRevision: number, input: I) {
    const r = await read(id)
    if (baseRevision !== r.draft.revision) conflict('This record was changed elsewhere. Reload to get the latest version.')
    const publishedIds = r.published ? itemIds(r.published.content) : new Set<string>()
    let content = normalizeContent(input, r.draft.content, publishedIds)
    let afterSave: (() => Promise<void>) | undefined
    if (cfg.beforeSave) ({ content, afterSave } = await cfg.beforeSave(content, { event, user, id, lang, current: r.draft.content }))
    if (cfg.validate) await cfg.validate(content, { id, lang })

    const sections = changedSections(r.draft.content, content)
    if (sections.length === 0) return { record: r, changedSections: sections, sync: null as LangSync | null }
    const sync = langSyncOf(r.draft.content, content, cfg.sharedPaths)

    const now = new Date().toISOString()
    const who = actor(user)
    const version = r.draft.changedSincePublish ? r.draft.version : (r.published?.version ?? 0) + 1
    r.draft = { version, revision: r.draft.revision + 1, changedSincePublish: true, content, updatedAt: now, updatedBy: who }
    r.updatedAt = now
    r.updatedBy = who
    await cmsStorage().setItem(key(id), r)
    await audit(event, { action: cfg.actions.update, entityType: cfg.entityType, entityId: id, metadata: { lang, draftVersion: version, revision: r.draft.revision, changedSections: sections } })
    await afterSave?.()
    return { record: r, changedSections: sections, sync }
  }

  // The other language saved an image / shared-field change: copy it into
  // this draft (normal version / revision rules, so an editor open on this
  // language gets the usual reload prompt). Returns images changed.
  async function syncFromUnlocked(event: H3Event, user: CmsUser, id: string, from: CmsLang, sync: LangSync, source: C): Promise<number> {
    const r = await peek(id)
    if (!r) return 0
    const content = clone(r.draft.content)
    const { images, fields } = applyLangSync(content, source, sync)
    if (images + fields === 0) return 0
    const sections = changedSections(r.draft.content, content)
    const now = new Date().toISOString()
    const who = actor(user)
    const version = r.draft.changedSincePublish ? r.draft.version : (r.published?.version ?? 0) + 1
    r.draft = { version, revision: r.draft.revision + 1, changedSincePublish: true, content, updatedAt: now, updatedBy: who }
    r.updatedAt = now
    r.updatedBy = who
    await cmsStorage().setItem(key(id), r)
    await audit(event, { action: cfg.actions.update, entityType: cfg.entityType, entityId: id, metadata: { lang, syncedFrom: from, mediaSynced: images, fieldsSynced: fields, draftVersion: version, revision: r.draft.revision, changedSections: sections } })
    return images
  }

  async function publishUnlocked(event: H3Event, user: CmsUser, id: string, revision: number) {
    const r = await read(id)
    if (revision !== r.draft.revision) conflict('The draft changed since you loaded it. Reload and review before publishing.')
    if (r.status === 'published' && !r.draft.changedSincePublish) conflict('Nothing new to publish.')

    const check = cfg.schema.safeParse(r.draft.content)
    if (!check.success) {
      throw createError({ statusCode: 422, statusMessage: 'Draft is not valid for publishing', data: { fields: check.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) } })
    }
    if (cfg.validate) await cfg.validate(r.draft.content, { id, lang })
    if (cfg.beforePublish) await cfg.beforePublish(r, lang)

    const now = new Date().toISOString()
    const who = actor(user)
    const fromStatus = r.status
    if (r.draft.changedSincePublish || !r.published) {
      r.published = { version: r.draft.version, content: clone(r.draft.content), publishedAt: now, publishedBy: who }
      r.revisions.push({ version: r.published.version, publishedAt: now, publishedBy: who })
      await cmsStorage().setItem(revisionKey(id, r.published.version), r.published)
    }
    r.status = 'published'
    r.draft.changedSincePublish = false
    r.draft.version = r.published.version
    r.publishedAt = r.published.publishedAt
    r.publishedBy = r.published.publishedBy
    r.updatedAt = now
    r.updatedBy = who
    await cmsStorage().setItem(key(id), r)
    await audit(event, { action: cfg.actions.publish, entityType: cfg.entityType, entityId: id, metadata: { lang, version: r.published.version, fromStatus } })
    return r
  }

  async function setStatusUnlocked(event: H3Event, user: CmsUser, id: string, to: 'draft' | 'archived') {
    const r = await read(id)
    const from = r.status
    const allowed = to === 'draft' ? from === 'published' || from === 'archived' : from === 'draft' || from === 'published'
    if (!allowed) conflict(`Cannot move from ${from} to ${to}.`)
    if (to === 'archived' && cfg.beforeArchive) await cfg.beforeArchive(r, lang)
    const now = new Date().toISOString()
    r.status = to
    r.updatedAt = now
    r.updatedBy = actor(user)
    await cmsStorage().setItem(key(id), r)
    await audit(event, {
      action: to === 'archived' ? cfg.actions.archive : cfg.actions.unpublish,
      entityType: cfg.entityType,
      entityId: id,
      metadata: { lang, fromStatus: from, toStatus: to, publishedVersion: r.published?.version ?? null }
    })
    return { record: r, from }
  }

  // Only records that never had public history can be removed.
  function assertDeletable(r: Rec) {
    if (r.published || r.revisions.length || r.status !== 'draft') conflict('This record has been published — archive it instead.')
  }
  async function hardDeleteUnlocked(event: H3Event, id: string) {
    const r = await read(id)
    assertDeletable(r)
    if (cfg.beforeDelete) await cfg.beforeDelete(r, lang)
    await cmsStorage().removeItem(key(id))
    await audit(event, { action: cfg.actions.delete, entityType: cfg.entityType, entityId: id, metadata: { lang, dummy: r.dummy } })
  }

  // Every mutation of a record runs under that record's lock: the revision
  // check and the write are one step, across all server instances. Work on
  // the other language runs after this record's lock is released.
  const publish = (...a: Parameters<typeof publishUnlocked>) => withCmsLock(key(a[2]), () => publishUnlocked(...a))
  const syncFrom = (...a: Parameters<typeof syncFromUnlocked>) => withCmsLock(key(a[2]), () => syncFromUnlocked(...a))
  const setStatusOne = (...a: Parameters<typeof setStatusUnlocked>) => withCmsLock(key(a[2]), () => setStatusUnlocked(...a))
  const hardDeleteOne = (...a: Parameters<typeof hardDeleteUnlocked>) => withCmsLock(key(a[1]), () => hardDeleteUnlocked(...a))

  // Save, then copy images / shared fields to the other language. A failed
  // sync never undoes the save; `mediaSynced` = images copied there.
  async function saveDraft(...a: Parameters<typeof saveDraftUnlocked>) {
    const { sync, ...result } = await withCmsLock(key(a[2]), () => saveDraftUnlocked(...a))
    let mediaSynced = 0
    if (sync && !langSyncEmpty(sync)) {
      const twin = sibling(other)
      try {
        if (await twin.peek(a[2])) mediaSynced = await twin.syncFrom(a[0], a[1], a[2], lang, sync, result.record.draft.content)
        else await twin.materialize(a[2])
      } catch (err) {
        console.error(`[cms] language sync ${cfg.name}/${a[2]} ${lang} → ${other} failed`, err)
      }
    }
    return { ...result, mediaSynced }
  }

  // Unpublish is per language. Archive and restore (out of archived) act on
  // the item, so both languages move; archive checks both before touching
  // either.
  async function setStatus(event: H3Event, user: CmsUser, id: string, to: 'draft' | 'archived') {
    const twin = sibling(other)
    if (to === 'archived') {
      const t = await twin.peek(id)
      if (t && t.status !== 'archived' && cfg.beforeArchive) await cfg.beforeArchive(t, other)
    }
    const { record, from } = await setStatusOne(event, user, id, to)
    const t = await twin.peek(id)
    if (t && (to === 'archived' ? t.status !== 'archived' : from === 'archived' && t.status === 'archived')) {
      await twin.setStatusOne(event, user, id, to)
    }
    return record
  }

  // Both languages go, and only if neither was ever published.
  async function hardDelete(event: H3Event, id: string) {
    const twin = sibling(other)
    const t = await twin.peek(id)
    if (t) {
      assertDeletable(t)
      if (cfg.beforeDelete) await cfg.beforeDelete(t, other)
    }
    await hardDeleteOne(event, id)
    if (t) await twin.hardDeleteOne(event, id)
  }

  // Public read path: published snapshots of live records only, no actor or
  // workflow metadata. Never reads drafts and never seeds.
  async function getPublishedAll() {
    const recs = await readAll()
    return recs
      .filter((r) => r.status === 'published' && r.published)
      .map((r) => ({ id: r.id, dummy: r.dummy === true, meta: r.meta, version: r.published!.version, publishedAt: r.publishedAt ?? null, content: r.published!.content }))
  }

  return {
    lang,
    PREFIX,
    META_KEY,
    revisionKey,
    ensureSeeded,
    buildMigratedRecord,
    readAll,
    peek,
    read,
    materialize,
    ensureSiblings,
    toAdminState,
    create,
    saveDraft,
    syncFrom,
    publish,
    setStatus,
    setStatusOne,
    hardDelete,
    hardDeleteOne,
    getPublishedAll
  }
}

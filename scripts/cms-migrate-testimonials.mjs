#!/usr/bin/env node
// Migrate the CURRENT site testimonials into the shared Testimonials
// collection as unpublished drafts.
//   npm run cms:migrate-testimonials [-- --dry-run] [-- --force]
//
// - Source of truth: useTestimonials() — the four quotes the site shows
//   today (Home ring; one is picked by the Creative page). Loaded from the
//   real, unmodified composable. Placeholder slots are skipped.
// - Nothing is rewritten: quote, name and photo verbatim. The role line is
//   split into job title + company only through the reviewed table in
//   shared/utils/testimonialMigration.ts; each part must appear verbatim and
//   in order in today's line, and the exact line is kept as
//   meta.legacyRoleLine. No client link, category or tag is inferred.
// - Approval: `confirmed` only where the source records explicit owner
//   verification incl. public-display consent (useTestimonials status
//   `verified`, owner confirmation 2026-10-16); anything else →
//   `needs_approval`. Records stay drafts: nothing is published, so nothing
//   becomes public until an ADMIN publishes.
// - Ids: tst-<name-slug> — the same names the Creative page's temporary
//   refs (t:<slug>) use, so those references resolve to these records.
// - Dev seed (dummy) records and their snapshots are removed, and the seed
//   marker is set so they never return.
// - Writes the local dev CMS store (.data/cms). Never touches Home, any page
//   record, the public flag or legacy source files. Not an HTTP endpoint.
//
// Re-running is safe: unchanged records are left alone; a record edited or
// published in the CMS is never overwritten (--force replaces an edited,
// never-published draft only).

import { createJiti } from 'jiti'
import { openCmsStore } from './lib/cms-store.mjs'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = new Set(process.argv.slice(2))
const DRY = args.has('--dry-run')
const FORCE = args.has('--force')
const TAG = '[migrate-testimonials]'
const fail = (msg) => {
  console.error(`${TAG} ${msg} — nothing written.`)
  process.exit(1)
}

if (process.env.NODE_ENV === 'production') {
  console.error(`${TAG} Refusing to run with NODE_ENV=production — this targets the local dev CMS store only.`)
  process.exit(1)
}

const jiti = createJiti(import.meta.url, { alias: { '#shared': resolve(root, 'shared'), '~': resolve(root, 'app') }, interopDefault: true })
const load = (p) => jiti.import(resolve(root, p))

const { useTestimonials } = await load('app/composables/useTestimonials.ts')
const { useClients } = await load('app/composables/useClients.ts')
const { TestimonialContentSchema, TESTIMONIAL_CLIENT_REFS } = await load('shared/utils/testimonialSchema.ts')
const { legacyToTestimonial, LEGACY_ROLE_SPLIT, TESTIMONIALS_MIGRATION_VERSION, TESTIMONIALS_DUMMY_MARKERS } = await load('shared/utils/testimonialMigration.ts')
const { CREATIVE_TESTIMONIAL_REFS } = await load('shared/utils/creativeSchema.ts')
const { testimonialApprovalHash } = await load('server/utils/cms/testimonialApproval.ts')

// The temporary client allowlist must match the code's shared client list.
const clientSlugs = useClients().clients.map((c) => (c.logo ?? '').replace(/^\/logos\/clients\//, '').replace(/\.webp$/, '')).filter(Boolean)
if (JSON.stringify([...clientSlugs].sort()) !== JSON.stringify([...TESTIMONIAL_CLIENT_REFS].sort())) fail('TESTIMONIAL_CLIENT_REFS is out of sync with useClients()')

const legacy = useTestimonials().testimonials.filter((t) => t.status !== 'placeholder')
const migrated = legacy.map((t, i) => {
  const rec = legacyToTestimonial(t, i)
  const split = LEGACY_ROLE_SPLIT[t.role]
  if (!split) fail(`No reviewed role split for "${t.role}"`)
  const at = t.role.indexOf(split.roleTitle)
  if (at !== 0 || t.role.indexOf(split.companyDisplayName, at + split.roleTitle.length) < 0) fail(`Role split for "${t.role}" is not verbatim`)
  if (t.photo && !existsSync(join(root, 'public', ...t.photo.split('/').filter(Boolean)))) fail(`Photo missing: ${t.photo}`)
  const parsed = TestimonialContentSchema.safeParse(rec.content)
  if (!parsed.success) fail(`"${t.name}" fails the Testimonial schema: ${parsed.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ')}`)
  if (rec.content.quote !== t.quote || rec.content.personName !== t.name || rec.content.photo !== (t.photo ?? '')) fail(`"${t.name}" was not copied verbatim`)
  const confirmed = t.status === 'verified'
  return {
    ...rec,
    approval: confirmed ? 'confirmed' : 'needs_approval',
    meta: {
      ...rec.meta,
      approval: confirmed ? 'confirmed' : 'needs_approval',
      approvedHash: confirmed ? testimonialApprovalHash(rec.content) : '',
      approvalByName: confirmed ? 'Migration — owner confirmation 2026-10-16' : '',
      legacyStatus: t.status
    }
  }
})
const text = JSON.stringify(migrated.map((m) => m.content))
const leftovers = TESTIMONIALS_DUMMY_MARKERS.filter((m) => text.includes(m))
if (leftovers.length) fail(`Dummy markers found (${leftovers.join(', ')})`)
if (new Set(migrated.map((m) => m.id)).size !== migrated.length) fail('Duplicate ids')
// Creative's temporary refs must point at migrated records.
for (const ref of CREATIVE_TESTIMONIAL_REFS) if (!migrated.some((m) => m.id === `tst-${ref.slice(2)}`)) fail(`Creative ref ${ref} has no migrated record`)

const storage = await openCmsStore(root)
const PREFIX = 'collections:testimonials'
const now = new Date().toISOString()
const plan = []
for (const m of migrated) {
  const existing = await storage.getItem(`${PREFIX}:${m.id}`)
  if (!existing) { plan.push({ m, action: 'create' }); continue }
  const same = existing.source?.kind === 'migration' && existing.source.version === TESTIMONIALS_MIGRATION_VERSION && JSON.stringify(existing.draft.content) === JSON.stringify(m.content)
  if (same) { plan.push({ m, action: 'unchanged' }); continue }
  if (existing.published || existing.revisions?.length) fail(`"${m.content.personName}" already has a published version in the CMS — resolve it there`)
  if (!existing.dummy && !FORCE) fail(`"${m.content.personName}" holds an edited draft — re-run with --force to replace it`)
  plan.push({ m, action: 'replace' })
}
const strayKeys = []
for (const k of await storage.getKeys(PREFIX)) {
  const r = await storage.getItem(k)
  if (r?.dummy) strayKeys.push({ k, id: r.id })
}

const summary = {
  version: TESTIMONIALS_MIGRATION_VERSION,
  records: plan.map((p) => ({ id: p.m.id, person: p.m.content.personName, roleTitle: p.m.content.roleTitle, company: p.m.content.companyDisplayName, approval: p.m.approval, action: p.action })),
  removeDummies: strayKeys.map((s) => s.id)
}
if (DRY) {
  console.log(`${TAG} Dry run — would write:`, JSON.stringify(summary, null, 2))
  process.exit(0)
}
if (plan.every((p) => p.action === 'unchanged') && !strayKeys.length) {
  console.log(`${TAG} Already migrated (${TESTIMONIALS_MIGRATION_VERSION}); nothing to do.`)
  process.exit(0)
}

const who = { id: 'system', name: `Migration ${TESTIMONIALS_MIGRATION_VERSION}` }
for (const p of plan.filter((x) => x.action !== 'unchanged')) {
  const { m } = p
  await storage.setItem(`${PREFIX}:${m.id}`, {
    id: m.id,
    dummy: false,
    source: { kind: 'migration', version: TESTIMONIALS_MIGRATION_VERSION, migratedAt: now },
    meta: { ...m.meta, approvalAt: m.approval === 'confirmed' ? now : '' },
    status: 'draft',
    draft: { version: 1, revision: 1, changedSincePublish: true, content: m.content, updatedAt: now, updatedBy: who },
    published: null,
    revisions: [],
    createdAt: now,
    createdBy: who,
    updatedAt: now,
    updatedBy: who,
    publishedAt: null,
    publishedBy: null
  })
}
for (const s of strayKeys) {
  await storage.removeItem(s.k)
  for (const rk of await storage.getKeys(`collection-revisions:testimonials:${s.id}`)) await storage.removeItem(rk)
}
await storage.setItem('collection-meta:testimonials', { seededAt: now, migrated: TESTIMONIALS_MIGRATION_VERSION })

const entry = {
  id: randomUUID(),
  userId: null,
  action: 'testimonial.migrate',
  entityType: 'testimonial',
  entityId: null,
  timestamp: now,
  metadata: {
    version: TESTIMONIALS_MIGRATION_VERSION,
    source: 'useTestimonials (current site)',
    records: summary.records.map((r) => ({ id: r.id, approval: r.approval, action: r.action })),
    removedDummies: summary.removeDummies,
    status: 'draft (not published)'
  }
}
await storage.setItem(`audit:${now.replace(/[:.]/g, '')}-${entry.id.slice(0, 8)}`, entry)

console.log(`${TAG} Migrated ${TESTIMONIALS_MIGRATION_VERSION} (drafts, not published).`)
console.log(JSON.stringify(summary, null, 2))

#!/usr/bin/env node
// Migrate the CURRENT public Contact wording into the Contact CMS as an
// unpublished draft.  npm run cms:migrate-contact [-- --dry-run] [-- --force]
//
// - Source of truth: what /contact renders today. The script runs the real
//   legacy builder (buildLegacyContactContent → useContact hero copy, the
//   Hero/Form template wording, pageSeo.contact) — no copy is duplicated here.
// - Only page-specific wording is migrated. Shared company contact data
//   (WhatsApp number, email, address, maps link, entity, socials) stays in
//   its shared source and is never written to the CMS record.
// - Transform: shared/utils/contactMigration.ts (pure, deterministic).
// - Validate: shared/utils/contactSchema.ts (the schema the API enforces),
//   plus a round trip: the migrated record run through the public adapter
//   must reproduce today's page wording exactly.
// - Write: the local dev CMS store (.data/cms, same fs driver as
//   nuxt.config.ts nitro.storage.cms) as a draft. Never publishes, never
//   touches the public flag, never edits legacy source files.
//
// Not an HTTP endpoint: it only runs from a developer's shell with
// filesystem access to the store.
//
// Re-running is safe:
//   - record already holds this migration and the draft is unchanged → no-op
//   - record is dev seed (dummy) data → replaced entirely (dummy draft, dummy
//     published snapshot and dummy revisions removed)
//   - record holds real content that was edited or published → refused;
//     pass --force to replace an edited, never-published draft

import { createJiti } from 'jiti'
import { openCmsStore } from './lib/cms-store.mjs'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { isDeepStrictEqual } from 'node:util'

// --lang id → build and write the Indonesian record (default: English, the original record).
const LANG = process.argv.includes('--lang') && process.argv[process.argv.indexOf('--lang') + 1] === 'id' ? 'id' : 'en'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = new Set(process.argv.slice(2))
const DRY = args.has('--dry-run')
const FORCE = args.has('--force')
const TAG = '[migrate-contact]'

if (process.env.NODE_ENV === 'production') {
  console.error(`${TAG} Refusing to run with NODE_ENV=production — this targets the local dev CMS store only.`)
  process.exit(1)
}

const jiti = createJiti(import.meta.url, {
  alias: { '#shared': resolve(root, 'shared'), '~': resolve(root, 'app') },
  interopDefault: true
})
const load = (p) => jiti.import(resolve(root, p))
await (await import('./lib/nuxt-shims.mjs')).installNuxtShims(load, LANG)

// The legacy composables call each other through Nuxt auto-imports; provide
// those names as globals so the real, unmodified files run as-is.
const { useFinalCta } = await load('app/composables/useFinalCta.ts')
const { useWhatsapp } = await load('app/composables/useWhatsapp.ts')
const { useServices } = await load('app/composables/useServices.ts')
const { pageSeo } = await load('app/composables/useSeo.ts')
Object.assign(globalThis, { useFinalCta, useWhatsapp, useServices, pageSeo })
const { useFooter } = await load('app/composables/useFooter.ts')
globalThis.useFooter = useFooter
const { useContact } = await load('app/composables/useContact.ts')
globalThis.useContact = useContact

const { buildLegacyContactContent, adaptContactCms } = await load('app/composables/useContactPage.ts')
const { legacyToContactContent, CONTACT_MIGRATION_VERSION, CONTACT_DUMMY_MARKERS } = await load('shared/utils/contactMigration.ts')
const MIG_VERSION = LANG === 'id' ? CONTACT_MIGRATION_VERSION.replace('-v', '-id-v') : CONTACT_MIGRATION_VERSION
const { ContactContentSchema } = await load('shared/utils/contactSchema.ts')
// The record for the chosen language (--lang id → Indonesian; default English = the original record).
const { contactFor } = await load('server/utils/cms/contactPage.ts')
const _engine = contactFor(LANG)
const buildMigratedContactRecord = _engine.buildMigratedRecord
const CONTACT_RECORD_KEY = _engine.RECORD_KEY
const CONTACT_REVISION_PREFIX = _engine.REVISION_PREFIX

// Same origin usePageSeo() builds the canonical from (runtimeConfig.public.siteUrl).
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://www.pastipeople.id').replace(/\/+$/, '')

const legacy = buildLegacyContactContent()
const content = legacyToContactContent(legacy, { canonicalUrl: `${siteUrl}/contact` })

const parsed = ContactContentSchema.safeParse(content)
if (!parsed.success) {
  console.error(`${TAG} Migrated content fails the Contact schema — nothing written:`)
  for (const i of parsed.error.issues) console.error(`  - ${i.path.join('.')}: ${i.message}`)
  process.exit(1)
}
const text = JSON.stringify(content)
const leftovers = CONTACT_DUMMY_MARKERS.filter((m) => text.includes(m))
if (leftovers.length) {
  console.error(`${TAG} Dummy markers found in migrated content (${leftovers.join(', ')}) — nothing written.`)
  process.exit(1)
}

// Shared company data must never be copied into the page record.
const { contact } = useContact()
const sharedValues = [contact.whatsappDisplay, contact.email, contact.address, contact.entity].filter(Boolean)
const copied = sharedValues.filter((v) => text.includes(v))
if (copied.length) {
  console.error(`${TAG} Shared contact data found in the page record (${copied.join(', ')}) — nothing written.`)
  process.exit(1)
}

// Round trip: the migrated record through the public adapter must give back
// exactly today's wording (canonical = the default page URL).
const adapted = adaptContactCms(legacy, { version: 1, content })
const strip = (c) => {
  const x = JSON.parse(JSON.stringify(c))
  delete x.source
  delete x.cmsVersion
  delete x.seo.canonical
  return x
}
if (adapted.seo.canonical && adapted.seo.canonical !== `${siteUrl}/contact`) {
  console.error(`${TAG} Canonical differs from the default page URL — nothing written.`)
  process.exit(1)
}
if (!isDeepStrictEqual(strip(adapted), strip(legacy))) {
  const a = strip(adapted), b = strip(legacy)
  for (const k of Object.keys(b)) if (!isDeepStrictEqual(a[k], b[k])) console.error(`${TAG} section "${k}" does not round-trip:\n  cms:    ${JSON.stringify(a[k]).slice(0, 400)}\n  legacy: ${JSON.stringify(b[k]).slice(0, 400)}`)
  console.error(`${TAG} Migrated content would not reproduce today's page — nothing written.`)
  process.exit(1)
}

const summary = {
  version: MIG_VERSION,
  headline: content.hero.headline,
  formTitle: content.form.title,
  fields: Object.fromEntries(Object.entries(content.form.fields).map(([k, f]) => [k, f.label])),
  seo: content.seo.metaTitle,
  roundTrip: 'identical to the current page'
}

const storage = await openCmsStore(root)
const existing = await storage.getItem(CONTACT_RECORD_KEY)

const sameMigration = existing?.source?.kind === 'migration' && existing.source.version === MIG_VERSION
if (sameMigration && JSON.stringify(existing.draft.content) === text) {
  console.log(`${TAG} Already migrated (${MIG_VERSION}); draft unchanged — nothing to do.`)
  process.exit(0)
}
if (existing && existing.dummy === false) {
  if (existing.published) {
    console.error(`${TAG} The Contact record holds real content with a published version — refusing to overwrite. Resolve this in the CMS instead.`)
    process.exit(2)
  }
  if (!FORCE) {
    console.error(`${TAG} The Contact draft holds real content that differs from this migration (edited after migrating?). Re-run with --force to replace the draft.`)
    process.exit(2)
  }
}

if (DRY) {
  console.log(`${TAG} Dry run — would write:`, JSON.stringify(summary, null, 2))
  process.exit(0)
}

const now = new Date().toISOString()
const record = buildMigratedContactRecord(content, MIG_VERSION, now)

// Remove the dev-seed snapshot history so no dummy version survives.
const revisionKeys = await storage.getKeys(CONTACT_REVISION_PREFIX)
for (const k of revisionKeys) await storage.removeItem(k)
await storage.setItem(CONTACT_RECORD_KEY, record)

const entry = {
  id: randomUUID(),
  userId: null,
  action: 'contact.migrate',
  entityType: 'page',
  entityId: 'contact',
  timestamp: now,
  metadata: {
    version: MIG_VERSION,
    source: 'legacy Contact (useContact hero copy + Hero/Form template wording) + pageSeo.contact',
    replaced: existing ? (existing.dummy ? 'dummy seed record' : 'real draft (--force)') : 'none',
    removedRevisions: revisionKeys.length,
    status: 'draft (not published)'
  }
}
await storage.setItem(`audit:${now.replace(/[:.]/g, '')}-${entry.id.slice(0, 8)}`, entry)

console.log(`${TAG} Migrated ${MIG_VERSION} into the Contact draft (status: draft, not published).`)
console.log(JSON.stringify({ ...summary, replaced: entry.metadata.replaced, removedRevisions: revisionKeys.length }, null, 2))

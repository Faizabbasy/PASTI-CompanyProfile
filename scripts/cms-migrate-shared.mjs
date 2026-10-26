#!/usr/bin/env node
// Migrate the CURRENT code content of a Shared Content record (Clients, FAQs,
// Global CTAs) into its CMS record as an unpublished draft.
//   npm run cms:migrate-clients | cms:migrate-faqs | cms:migrate-ctas
//   (add -- --dry-run to only check, -- --force to replace an edited draft)
//
// - Source of truth: what the site renders today — the code composables
//   (codeClients, codeFaq, codeFinalCta + useFooter's contact facts).
// - Validate: the content schema the API enforces, plus a round trip: the
//   migrated content through the public adapter must reproduce today's data.
// - Write: the CMS store (Postgres when NUXT_CMS_DATABASE_URL is set, else
//   .data/cms) as a draft. Never publishes, never touches the public flag.
// Re-running is safe (same rules as cms-migrate-product.mjs).

import { createJiti } from 'jiti'
import { openCmsStore } from './lib/cms-store.mjs'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { isDeepStrictEqual } from 'node:util'

const NAMES = { clients: 'Clients', faqs: 'FAQs', ctas: 'Global CTAs' }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [id, ...rest] = process.argv.slice(2)
const args = new Set(rest)
const DRY = args.has('--dry-run')
const FORCE = args.has('--force')
if (!NAMES[id]) {
  console.error(`[migrate-shared] Usage: node scripts/cms-migrate-shared.mjs <${Object.keys(NAMES).join('|')}> [--dry-run] [--force]`)
  process.exit(1)
}
const NAME = NAMES[id]
const TAG = `[migrate-${id}]`
const VERSION = `${id}-v1`

if (process.env.NODE_ENV === 'production') {
  console.error(`${TAG} Refusing to run with NODE_ENV=production.`)
  process.exit(1)
}

const jiti = createJiti(import.meta.url, {
  alias: { '#shared': resolve(root, 'shared'), '~': resolve(root, 'app') },
  interopDefault: true
})
const load = (p) => jiti.import(resolve(root, p))

const schemas = await load('shared/utils/sharedContentSchema.ts')
const source = await load('app/composables/useSharedContentSource.ts')
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

let content, schema, roundTrip
if (id === 'clients') {
  const { codeClients } = await load('app/composables/useClients.ts')
  const code = codeClients().clients.filter((c) => c.logo)
  content = { items: code.map((c, i) => ({ id: `cli-${slug(c.name)}`, name: c.name, logo: c.logo, ratio: c.ratio, sortOrder: i + 1, active: c.trusted })) }
  schema = schemas.ClientsContentSchema
  // What the pages show today (trusted + logo) vs. what the CMS would serve.
  roundTrip = () => [
    code.filter((c) => c.trusted).map((c) => ({ name: c.name, logo: c.logo, ratio: c.ratio })),
    adaptPublic(source.clientsSource, content)
  ]
} else if (id === 'faqs') {
  const { codeFaq } = await load('app/composables/useFaq.ts')
  const code = codeFaq().items
  content = { items: code.map((f, i) => ({ id: `faq-${f.index}`, question: f.question, answer: f.answer, sortOrder: i + 1, active: true })) }
  schema = schemas.FaqsContentSchema
  roundTrip = () => [code, adaptPublic(source.faqsSource, content)]
} else {
  // useFooter reaches these through Nuxt auto-imports.
  const { codeFinalCta, useFinalCta } = await load('app/composables/useFinalCta.ts')
  Object.assign(globalThis, {
    useFinalCta,
    useWhatsapp: (await load('app/composables/useWhatsapp.ts')).useWhatsapp,
    useServices: (await load('app/composables/useServices.ts')).useServices
  })
  const { useFooter } = await load('app/composables/useFooter.ts')
  const cta = codeFinalCta()
  const { contact, socials } = useFooter()
  const url = (k) => socials.find((s) => s.key === k)?.url ?? ''
  content = {
    eyebrow: cta.eyebrowLine,
    headline: cta.headingLine,
    email: cta.email ?? '',
    address: contact.address ?? '',
    mapsUrl: contact.mapsUrl ?? '',
    hours: contact.hours ?? '',
    positioning: contact.positioning,
    socials: { linkedin: url('linkedin'), instagram: url('instagram'), tiktok: url('tiktok'), youtube: url('youtube') }
  }
  schema = schemas.CtasContentSchema
  const orNull = (v) => (v.trim() ? v.trim() : null)
  roundTrip = () => [
    { eyebrowLine: cta.eyebrowLine, headingLine: cta.headingLine, email: cta.email, address: contact.address, mapsUrl: contact.mapsUrl, hours: contact.hours, positioning: contact.positioning, socials: socials.filter((s) => s.key !== 'whatsapp').map((s) => s.url) },
    { eyebrowLine: content.eyebrow, headingLine: content.headline, email: content.email, address: orNull(content.address), mapsUrl: orNull(content.mapsUrl), hours: orNull(content.hours), positioning: content.positioning, socials: ['linkedin', 'instagram', 'tiktok', 'youtube'].map((k) => orNull(content.socials[k])) }
  ]
}

// The public path: inactive items dropped, `active` removed, then the
// source's adapter — exactly what the components would receive.
function adaptPublic(src, c) {
  return src.adapt({ items: c.items.filter((x) => x.active).map(({ active: _a, ...r }) => r) })
}

const parsed = schema.safeParse(content)
if (!parsed.success) {
  console.error(`${TAG} Migrated content fails the ${NAME} schema — nothing written:`)
  for (const i of parsed.error.issues) console.error(`  - ${i.path.join('.')}: ${i.message}`)
  process.exit(1)
}
const text = JSON.stringify(content)
const [today, cms] = roundTrip()
if (!isDeepStrictEqual(JSON.parse(JSON.stringify(today)), JSON.parse(JSON.stringify(cms)))) {
  console.error(`${TAG} Migrated content would not reproduce today's site — nothing written.\n  today: ${JSON.stringify(today).slice(0, 600)}\n  cms:   ${JSON.stringify(cms).slice(0, 600)}`)
  process.exit(1)
}

const serverMod = await load('server/utils/cms/sharedContent.ts')
const RECORD_KEY = serverMod.SHARED_RECORD_KEYS[id]
const REVISION_PREFIX = serverMod.SHARED_REVISION_PREFIXES[id]
const summary = { version: VERSION, items: content.items?.length ?? null, roundTrip: 'identical to the current site' }

const storage = await openCmsStore(root)
const existing = await storage.getItem(RECORD_KEY)

const sameMigration = existing?.source?.kind === 'migration' && existing.source.version === VERSION
if (sameMigration && JSON.stringify(existing.draft.content) === text) {
  console.log(`${TAG} Already migrated (${VERSION}); draft unchanged — nothing to do.`)
  process.exit(0)
}
if (existing && existing.dummy === false) {
  if (existing.published) {
    console.error(`${TAG} The ${NAME} record holds real content with a published version — refusing to overwrite. Resolve this in the CMS instead.`)
    process.exit(2)
  }
  if (!FORCE) {
    console.error(`${TAG} The ${NAME} draft holds real content that differs from this migration (edited after migrating?). Re-run with --force to replace the draft.`)
    process.exit(2)
  }
}

if (DRY) {
  console.log(`${TAG} Dry run — would write:`, JSON.stringify(summary, null, 2))
  process.exit(0)
}

const now = new Date().toISOString()
const record = serverMod.buildMigratedSharedRecord(id, content, VERSION, now)

// Remove the dev-seed snapshot history so no dummy version survives.
const revisionKeys = await storage.getKeys(REVISION_PREFIX)
for (const k of revisionKeys) await storage.removeItem(k)
await storage.setItem(RECORD_KEY, record)

const entry = {
  id: randomUUID(),
  userId: null,
  action: `${id}.migrate`,
  entityType: 'shared',
  entityId: id,
  timestamp: now,
  metadata: {
    version: VERSION,
    source: `code content (${NAME})`,
    replaced: existing ? (existing.dummy ? 'dummy seed record' : 'real draft (--force)') : 'none',
    removedRevisions: revisionKeys.length,
    status: 'draft (not published)'
  }
}
await storage.setItem(`audit:${now.replace(/[:.]/g, '')}-${entry.id.slice(0, 8)}`, entry)

console.log(`${TAG} Migrated ${VERSION} into the ${NAME} draft (status: draft, not published).`)
console.log(JSON.stringify({ ...summary, replaced: entry.metadata.replaced, removedRevisions: revisionKeys.length }, null, 2))
process.exit(0)

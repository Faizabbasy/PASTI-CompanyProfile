#!/usr/bin/env node
// Copy the local CMS store (.data/cms) into the Postgres CMS store
// (NUXT_CMS_DATABASE_URL, table cms.kv — run `npm run cms:db-migrate` first).
//
//   npm run cms:db-import                 add keys missing in the database; report differences
//   npm run cms:db-import -- --dry-run    show what would happen, write nothing
//   npm run cms:db-import -- --force      also overwrite keys whose value differs
//   npm run cms:db-import -- --mirror     make the database equal to .data/cms
//                                         (overwrite differing keys AND delete keys
//                                         that only exist in the database)
//
// Never copied: sessions:* and ratelimit:* (short-lived; users sign in again).
// Values are copied as stored — users (incl. password hashes), pages,
// collections, revision snapshots, audit log. Never prints the URL or values.

import { createJiti } from 'jiti'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = new Set(process.argv.slice(2))
const DRY = args.has('--dry-run')
const MIRROR = args.has('--mirror')
const FORCE = args.has('--force') || MIRROR
const TAG = '[cms-db-import]'
const SKIP = /^(sessions|ratelimit):/

if (!process.env.NUXT_CMS_DATABASE_URL) {
  console.error(`${TAG} NUXT_CMS_DATABASE_URL is not set (add it to .env).`)
  process.exit(1)
}

const jiti = createJiti(import.meta.url, { alias: { '#shared': resolve(root, 'shared') }, interopDefault: true })
const { cmsPgPools, cmsPgDriver } = await jiti.import(resolve(root, 'server/utils/cms/pgStore.ts'))
const pools = cmsPgPools({ url: process.env.NUXT_CMS_DATABASE_URL, ca: process.env.NUXT_CMS_DATABASE_CA })
const src = createStorage({ driver: fsDriver({ base: resolve(root, '.data/cms') }) })
const dst = createStorage({ driver: cmsPgDriver({ pool: () => pools.data }) })

try {
  // Revision snapshots are copied only when their record still lists that
  // version in its history; leftovers from local testing (orphans) are not.
  const orphans = []
  const isOrphan = async (k) => {
    const m = /^page-revisions:([^:]+):v(\d{4})$/.exec(k) || /^collection-revisions:([^:]+:[^:]+):v(\d{4})$/.exec(k)
    if (!m) return false
    const owner = await src.getItem(k.startsWith('page-') ? `pages:${m[1]}` : `collections:${m[1]}`)
    return !owner?.revisions?.some((r) => r.version === Number(m[2]))
  }
  const srcKeys = []
  for (const k of (await src.getKeys()).filter((x) => !SKIP.test(x)).sort()) {
    if (await isOrphan(k)) orphans.push(k)
    else srcKeys.push(k)
  }
  const dstKeys = new Set((await dst.getKeys()).filter((k) => !SKIP.test(k)))
  const stats = { added: 0, same: 0, differs: 0, overwritten: 0, deleted: 0 }
  const differing = []

  for (const k of srcKeys) {
    const value = await src.getItem(k)
    if (value === null) continue
    if (!dstKeys.has(k)) {
      if (!DRY) await dst.setItem(k, value)
      stats.added++
      continue
    }
    dstKeys.delete(k)
    const current = await dst.getItem(k)
    if (JSON.stringify(current) === JSON.stringify(value)) { stats.same++; continue }
    stats.differs++
    differing.push(k)
    if (FORCE) {
      if (!DRY) await dst.setItem(k, value)
      stats.overwritten++
    }
  }
  if (MIRROR) {
    for (const k of dstKeys) {
      if (!DRY) await dst.removeItem(k)
      stats.deleted++
    }
  }

  const groups = {}
  for (const k of srcKeys) { const g = k.split(':')[0]; groups[g] = (groups[g] ?? 0) + 1 }
  console.log(`${TAG} ${DRY ? 'Dry run — ' : ''}source keys by group:`, JSON.stringify(groups))
  console.log(`${TAG} ${DRY ? 'would be ' : ''}added ${stats.added}, unchanged ${stats.same}, differing ${stats.differs} (overwritten ${stats.overwritten})${MIRROR ? `, deleted ${stats.deleted}` : ''}.`)
  if (orphans.length) console.log(`${TAG} skipped ${orphans.length} orphan revision snapshot(s) not listed by their record:\n  ${orphans.join('\n  ')}`)
  if (stats.differs && !FORCE) console.log(`${TAG} ${stats.differs} key(s) differ and were left as they are in the database (use --force to overwrite):\n  ${differing.slice(0, 20).join('\n  ')}`)
} catch (e) {
  console.error(`${TAG} failed: ${String(e.message).replace(/postgres(ql)?:\/\/\S+/g, '[url]')}`)
  process.exitCode = 1
} finally {
  await pools.data.end().catch(() => {})
  await pools.locks.end().catch(() => {})
}

#!/usr/bin/env node
// Apply the CMS database migrations (server/database/migrations/*.sql) to
// the database in NUXT_CMS_DATABASE_URL.   npm run cms:db-migrate [-- --dry-run]
//
// Each file runs once, in name order, inside a transaction, and is recorded
// in cms.schema_migrations (with a checksum — an already-applied file that
// was edited afterwards is refused). Safe to re-run. Never prints the URL.

import pg from 'pg'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DRY = process.argv.includes('--dry-run')
const TAG = '[cms-db-migrate]'
const url = process.env.NUXT_CMS_DATABASE_URL
if (!url) {
  console.error(`${TAG} NUXT_CMS_DATABASE_URL is not set (add it to .env).`)
  process.exit(1)
}

const dir = join(root, 'server/database/migrations')
const files = readdirSync(dir).filter((f) => /^\d{4}_[a-z0-9_]+\.sql$/.test(f)).sort()
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 })

try {
  await client.connect()
  // A dry run only reads: no schema or bookkeeping table is created.
  if (!DRY) {
    await client.query('create schema if not exists cms')
    await client.query('create table if not exists cms.schema_migrations (version text primary key, checksum text not null, applied_at timestamptz not null default now())')
  }
  const exists = (await client.query("select to_regclass('cms.schema_migrations') as t")).rows[0].t
  const applied = new Map(exists ? (await client.query('select version, checksum from cms.schema_migrations')).rows.map((r) => [r.version, r.checksum]) : [])
  let ran = 0
  for (const f of files) {
    const sql = readFileSync(join(dir, f), 'utf8')
    const sum = createHash('sha256').update(sql).digest('hex').slice(0, 16)
    if (applied.has(f)) {
      if (applied.get(f) !== sum) throw new Error(`${f} was already applied but has changed since — add a new migration instead of editing it.`)
      continue
    }
    if (DRY) { console.log(`${TAG} would apply ${f}`); continue }
    await client.query('begin')
    try {
      await client.query(sql)
      await client.query('insert into cms.schema_migrations (version, checksum) values ($1, $2)', [f, sum])
      await client.query('commit')
    } catch (e) {
      await client.query('rollback')
      throw new Error(`${f}: ${e.message}`)
    }
    console.log(`${TAG} applied ${f}`)
    ran++
  }
  if (!DRY) console.log(`${TAG} ${ran ? `${ran} migration(s) applied` : 'database is up to date'}.`)
} catch (e) {
  console.error(`${TAG} failed: ${String(e.message).replace(/postgres(ql)?:\/\/\S+/g, '[url]')}`)
  process.exitCode = 1
} finally {
  await client.end().catch(() => {})
}

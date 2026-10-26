import pg from 'pg'
import { defineDriver } from 'unstorage'

// Postgres backing for cmsStorage() (table cms.kv, migration
// server/database/migrations/0001_cms_kv.sql). Same keys and serialized
// values as the local fs store, so every CMS module works unchanged.
//
// Two pools per server instance:
//   data  — plain reads/writes (the unstorage driver below)
//   locks — one connection held per locked mutation (advisory lock inside a
//           transaction); kept separate so a locked section can always reach
//           the data pool and never deadlocks waiting for its own pool.
// Small sizes: serverless instances are many and short-lived, and the
// Supabase transaction pooler multiplexes them.

export interface CmsPgConfig {
  url: string
  // PEM of the provider's root CA (Supabase: Settings → Database → SSL
  // certificate). Set → the server certificate is verified. Unset → the
  // connection is still encrypted, but the certificate is not verified.
  ca?: string
}

let dataPool: pg.Pool | null = null
let lockPool: pg.Pool | null = null
let warned = false

function ssl(cfg: CmsPgConfig): pg.PoolConfig['ssl'] {
  if (cfg.ca) return { ca: cfg.ca.replace(/\\n/g, '\n'), rejectUnauthorized: true }
  if (!warned && !import.meta.dev) {
    warned = true
    console.warn('[cms] NUXT_CMS_DATABASE_CA is not set — the database connection is encrypted but its certificate is not verified.')
  }
  return { rejectUnauthorized: false }
}

function makePool(cfg: CmsPgConfig, max: number) {
  const pool = new pg.Pool({ connectionString: cfg.url, ssl: ssl(cfg), max, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 10_000, allowExitOnIdle: true })
  // An idle client error must not crash the server; the next query reconnects.
  pool.on('error', (err) => console.error('[cms] postgres pool error:', err.message))
  return pool
}

export function cmsPgPools(cfg: CmsPgConfig) {
  dataPool ??= makePool(cfg, 4)
  lockPool ??= makePool(cfg, 2)
  return { data: dataPool, locks: lockPool }
}

// unstorage driver over cms.kv. Keys arrive relative to the `cms` mount.
export const cmsPgDriver = defineDriver((opts: { pool: () => pg.Pool }) => ({
  name: 'cms-postgres',
  async hasItem(key: string) {
    const r = await opts.pool().query('select 1 from cms.kv where key = $1', [key])
    return r.rowCount! > 0
  },
  async getItem(key: string) {
    const r = await opts.pool().query<{ value: string }>('select value from cms.kv where key = $1', [key])
    return r.rows[0]?.value ?? null
  },
  async setItem(key: string, value: string) {
    await opts.pool().query(
      'insert into cms.kv (key, value, updated_at) values ($1, $2, now()) on conflict (key) do update set value = excluded.value, updated_at = now()',
      [key, value]
    )
  },
  async removeItem(key: string) {
    await opts.pool().query('delete from cms.kv where key = $1', [key])
  },
  async getKeys(base: string) {
    const r = base
      ? await opts.pool().query<{ key: string }>('select key from cms.kv where starts_with(key, $1) order by key', [base])
      : await opts.pool().query<{ key: string }>('select key from cms.kv order by key')
    return r.rows.map((row) => row.key)
  },
  async clear(base: string) {
    if (base) await opts.pool().query('delete from cms.kv where starts_with(key, $1)', [base])
    else await opts.pool().query('delete from cms.kv')
  }
}))

// Serialize every mutation of one record across all server instances: a
// transaction-scoped advisory lock keyed by the record key. Released on
// commit/rollback, so a crashed request can never leave it held.
export async function withPgLock<T>(pool: pg.Pool, key: string, fn: () => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('begin')
    await client.query('select pg_advisory_xact_lock(hashtextextended($1, 0))', [`cms:${key}`])
    try {
      return await fn()
    } finally {
      await client.query('commit').catch(() => client.query('rollback').catch(() => {}))
    }
  } finally {
    client.release()
  }
}

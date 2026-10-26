import { cmsPgDriver, cmsPgPools, withPgLock } from './pgStore'

// The ONE storage gateway for the whole admin CMS (users, sessions,
// rate-limit counters, audit log, pages, collections, revisions).
//
//   NUXT_CMS_DATABASE_URL set   → Postgres (table cms.kv, see pgStore.ts)
//   unset, `nuxt dev`           → local files in .data/cms (nitro.storage.cmsfs)
//   unset, production           → refused (503), unless NUXT_CMS_ALLOW_FS_STORAGE
//                                  is true: serverless disks are not persistent,
//                                  so CMS data must never silently land there.

type Backend = { kind: 'pg'; mount: 'cmspg'; locks: ReturnType<typeof cmsPgPools>['locks'] } | { kind: 'fs'; mount: 'cmsfs' }
let backend: Backend | null = null

function resolveBackend(): Backend {
  if (backend) return backend
  const cms = useRuntimeConfig().cms
  const url = String(cms.databaseUrl || '')
  if (url) {
    const pools = cmsPgPools({ url, ca: String(cms.databaseCa || '') || undefined })
    useStorage().mount('cmspg', cmsPgDriver({ pool: () => pools.data }))
    backend = { kind: 'pg', mount: 'cmspg', locks: pools.locks }
  } else {
    if (!import.meta.dev && String(cms.allowFsStorage) !== 'true') {
      throw createError({ statusCode: 503, statusMessage: 'CMS storage is not configured' })
    }
    backend = { kind: 'fs', mount: 'cmsfs' }
  }
  return backend
}

export function cmsStorage() {
  return useStorage(resolveBackend().mount)
}

export function cmsStorageKind(): 'pg' | 'fs' {
  return resolveBackend().kind
}

// Serialize read → check → write of one record (save, publish, status,
// approval, delete) so a stale revision is always answered with 409 instead
// of two writers overwriting each other. Postgres: advisory lock shared by
// every server instance. Local files: one process, an in-memory queue.
const localQueues = new Map<string, Promise<unknown>>()

export async function withCmsLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const b = resolveBackend()
  if (b.kind === 'pg') return withPgLock(b.locks, key, fn)
  const prev = localQueues.get(key) ?? Promise.resolve()
  const run = prev.catch(() => {}).then(fn)
  const tail = run.catch(() => {})
  localQueues.set(key, tail)
  try {
    return await run
  } finally {
    if (localQueues.get(key) === tail) localQueues.delete(key)
  }
}

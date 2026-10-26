// The CMS store the scripts write to — the same one the server uses:
//   NUXT_CMS_DATABASE_URL set → Postgres (cms.kv), via server/utils/cms/pgStore.ts
//   unset                     → local files in .data/cms
// The npm scripts load .env (node --env-file-if-exists=.env).
import { createJiti } from 'jiti'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { resolve } from 'node:path'

export async function openCmsStore(root) {
  const url = process.env.NUXT_CMS_DATABASE_URL
  if (!url) {
    console.log('[cms-store] NUXT_CMS_DATABASE_URL not set — using local files in .data/cms')
    return createStorage({ driver: fsDriver({ base: resolve(root, '.data/cms') }) })
  }
  const jiti = createJiti(import.meta.url, { interopDefault: true })
  const { cmsPgPools, cmsPgDriver } = await jiti.import(resolve(root, 'server/utils/cms/pgStore.ts'))
  const pools = cmsPgPools({ url, ca: process.env.NUXT_CMS_DATABASE_CA })
  console.log('[cms-store] using the Postgres CMS store (NUXT_CMS_DATABASE_URL)')
  return createStorage({ driver: cmsPgDriver({ pool: () => pools.data }) })
}

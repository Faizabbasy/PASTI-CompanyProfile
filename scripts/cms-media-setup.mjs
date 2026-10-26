#!/usr/bin/env node
// Create (or check) the Media library bucket in Supabase Storage.
//   npm run cms:media-setup
// Needs NUXT_CMS_SUPABASE_URL and NUXT_CMS_SUPABASE_SERVICE_KEY in .env
// (bucket name: NUXT_CMS_MEDIA_BUCKET, default cms-media). The bucket is
// PUBLIC (site visitors load the images) with a 5 MB limit and image types
// only. Safe to re-run: an existing bucket is updated to these settings.
// Never prints the key.

const TAG = '[cms-media-setup]'
const url = (process.env.NUXT_CMS_SUPABASE_URL || '').trim().replace(/\/+$/, '')
const key = (process.env.NUXT_CMS_SUPABASE_SERVICE_KEY || '').trim()
const bucket = (process.env.NUXT_CMS_MEDIA_BUCKET || 'cms-media').trim()

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) {
  console.error(`${TAG} NUXT_CMS_SUPABASE_URL is missing or not https://<project>.supabase.co`)
  process.exit(1)
}
if (!key) {
  console.error(`${TAG} NUXT_CMS_SUPABASE_SERVICE_KEY is missing (Supabase → Project Settings → API keys → service_role / secret).`)
  process.exit(1)
}

const headers = { apikey: key, 'content-type': 'application/json', ...(key.startsWith('eyJ') ? { authorization: `Bearer ${key}` } : {}) }
const settings = { public: true, file_size_limit: 5 * 1024 * 1024, allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] }

const existing = await fetch(`${url}/storage/v1/bucket/${bucket}`, { headers })
if (existing.status === 401 || existing.status === 403) {
  console.error(`${TAG} Supabase rejected the key (${existing.status}). Use the service_role / secret key, not the anon / publishable key.`)
  process.exit(1)
}

let res
if (existing.ok) {
  res = await fetch(`${url}/storage/v1/bucket/${bucket}`, { method: 'PUT', headers, body: JSON.stringify(settings) })
} else {
  res = await fetch(`${url}/storage/v1/bucket`, { method: 'POST', headers, body: JSON.stringify({ id: bucket, name: bucket, ...settings }) })
}
if (!res.ok) {
  console.error(`${TAG} Could not ${existing.ok ? 'update' : 'create'} bucket "${bucket}": ${res.status} ${(await res.text()).slice(0, 300)}`)
  process.exit(1)
}

// Round trip: upload a 1×1 PNG, read it back publicly, delete it.
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
const testKey = `uploads/setup-check-${Date.now()}.png`
const up = await fetch(`${url}/storage/v1/object/${bucket}/${testKey}`, { method: 'POST', headers: { ...headers, 'content-type': 'image/png' }, body: png })
if (!up.ok) {
  console.error(`${TAG} Test upload failed: ${up.status} ${(await up.text()).slice(0, 300)}`)
  process.exit(1)
}
const pub = await fetch(`${url}/storage/v1/object/public/${bucket}/${testKey}`)
await fetch(`${url}/storage/v1/object/${bucket}`, { method: 'DELETE', headers, body: JSON.stringify({ prefixes: [testKey] }) })
if (!pub.ok) {
  console.error(`${TAG} Uploaded, but the public URL answered ${pub.status} — is the bucket public?`)
  process.exit(1)
}

console.log(`${TAG} Bucket "${bucket}" is ${existing.ok ? 'updated' : 'created'}: public, 5 MB limit, JPG/PNG/WebP/AVIF. Upload + public read + delete check passed.`)

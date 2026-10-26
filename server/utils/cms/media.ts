import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'
import type { ActorRef } from '#shared/cms/fields'

// Media library: image files live in a PUBLIC Supabase Storage bucket, their
// records (`media:<id>`) in the CMS store next to everything else. Pages store
// the public URL in their image fields (shared/cms/fields.ts mediaRef).
// Talks to the Storage REST API with fetch — no SDK. The service key is
// server-only runtime config and never leaves this module.

export interface CmsMedia {
  id: string
  url: string
  key: string
  mime: string
  size: number
  width: number | null
  height: number | null
  originalName: string
  uploadedBy: ActorRef | null
  uploadedAt: string
}

export interface MediaUsage {
  key: string
  label: string
}

interface MediaStorageConfig {
  url: string
  serviceKey: string
  bucket: string
}

export function mediaStorageConfig(event?: H3Event): MediaStorageConfig | null {
  const cms = useRuntimeConfig(event).cms
  const url = String(cms.supabaseUrl || '').trim().replace(/\/+$/, '')
  const serviceKey = String(cms.supabaseServiceKey || '').trim()
  const bucket = String(cms.mediaBucket || 'cms-media').trim()
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) || !serviceKey || !/^[a-z0-9_-]+$/.test(bucket)) return null
  return { url, serviceKey, bucket }
}

export function requireMediaStorage(event: H3Event): MediaStorageConfig {
  const cfg = mediaStorageConfig(event)
  if (!cfg) throw createError({ statusCode: 503, statusMessage: 'Media storage is not configured yet.' })
  return cfg
}

// Legacy service_role keys are JWTs (Authorization + apikey); the newer
// sb_secret_ keys go in the apikey header only.
function authHeaders(cfg: MediaStorageConfig): Record<string, string> {
  const h: Record<string, string> = { apikey: cfg.serviceKey }
  if (cfg.serviceKey.startsWith('eyJ')) h.authorization = `Bearer ${cfg.serviceKey}`
  return h
}

export const mediaPublicUrl = (cfg: MediaStorageConfig, key: string) => `${cfg.url}/storage/v1/object/public/${cfg.bucket}/${key}`

export async function uploadToStorage(cfg: MediaStorageConfig, key: string, bytes: Uint8Array, mime: string): Promise<void> {
  const res = await fetch(`${cfg.url}/storage/v1/object/${cfg.bucket}/${key}`, {
    method: 'POST',
    headers: { ...authHeaders(cfg), 'content-type': mime, 'cache-control': 'max-age=31536000', 'x-upsert': 'false' },
    body: bytes as unknown as BodyInit
  })
  if (!res.ok) {
    console.error('[cms] media upload to storage failed:', res.status, (await res.text().catch(() => '')).slice(0, 300))
    throw createError({ statusCode: 502, statusMessage: res.status === 404 ? `Storage bucket "${cfg.bucket}" was not found.` : 'Upload to storage failed. Try again.' })
  }
}

export async function deleteFromStorage(cfg: MediaStorageConfig, key: string): Promise<void> {
  const res = await fetch(`${cfg.url}/storage/v1/object/${cfg.bucket}`, {
    method: 'DELETE',
    headers: { ...authHeaders(cfg), 'content-type': 'application/json' },
    body: JSON.stringify({ prefixes: [key] })
  })
  if (!res.ok) {
    console.error('[cms] media delete from storage failed:', res.status, (await res.text().catch(() => '')).slice(0, 300))
    throw createError({ statusCode: 502, statusMessage: 'Could not delete the file from storage. Try again.' })
  }
}

const mediaKey = (id: string) => `media:${id}`

export async function listMedia(): Promise<CmsMedia[]> {
  const keys = await cmsStorage().getKeys('media')
  const items = await Promise.all(keys.map((k) => cmsStorage().getItem<CmsMedia>(k)))
  return items.filter((m): m is CmsMedia => !!m).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
}

export async function getMedia(id: string): Promise<CmsMedia | null> {
  if (!/^[a-f0-9-]{36}$/.test(id)) return null
  return (await cmsStorage().getItem<CmsMedia>(mediaKey(id))) ?? null
}

export async function saveMedia(input: Omit<CmsMedia, 'id'>): Promise<CmsMedia> {
  const media: CmsMedia = { id: randomUUID(), ...input }
  await cmsStorage().setItem(mediaKey(media.id), media)
  return media
}

export async function removeMediaRecord(id: string): Promise<void> {
  await cmsStorage().removeItem(mediaKey(id))
}

// Where each URL is referenced: page drafts/published snapshots and
// collection records (projects, case studies, articles, testimonials …).
// Old revision snapshots don't count — they are history, not live content.
export async function mediaUsage(urls: string[]): Promise<Map<string, MediaUsage[]>> {
  const out = new Map<string, MediaUsage[]>(urls.map((u) => [u, []]))
  if (!urls.length) return out
  const keys = [...(await cmsStorage().getKeys('pages')), ...(await cmsStorage().getKeys('collections'))]
  for (const key of keys) {
    const json = JSON.stringify(await cmsStorage().getItem(key))
    for (const u of urls) if (json.includes(u)) out.get(u)!.push({ key, label: usageLabel(key) })
  }
  return out
}

function usageLabel(key: string): string {
  const [kind, a, b] = key.split(':')
  const cap = (s = '') => s.charAt(0).toUpperCase() + s.slice(1)
  if (kind === 'pages') return a === 'open' ? 'OPEN page' : `${cap(a)} page`
  const names: Record<string, string> = { projects: 'Project', 'case-studies': 'Case study', articles: 'Article', 'article-categories': 'Category', testimonials: 'Testimonial' }
  return `${names[a ?? ''] ?? cap(a)} · ${b ?? ''}`
}

// Upload throttle per user: 60 uploads / 15 min (fixed window in CMS storage).
const UPLOAD_WINDOW_MS = 15 * 60 * 1000
const UPLOAD_MAX = 60
export async function assertUploadAllowed(userId: string): Promise<void> {
  const key = `ratelimit:upload:${userId}`
  const now = Date.now()
  const c = await cmsStorage().getItem<{ count: number; resetAt: number }>(key)
  const counter = c && now <= c.resetAt ? c : { count: 0, resetAt: now + UPLOAD_WINDOW_MS }
  if (counter.count >= UPLOAD_MAX) throw createError({ statusCode: 429, statusMessage: 'Too many uploads. Try again in a few minutes.' })
  counter.count += 1
  await cmsStorage().setItem(key, counter)
}

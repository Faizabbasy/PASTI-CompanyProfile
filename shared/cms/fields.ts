import { z } from 'zod'

// Shared CMS field primitives (extracted from the About schema for the
// Technology singleton). Structured, plain-text fields only: no HTML, no
// layout/typography/motion/colour controls — the codebase owns design.
// Deliberately outside shared/utils so these generic names are not
// auto-imported across the app; import from '#shared/cms/fields'.

export const HTML_TAG = /<\s*\/?\s*[a-z!?]/i
// C0 controls except tab/newline/carriage return, plus DEL.
export const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/

export function text(max: number, opts: { required?: boolean } = {}) {
  let s = z.string().trim().max(max, `Maksimal ${max} karakter.`)
  if (opts.required) s = s.min(1, 'Wajib diisi.')
  return s
    .refine((v) => !HTML_TAG.test(v), 'Tidak boleh berisi kode HTML — tulis teks biasa saja.')
    .refine((v) => !CONTROL_CHARS.test(v), 'Ada karakter yang tidak valid.')
}

// Links: site-relative paths, in-page anchors, https, mailto and tel only.
// Everything else (javascript:, data:, vbscript:, protocol-relative //…,
// plain http) is rejected.
export function isSafeLinkUrl(v: string): boolean {
  if (v.startsWith('/')) return !v.startsWith('//') && !v.includes('\\') && !/\s/.test(v)
  if (v.startsWith('#')) return /^#[A-Za-z][\w-]*$/.test(v)
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(v)) return true
  if (/^tel:\+?[0-9 ()-]{5,20}$/i.test(v)) return true
  try {
    const u = new URL(v)
    return u.protocol === 'https:' && !!u.hostname && !u.username && !u.password
  } catch {
    return false
  }
}

export const linkUrl = z
  .string()
  .trim()
  .max(500, 'Maksimal 500 karakter.')
  .refine((v) => v === '' || isSafeLinkUrl(v), 'Pakai link yang valid: /halaman, #bagian, https://…, mailto: atau tel:.')

// Media references: a file already in /public/images, or an image uploaded
// through the Media library (Supabase Storage public URL, key shape set by
// server/utils/cms/media.ts). No traversal, no other hosts, images only.
export const MEDIA_REF = /^\/images\/(?:[a-z0-9_-]+\/)*[a-z0-9_.-]+\.(?:webp|jpe?g|png|avif)$/i
export const MEDIA_UPLOAD_REF = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/[a-z0-9_-]+\/uploads\/\d{4}\/\d{2}\/[a-z0-9-]+\.(?:webp|jpe?g|png|avif)$/
export const isMediaRef = (v: string) => (MEDIA_REF.test(v) || MEDIA_UPLOAD_REF.test(v)) && !v.includes('..')
export const mediaRef = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === '' || isMediaRef(v), 'Pilih gambar dari Media library (webp, jpg, png, avif).')

export const CANONICAL_HOSTS = ['pastipeople.id', 'www.pastipeople.id']
export const canonicalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => {
    if (v === '') return true
    try {
      const u = new URL(v)
      return u.protocol === 'https:' && CANONICAL_HOSTS.includes(u.hostname) && !u.username && !u.search && !u.hash
    } catch {
      return false
    }
  }, 'Pakai alamat https://pastipeople.id/… tanpa tanda ? atau #.')

// Client-supplied ids are only accepted if they already exist in the stored
// draft (checked server-side); new items omit the id and get one assigned.
export const itemId = z.string().regex(/^[a-z0-9_-]{1,64}$/i, 'ID tidak valid.').optional()
export const sortOrder = z.number().int().min(0).max(9999)

export function maxActive(limit: number, label: string) {
  return (list: { active: boolean }[], ctx: z.RefinementCtx) => {
    if (list.filter((i) => i.active).length > limit) ctx.addIssue({ code: 'custom', message: `Maksimal ${limit} ${label} yang tampil — desainnya muat ${limit}. Sembunyikan sisanya.` })
  }
}

export function ctaPair(labelKey: string, urlKey: string) {
  return (v: Record<string, unknown>, ctx: z.RefinementCtx) => {
    const label = v[labelKey] as string
    const url = v[urlKey] as string
    if (label && !url) ctx.addIssue({ code: 'custom', path: [urlKey], message: 'Isi link untuk tombol ini.' })
    if (url && !label) ctx.addIssue({ code: 'custom', path: [labelKey], message: 'Isi teks untuk link ini.' })
  }
}

export function mediaAlt(mediaKey: string, altKey: string) {
  return (v: Record<string, unknown>, ctx: z.RefinementCtx) => {
    if (v[mediaKey] && !v[altKey]) ctx.addIssue({ code: 'custom', path: [altKey], message: 'Deskripsi gambar wajib diisi kalau ada gambar.' })
  }
}

export const SeoSchema = z
  .object({
    metaTitle: text(70, { required: true }),
    metaDescription: text(170, { required: true }),
    ogImage: mediaRef,
    canonicalUrl,
    noIndex: z.boolean()
  })
  .strict()

export type PageStatus = 'draft' | 'published' | 'archived'

export interface ActorRef {
  id: string
  name: string
}

// Stored shape: every repeater item has a server-assigned id.
export type WithId<T> = Omit<T, 'id'> & { id: string }

export type PageSource = { kind: 'seed' } | { kind: 'migration'; version: string; migratedAt: string }

// What a singleton editor receives — content plus publication metadata.
export interface SingletonAdminState<Id extends string, C> {
  id: Id
  // true = dev seed content; false = real content (e.g. migrated)
  dummy: boolean
  source: PageSource
  status: PageStatus
  draft: { version: number; content: C; updatedAt: string; updatedBy: ActorRef }
  published: { version: number; publishedAt: string; publishedBy: ActorRef } | null
  hasUnpublishedChanges: boolean
  publishedItemIds: string[]
  revisions: { version: number; publishedAt: string; publishedBy: ActorRef }[]
  createdAt: string
  updatedAt: string
  updatedBy: ActorRef
  publishedAt: string | null
  publishedBy: ActorRef | null
}

// Collection slugs (Work projects, case studies): lowercase words joined by
// single hyphens, so no traversal, encoding tricks or route collisions.
export const RESERVED_SLUGS = ['new', 'admin', 'api', 'preview', 'work', 'index', 'edit', 'projects', 'case-studies', 'case', 'cases', 'null', 'undefined']
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const slug = z
  .string()
  .trim()
  .min(1, 'Wajib diisi.')
  .max(60, 'Maksimal 60 karakter.')
  .refine((v) => SLUG_PATTERN.test(v), 'Pakai huruf kecil, angka dan tanda hubung tunggal (contoh: textile-dashboard).')
  .refine((v) => !RESERVED_SLUGS.includes(v), 'Alamat ini sudah dipakai sistem — pilih yang lain.')

// A reference to another CMS record by its stored id.
export const recordRef = z.string().regex(/^[a-z0-9][a-z0-9_-]{0,63}$/, 'Pilih data yang sudah ada.')

// Public-claim approval (case-study metrics, client-sensitive media). Only
// `confirmed` may ever render publicly; only an ADMIN can set it.
export const CLAIM_STATUSES = ['confirmed', 'needs_approval', 'hidden'] as const
export type ClaimStatus = (typeof CLAIM_STATUSES)[number]

// What a record editor receives. Same shape as a singleton editor's state
// (useSingletonEditor works unchanged) plus `extra` for derived relations.
export interface CollectionAdminState<C, X = Record<string, unknown>> {
  id: string
  dummy: boolean
  source: PageSource
  status: PageStatus
  meta: Record<string, string>
  draft: { version: number; content: C; updatedAt: string; updatedBy: ActorRef }
  published: { version: number; publishedAt: string; publishedBy: ActorRef } | null
  hasUnpublishedChanges: boolean
  publishedItemIds: string[]
  revisions: { version: number; publishedAt: string; publishedBy: ActorRef }[]
  createdAt: string
  createdBy: ActorRef
  updatedAt: string
  updatedBy: ActorRef
  publishedAt: string | null
  publishedBy: ActorRef | null
  extra: X
}

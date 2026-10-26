import { z } from 'zod'
import { isMediaRef, itemId, sortOrder, text, type SingletonAdminState, type WithId } from '#shared/cms/fields'

// Shared Content CMS (Clients, FAQs, Global CTAs): content used by more than
// one page, edited once. Each is a singleton record on the shared singleton
// engine (draft / published / revisions). Plain text only; design, layout and
// motion stay in code. Lists can grow and shrink within the limits below
// (the layouts were checked at those limits); inactive items stay in the
// draft but are never served.
//
// Import from '#shared/utils/sharedContentSchema'.

export type SharedId = 'clients' | 'faqs' | 'ctas'

// ---- Clients -----------------------------------------------------------------
// Homepage "Our Beloved Client" marquee (two rows) + the About client grid.

export const CLIENTS_LIMITS = { name: 60, max: 60, minActive: 8, maxActive: 48 }

// Logos: a Media-library upload, an /images/ path, or one of the original
// logo files shipped in /public/logos/clients/.
const CLIENT_LOGO_FILE = /^\/logos\/clients\/[a-z0-9_-]+\.(?:webp|png|svg)$/i
export const clientLogo = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v !== '', 'Pilih logo.')
  .refine((v) => v === '' || isMediaRef(v) || CLIENT_LOGO_FILE.test(v), 'Pilih logo dari Media library.')

const ClientSchema = z
  .object({
    id: itemId,
    name: text(CLIENTS_LIMITS.name, { required: true }),
    logo: clientLogo,
    // Logo width ÷ height — set automatically when a logo is picked; drives
    // the optical sizing (every logo gets the same visual area).
    ratio: z.number().min(0.2, 'Rasio logo tidak valid.').max(10, 'Rasio logo tidak valid.'),
    sortOrder,
    active: z.boolean()
  })
  .strict()

const activeRange = (min: number, max: number, what: string) => (list: { active: boolean }[], ctx: z.RefinementCtx) => {
  const n = list.filter((i) => i.active).length
  if (n < min) ctx.addIssue({ code: 'custom', message: `Minimal ${min} ${what} yang tampil — desainnya butuh paling sedikit ${min}.` })
  if (n > max) ctx.addIssue({ code: 'custom', message: `Maksimal ${max} ${what} yang tampil. Sembunyikan sebagian.` })
}

// Names identify the logos (hover label, list keys) — no duplicates.
const uniqueNames = (list: { name: string }[], ctx: z.RefinementCtx) => {
  const seen = new Set<string>()
  list.forEach((c, i) => {
    const k = c.name.trim().toLowerCase()
    if (k && seen.has(k)) ctx.addIssue({ code: 'custom', path: [i, 'name'], message: 'Nama klien ini sudah ada di daftar.' })
    seen.add(k)
  })
}

export const ClientsContentSchema = z
  .object({
    items: z
      .array(ClientSchema)
      .max(CLIENTS_LIMITS.max, `Maksimal ${CLIENTS_LIMITS.max} klien.`)
      .superRefine(activeRange(CLIENTS_LIMITS.minActive, CLIENTS_LIMITS.maxActive, 'klien'))
      .superRefine(uniqueNames)
  })
  .strict()

export type ClientsContentInput = z.infer<typeof ClientsContentSchema>
export interface ClientsContent { items: WithId<ClientsContentInput['items'][number]>[] }
export type ClientsAdminState = SingletonAdminState<'clients', ClientsContent>

// ---- FAQs --------------------------------------------------------------------
// Homepage PAQ / FAQ section (question list + reading panel). Numbers 01, 02 …
// and the "/ 07" total follow the order automatically.

export const FAQS_LIMITS = { question: 110, answer: 400, max: 12, minActive: 3, maxActive: 10 }

const FaqSchema = z
  .object({
    id: itemId,
    question: text(FAQS_LIMITS.question, { required: true }),
    answer: text(FAQS_LIMITS.answer, { required: true }),
    sortOrder,
    active: z.boolean()
  })
  .strict()

export const FaqsContentSchema = z
  .object({
    items: z.array(FaqSchema).max(FAQS_LIMITS.max, `Maksimal ${FAQS_LIMITS.max} pertanyaan.`).superRefine(activeRange(FAQS_LIMITS.minActive, FAQS_LIMITS.maxActive, 'pertanyaan'))
  })
  .strict()

export type FaqsContentInput = z.infer<typeof FaqsContentSchema>
export interface FaqsContent { items: WithId<FaqsContentInput['items'][number]>[] }
export type FaqsAdminState = SingletonAdminState<'faqs', FaqsContent>

// ---- Global CTAs ---------------------------------------------------------------
// The closing band of the footer on every page ("Have a challenge?" / "Let's
// build what matters.") and the shared company contact facts (footer, /contact).
// The WhatsApp number and the company's legal name stay in code.

export const CTAS_LIMITS = { eyebrow: 32, headline: 40, email: 60, address: 160, hours: 80, positioning: 60, url: 300 }

const optionalUrl = (hosts: string[] | null, label: string) =>
  z
    .string()
    .trim()
    .max(CTAS_LIMITS.url, `Maks ${CTAS_LIMITS.url} karakter.`)
    .refine((v) => {
      if (v === '') return true
      try {
        const u = new URL(v)
        if (u.protocol !== 'https:' || u.username || u.password) return false
        const h = u.hostname.toLowerCase()
        return !hosts || hosts.some((d) => h === d || h.endsWith(`.${d}`))
      } catch {
        return false
      }
    }, `Isi link ${label} lengkap, diawali https://${hosts ? ` (${hosts[0]})` : ''}.`)

export const SOCIAL_KEYS = ['linkedin', 'instagram', 'tiktok', 'youtube'] as const
export type SocialCmsKey = (typeof SOCIAL_KEYS)[number]

export const CtasContentSchema = z
  .object({
    eyebrow: text(CTAS_LIMITS.eyebrow, { required: true }),
    headline: text(CTAS_LIMITS.headline, { required: true })
      .refine((v) => v.trim().split(/\s+/).length >= 2, 'Minimal 2 kata — kata terakhir tampil kuning.')
      .refine((v) => !/[.!?,;:]$/.test(v.trim()), 'Jangan akhiri dengan tanda baca — titik ditambahkan otomatis.'),
    email: z.string().trim().max(CTAS_LIMITS.email).email('Email tidak valid.'),
    address: text(CTAS_LIMITS.address),
    mapsUrl: optionalUrl(['google.com', 'goo.gl', 'maps.app.goo.gl'], 'Google Maps'),
    hours: text(CTAS_LIMITS.hours),
    positioning: text(CTAS_LIMITS.positioning, { required: true }),
    socials: z
      .object({
        linkedin: optionalUrl(['linkedin.com'], 'LinkedIn'),
        instagram: optionalUrl(['instagram.com'], 'Instagram'),
        tiktok: optionalUrl(['tiktok.com'], 'TikTok'),
        youtube: optionalUrl(['youtube.com', 'youtu.be'], 'YouTube')
      })
      .strict()
  })
  .strict()

export type CtasContent = z.infer<typeof CtasContentSchema>
export type CtasAdminState = SingletonAdminState<'ctas', CtasContent>

// ---- public contract -------------------------------------------------------------
// GET /api/public/shared/<id>. Inactive items are removed and `active` is not
// sent; content is re-validated on the way in, so an unexpected response
// falls back to the code content.

const publicItems = <T extends z.ZodRawShape>(shape: T) => z.object({ items: z.array(z.object(shape).strict()) }).strict()

export const PublicClientsContentSchema = publicItems({ id: z.string(), name: z.string(), logo: clientLogo, ratio: z.number().min(0.2).max(10), sortOrder: z.number() })
export const PublicFaqsContentSchema = publicItems({ id: z.string(), question: z.string(), answer: z.string(), sortOrder: z.number() })

export function publicSharedResponseSchema<T extends z.ZodTypeAny>(content: T) {
  return z.discriminatedUnion('status', [
    z.object({ status: z.literal('disabled') }),
    z.object({ status: z.literal('unpublished') }),
    z.object({ status: z.literal('published'), version: z.number().int(), publishedAt: z.string(), content })
  ])
}

export type PublicClientsContent = z.infer<typeof PublicClientsContentSchema>
export type PublicFaqsContent = z.infer<typeof PublicFaqsContentSchema>

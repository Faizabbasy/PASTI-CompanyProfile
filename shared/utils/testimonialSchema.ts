import { z } from 'zod'
import { CLAIM_STATUSES, mediaRef, sortOrder, text, type ClaimStatus, type CollectionAdminState, type PageSource, type PageStatus, type ActorRef } from '#shared/cms/fields'

// Shared Testimonials collection (Shared Content → Testimonials). The single
// source of truth for testimonial content: pages never copy a quote, name,
// company or photo — they store testimonial ids (and their own order) only.
//
// Two separate gates decide public use:
//   record status          draft | published | archived   (publish workflow)
//   publicationApproval    confirmed | needs_approval | hidden
//                          (record-level, ADMIN-only to confirm, see
//                          server/utils/cms/testimonials.ts)
// A testimonial is public-eligible ONLY when published + confirmed + active,
// and the confirmed approval covers the exact published wording.
//
// Plain text only. Layout, quote marks, avatar shape, typography, colour,
// motion and carousel behaviour belong to the components that render it.

export const TESTIMONIAL_LIMITS = {
  // Longest quote on the site today is 377 characters; the Creative card and
  // the Home ring render the full quote unclamped, so 420 is the design-safe
  // ceiling (copy stress test on the Creative card at 390–1920px).
  quoteMin: 40,
  quote: 420,
  personName: 40,
  roleTitle: 60,
  company: 60,
  photoAlt: 160,
  tag: 24,
  tags: 6,
  sourceNote: 300
} as const

export const TESTIMONIAL_TYPES = ['client', 'partner', 'user', 'internal'] as const
export type TestimonialType = (typeof TESTIMONIAL_TYPES)[number]

// Categories reuse the site's existing service taxonomy (useServices
// `category`) — no new classification is invented here.
export const TESTIMONIAL_CATEGORIES = ['technology', 'creative'] as const

// TEMPORARY reference layer until a Shared Clients CMS exists: a testimonial
// may point at one of the existing clients (useClients — the code's single
// client list), by the stable slug of its logo file. Client name, logo and
// any other client data stay there; nothing is copied into a testimonial.
// scripts/cms-migrate-testimonials.mjs checks this list against useClients.
export const TESTIMONIAL_CLIENT_REFS = [
  'indonesia-eximbank', 'jasamarga', 'perdana', 'universitas-pertamina', 'brin', 'compas', 'raya',
  'tiara-medika-clinic', 'klinik-kis', 'rumah-sakit-rosela', 'prolepsis-medical-centers', 'cakra-medika',
  'indo-medika-international', 'bni-syariah', 'bank-al-habib', 'garuda-indonesia', 'mister-aladin', 'vivo',
  'jd-id', 'cgv', 'joox', 'tokopedia', 'aeon-mall', 'philips', 'mandiri-taspen', 'perum-jasa-tirta-ii',
  'trisula-corporation', 'bsi'
] as const

export const TESTIMONIAL_APPROVALS = CLAIM_STATUSES
export type TestimonialApproval = ClaimStatus

const unique = (label: string) => (list: string[], ctx: z.RefinementCtx) => {
  const seen = new Set<string>()
  list.forEach((v, i) => {
    if (seen.has(v.toLowerCase())) ctx.addIssue({ code: 'custom', path: [i], message: `Duplicate ${label}.` })
    seen.add(v.toLowerCase())
  })
}

export const TestimonialContentSchema = z
  .object({
    quote: text(TESTIMONIAL_LIMITS.quote, { required: true }).refine((v) => v.length >= TESTIMONIAL_LIMITS.quoteMin, `At least ${TESTIMONIAL_LIMITS.quoteMin} characters.`),
    // Required: every testimonial card on the site shows the person's name
    // (no anonymous variant exists).
    personName: text(TESTIMONIAL_LIMITS.personName, { required: true }),
    // Job title only, as the person gave it. Never filled in by assumption.
    roleTitle: text(TESTIMONIAL_LIMITS.roleTitle),
    companyDisplayName: text(TESTIMONIAL_LIMITS.company),
    // Empty = not linked to a client record.
    clientId: z.union([z.literal(''), z.enum(TESTIMONIAL_CLIENT_REFS, { message: 'Pick one of the existing clients.' })]),
    photo: mediaRef,
    // Empty = decorative (the name sits next to the photo).
    photoAlt: text(TESTIMONIAL_LIMITS.photoAlt),
    type: z.enum(TESTIMONIAL_TYPES, { message: 'Pick a type.' }),
    categoryIds: z.array(z.enum(TESTIMONIAL_CATEGORIES, { message: 'Unknown category.' })).max(TESTIMONIAL_CATEGORIES.length).superRefine(unique('category')),
    tags: z.array(text(TESTIMONIAL_LIMITS.tag, { required: true })).max(TESTIMONIAL_LIMITS.tags, `Max ${TESTIMONIAL_LIMITS.tags} tags.`).superRefine(unique('tag')),
    active: z.boolean(),
    // Default collection order; pages keep their own order of the ids they pick.
    sortOrder,
    // Internal only (admin). Never returned publicly. No documents or personal data.
    sourceNote: text(TESTIMONIAL_LIMITS.sourceNote)
  })
  .strict()

export type TestimonialContent = z.infer<typeof TestimonialContentSchema>

// Body of POST …/:id/approval. `revision` pins the draft the admin reviewed.
export const TestimonialApprovalBodySchema = z
  .object({ revision: z.number().int().min(1), approval: z.enum(TESTIMONIAL_APPROVALS) })
  .strict()

// Identity fields a publication approval covers. Changing any of them after
// approval needs a fresh approval before the new wording can go public.
export const TESTIMONIAL_APPROVAL_FIELDS = ['quote', 'personName', 'roleTitle', 'companyDisplayName', 'clientId', 'photo'] as const

export interface TestimonialApprovalState {
  value: TestimonialApproval
  changedAt: string | null
  changedBy: ActorRef | null
  // Does the confirmed approval cover the current draft / published wording?
  coversDraft: boolean
  coversPublished: boolean
}

// Where the record is referenced by page CMS records (read-only info).
export interface TestimonialUsage {
  page: string
  label: string
  where: 'draft' | 'published'
}

export interface TestimonialExtra {
  approval: TestimonialApprovalState
  publicEligible: boolean
  usage: TestimonialUsage[]
  // The role line exactly as the current site shows it (migration only).
  legacyRoleLine: string | null
}

export type TestimonialAdminState = CollectionAdminState<TestimonialContent, TestimonialExtra>

export interface TestimonialListRow {
  id: string
  personName: string
  roleTitle: string
  companyDisplayName: string
  clientId: string
  quotePreview: string
  type: TestimonialType
  categoryIds: string[]
  active: boolean
  sortOrder: number
  status: PageStatus
  approval: TestimonialApproval
  publicEligible: boolean
  referenced: boolean
  dummy: boolean
  source: PageSource
  hasUnpublishedChanges: boolean
  publishedVersion: number | null
  updatedAt: string
  updatedBy: ActorRef
}

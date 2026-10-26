import { z } from 'zod'

// Public Creative contract.
//
// 1. `PublicCreativeResponse` — what GET /api/public/pages/creative returns.
//    Always an explicit status: never a draft, never workflow metadata.
// 2. `CreativePageContent` — the one normalized shape the public Creative
//    components render, whichever source (legacy code or CMS) produced it.

const str = z.string()
const strs = z.array(str)

// A response that doesn't match falls back to legacy content (see
// useCreativePage). Unknown refs are dropped/replaced by the adapter.
const ResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('disabled') }),
  z.object({ status: z.literal('unpublished') }),
  z.object({
    status: z.literal('published'),
    version: z.number().int(),
    publishedAt: str,
    content: z.object({
      hero: z.object({
        eyebrow: str,
        markerMeta: str,
        headlineLine1: str.min(1),
        headlineLine2: str.min(1),
        lede: str,
        primaryCtaLabel: str,
        primaryCtaUrl: str,
        secondaryCtaLabel: str
      }),
      services: z.object({
        sectionLabel: str,
        eyebrow: str,
        title: str,
        items: z
          .array(
            z.object({
              id: str,
              title: str.min(1),
              body: str,
              keywords: strs,
              related: z.array(z.object({ label: str, url: str })),
              image: str.min(1),
              imageWidth: z.number(),
              imageHeight: z.number(),
              imageAlt: str
            })
          )
          .min(1)
      }),
      wall: z.object({
        sectionLabel: str,
        titleLead: str,
        titleAccent: str,
        visuals: z.array(z.object({ id: str, image: str.min(1), label: str })).min(3)
      }),
      work: z.object({
        sectionLabel: str,
        sectionMeta: str,
        eyebrow: str,
        title: str,
        feature: z.object({
          title: str,
          category: str,
          imageRef: str,
          challenge: strs,
          gamePlan: str,
          funnel: z.array(z.object({ stage: str, text: str })).length(4),
          playbook: strs
        }),
        campaignRef: str,
        testimonialRef: str,
        uiux: z.object({ title: str, label: str, items: z.array(z.object({ id: str, ref: str })).min(1) })
      }),
      why: z.object({ leadLabel: str, statementSource: str, standardRefs: strs.min(1), milestoneRefs: strs.min(1) }),
      seo: z.object({ metaTitle: str, metaDescription: str, ogImage: str, canonicalUrl: str, noIndex: z.boolean() })
    })
  })
])
export const PublicCreativeResponseSchema = ResponseSchema
export type PublicCreativeResponse = z.infer<typeof PublicCreativeResponseSchema>
export type PublicCreativePublished = Extract<PublicCreativeResponse, { status: 'published' }>

export type CreativeArtKey = 'communication' | 'campaign' | 'social' | 'video' | 'production' | 'brand'

export interface CreativeServiceItem {
  key: string
  index: string
  title: string
  body: string
  keywords: string[]
  /** `to` absent = links to '#' (current behaviour). */
  related: { label: string; to?: string }[]
  /** Interim illustration, only drawn when there is no image. */
  art: CreativeArtKey
  image?: { src: string; w: number; h: number }
  imageAlt: string
}

export interface CreativeProjectCard {
  title: string
  category: string
  image: string
  to: string
}

export interface CreativePageContent {
  source: 'legacy' | 'cms'
  cmsVersion: number | null
  hero: {
    eyebrow: string
    markerMeta: string
    // Line 2's last word is outlined and followed by the period (code).
    headlineLines: [string, string]
    lede: string
    primaryCta: { label: string; href: string }
    // Action (scroll to #creative-services) is code-managed.
    secondaryCtaLabel: string
  }
  services: { sectionLabel: string; eyebrow: string; title: string; items: CreativeServiceItem[] }
  // Also feeds the hero trail + fan (first three).
  wall: { sectionLabel: string; titleLead: string; titleAccent: string; visuals: { key: string; src: string; label: string }[] }
  work: {
    sectionLabel: string
    sectionMeta: string
    eyebrow: string
    title: string
    feature: {
      title: string
      category: string
      image: string
      challenge: string[]
      gamePlan: string
      funnel: { stage: string; text: string }[]
      playbook: string[]
    }
    campaign: CreativeProjectCard & { description: string }
    testimonial: { name: string; role: string; quote: string; photo?: string }
    uiux: { title: string; label: string; items: CreativeProjectCard[] }
  }
  why: { leadLabel: string; statement: string; standards: { name: string; body: string }[]; milestones: { year: string; text: string }[] }
  seo: { title: string; description: string; image: string; canonical?: string; noIndex?: boolean }
}

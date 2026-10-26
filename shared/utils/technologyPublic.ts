import { z } from 'zod'

// Public Technology contract.
//
// 1. `PublicTechnologyResponse` — what GET /api/public/pages/technology
//    returns. Always an explicit status: never a draft, never workflow
//    metadata.
// 2. `TechnologyPageContent` — the one normalized shape the public
//    Technology components render, whichever source (legacy code or CMS)
//    produced it.

const str = z.string()

// A response that doesn't match falls back to legacy content (see
// useTechnologyPage). Unknown work refs are dropped by the adapter.
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
        headlineLine1: str.min(1),
        headlineLine2: str.min(1),
        headlineLine3: str.min(1),
        lede: str,
        primaryCtaLabel: str,
        primaryCtaUrl: str,
        secondaryCtaLabel: str
      }),
      capabilities: z.object({
        eyebrow: str,
        title: str,
        items: z
          .array(
            z.object({
              id: str,
              title: str.min(1),
              body: str,
              keywords: z.array(str),
              related: z.array(z.object({ label: str, url: str })),
              image: str,
              imageAlt: str
            })
          )
          .min(1)
      }),
      work: z.object({
        sectionLabel: str,
        eyebrow: str,
        title: str,
        items: z.array(z.object({ id: str, ref: str })).min(1)
      }),
      seo: z.object({ metaTitle: str, metaDescription: str, ogImage: str, canonicalUrl: str, noIndex: z.boolean() })
    })
  })
])
export const PublicTechnologyResponseSchema = ResponseSchema
export type PublicTechnologyResponse = z.infer<typeof PublicTechnologyResponseSchema>
export type PublicTechnologyPublished = Extract<PublicTechnologyResponse, { status: 'published' }>

export interface TechnologyCapabilityItem {
  key: string
  index: string
  title: string
  body: string
  keywords: string[]
  /** `to` absent = plain label. */
  related: { label: string; to?: string }[]
  image: string
  imageAlt: string
}

export interface TechnologyWorkCard {
  kind: 'case' | 'project'
  title: string
  client?: string
  category: string
  image: string
  imageKind: 'poster' | 'screen'
  metrics: { value: string; label: string }[]
  to: string
}

export interface TechnologyPageContent {
  source: 'legacy' | 'cms'
  cmsVersion: number | null
  hero: {
    eyebrow: string
    // Three masked display lines; the last sits on the yellow marker and
    // gets the yellow period from code.
    headlineLines: [string, string, string]
    lede: string
    primaryCta: { label: string; href: string }
    // Action (scroll to #capabilities) is code-managed.
    secondaryCtaLabel: string
  }
  capabilities: { eyebrow: string; title: string; items: TechnologyCapabilityItem[] }
  work: { sectionLabel: string; eyebrow: string; title: string; cards: TechnologyWorkCard[] }
  seo: { title: string; description: string; image: string; canonical?: string; noIndex?: boolean }
}

import { z } from 'zod'

// Public About contract (Step 3).
//
// 1. `PublicAboutResponse` — what GET /api/public/pages/about returns. It's
//    always an explicit status: never a draft, never workflow metadata.
// 2. `AboutPageContent` — the one normalized shape the public About
//    components render, whichever source (legacy code or CMS) produced it.

const str = z.string()
const PublicItem = z.object({ id: str })

// Only the fields the adapter actually maps are required; anything else in
// the snapshot is ignored. A response that doesn't match falls back to
// legacy content (see useAboutPage).
export const PublicAboutResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('disabled') }),
  z.object({ status: z.literal('unpublished') }),
  z.object({
    status: z.literal('published'),
    version: z.number().int(),
    publishedAt: str,
    content: z.object({
      hero: z.object({ eyebrow: str, primaryCtaLabel: str, primaryCtaUrl: str, secondaryCtaLabel: str }),
      story: z.object({ paragraphs: z.array(str).min(1) }),
      vision: z.object({ title: str, description: str }),
      mission: z.object({ title: str, description: str }),
      values: z.array(PublicItem.extend({ title: str, description: str })),
      milestones: z.array(PublicItem.extend({ yearOrPeriod: str, title: str })),
      // Omitted by the server unless the proof sub-flag is on.
      proof: z.array(PublicItem.extend({ value: str, label: str })).optional(),
      leadership: z.array(PublicItem.extend({ name: str, role: str, portrait: str, portraitAlt: str }))
    })
  })
])
export type PublicAboutResponse = z.infer<typeof PublicAboutResponseSchema>
export type PublicAboutPublished = Extract<PublicAboutResponse, { status: 'published' }>

export interface AboutPillarItem {
  index: string
  name: string
  meaning: string
  visual: string
}

export interface AboutPageContent {
  source: 'legacy' | 'cms'
  cmsVersion: number | null
  hero: {
    eyebrow: string
    // Headline is animation-critical (letter scatter + two-word marker
    // tail) and stays code-managed.
    promise: string
    lead: string
    animatedWord: string
    tail: string
    essence: string
    positioning: string
    companyName: string
    primaryCta: { label: string; href: string }
    secondaryCtaLabel: string
  }
  story: {
    introHeading: string
    introBody: string
    more: string[]
    accentWords: string[]
    facts: { label: string; value: string }[]
    method: string[]
  }
  visionMission: { visionLabel: string; vision: string; missionLabel: string; mission: string }
  standards: { key: string; name: string; body: string }[]
  milestones: { key: string; year: string; text: string }[]
  founder: {
    name: string
    role: string
    photo: string
    photoAlt: string
    eyebrow: string
    meta: string
    quote: string
    foreword: string[]
  }
  venn: {
    positioning: string
    coreEmotion: string[]
    stats: { key: string; value: number; decimals: number; suffix: string; label: string }[]
  }
}

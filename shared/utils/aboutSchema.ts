import { z } from 'zod'
import {
  canonicalUrl,
  ctaPair,
  itemId,
  linkUrl,
  maxActive,
  mediaAlt,
  mediaRef,
  SeoSchema,
  sortOrder,
  text,
  type SingletonAdminState,
  type WithId
} from '#shared/cms/fields'

// Kept as re-exports: existing callers import these from here.
export { CANONICAL_HOSTS, isSafeLinkUrl, MEDIA_REF, type ActorRef, type PageStatus } from '#shared/cms/fields'

// About page CMS content model (Step 2). Structured, plain-text fields only:
// no HTML, no layout/typography/motion/colour controls — the codebase owns
// design. One schema validates on the server (authoritative) and gives the
// admin form the same messages client-side.

// Design-safe limits (Step 3 copy stress test on the real About components
// at 390/820/1366/1920px). Values above these were schema-valid but broke
// the layout: multi-line CTA pills, a 48px Vision wall, role text spilling
// over the Founder photo badge, Venn numbers overlapping, Journey rows
// beyond the single 5-column rail. Roughly 1.5–2× today's real copy.
export const ABOUT_LIMITS = {
  heroEyebrow: 32,
  ctaLabel: 24,
  storyParagraphs: 4,
  storyParagraph: 600,
  storyIntro: 360,
  vmTitle: 24,
  vision: 200,
  mission: 400,
  valueTitle: 32,
  valueBody: 320,
  valuesActive: 6,
  milestoneYear: 12,
  milestoneTitle: 120,
  milestonesActive: 5,
  proofLabel: 40,
  proofActive: 4,
  leaderRole: 32
} as const
// Venn stat: up to 4 digits (or 2.1 decimal) + up to 2 suffix chars, e.g.
// 70+ · 4.3 · 100% · 50K. Longer values overflow the 2-column stat grid.
export const PROOF_VALUE_PATTERN = /^(\d{1,4}|\d{1,2}\.\d)([^\d\s.]{0,2})$/


export const VALUE_ICONS = ['none', 'spark', 'shield', 'gauge', 'handshake', 'layers', 'target'] as const



const HeroSchema = z
  .object({
    eyebrow: text(ABOUT_LIMITS.heroEyebrow),
    headline: text(140, { required: true }),
    supportingCopy: text(400),
    primaryCtaLabel: text(ABOUT_LIMITS.ctaLabel),
    primaryCtaUrl: linkUrl,
    secondaryCtaLabel: text(ABOUT_LIMITS.ctaLabel),
    secondaryCtaUrl: linkUrl,
    heroMedia: mediaRef,
    heroMediaAlt: text(160)
  })
  .strict()
  .superRefine((v, ctx) => {
    ctaPair('primaryCtaLabel', 'primaryCtaUrl')(v, ctx)
    ctaPair('secondaryCtaLabel', 'secondaryCtaUrl')(v, ctx)
    mediaAlt('heroMedia', 'heroMediaAlt')(v, ctx)
  })

const StorySchema = z
  .object({
    sectionLabel: text(60),
    // Optional: the current page has no story title (Step 4 migration).
    title: text(140),
    paragraphs: z
      .array(text(ABOUT_LIMITS.storyParagraph, { required: true }))
      .min(1, 'Add at least one paragraph.')
      .max(ABOUT_LIMITS.storyParagraphs, `Max ${ABOUT_LIMITS.storyParagraphs} paragraphs.`)
      .superRefine((list, ctx) => {
        if ((list[0]?.length ?? 0) > ABOUT_LIMITS.storyIntro) ctx.addIssue({ code: 'custom', path: [0], message: `The opening statement is shown large — max ${ABOUT_LIMITS.storyIntro} characters.` })
      }),
    supportingMedia: mediaRef,
    supportingMediaAlt: text(160)
  })
  .strict()
  .superRefine(mediaAlt('supportingMedia', 'supportingMediaAlt'))

const VisionSchema = z.object({ title: text(ABOUT_LIMITS.vmTitle, { required: true }), description: text(ABOUT_LIMITS.vision, { required: true }) }).strict()

const MissionPointSchema = z.object({ id: itemId, text: text(240, { required: true }), sortOrder, active: z.boolean() }).strict()
const MissionSchema = z
  .object({
    title: text(ABOUT_LIMITS.vmTitle, { required: true }),
    description: text(ABOUT_LIMITS.mission, { required: true }),
    points: z.array(MissionPointSchema).max(10, 'Max 10 mission points.')
  })
  .strict()

const ValueSchema = z
  .object({
    id: itemId,
    title: text(ABOUT_LIMITS.valueTitle, { required: true }),
    description: text(ABOUT_LIMITS.valueBody),
    iconOrVisual: z.enum(VALUE_ICONS),
    sortOrder,
    active: z.boolean()
  })
  .strict()

const MilestoneSchema = z
  .object({
    id: itemId,
    yearOrPeriod: text(ABOUT_LIMITS.milestoneYear, { required: true }),
    title: text(ABOUT_LIMITS.milestoneTitle, { required: true }),
    description: text(600),
    optionalMedia: mediaRef,
    optionalMediaAlt: text(160),
    sortOrder,
    active: z.boolean()
  })
  .strict()
  .superRefine(mediaAlt('optionalMedia', 'optionalMediaAlt'))

const ProofSchema = z
  .object({
    id: itemId,
    value: text(12, { required: true }).refine((v) => PROOF_VALUE_PATTERN.test(v), 'Use a short number like 70+, 4.3, 100% or 50K.'),
    label: text(ABOUT_LIMITS.proofLabel, { required: true }),
    supportingText: text(240),
    sortOrder,
    active: z.boolean()
  })
  .strict()

const LeaderSchema = z
  .object({
    id: itemId,
    name: text(80, { required: true }),
    role: text(ABOUT_LIMITS.leaderRole, { required: true }),
    shortBio: text(800),
    portrait: mediaRef,
    portraitAlt: text(160),
    sortOrder,
    active: z.boolean()
  })
  .strict()
  .superRefine(mediaAlt('portrait', 'portraitAlt'))

const CtaSchema = z
  .object({
    eyebrow: text(60),
    // Optional: the page uses the global footer CTA, not an About CTA.
    title: text(140),
    supportingCopy: text(400),
    primaryCtaLabel: text(40),
    primaryCtaUrl: linkUrl,
    secondaryCtaLabel: text(40),
    secondaryCtaUrl: linkUrl
  })
  .strict()
  .superRefine((v, ctx) => {
    ctaPair('primaryCtaLabel', 'primaryCtaUrl')(v, ctx)
    ctaPair('secondaryCtaLabel', 'secondaryCtaUrl')(v, ctx)
  })


export const AboutContentSchema = z
  .object({
    hero: HeroSchema,
    story: StorySchema,
    vision: VisionSchema,
    mission: MissionSchema,
    values: z.array(ValueSchema).max(12, 'Max 12 values.').superRefine(maxActive(ABOUT_LIMITS.valuesActive, 'values')),
    milestones: z.array(MilestoneSchema).max(30, 'Max 30 milestones.').superRefine(maxActive(ABOUT_LIMITS.milestonesActive, 'milestones')),
    proof: z.array(ProofSchema).max(12, 'Max 12 proof items.').superRefine(maxActive(ABOUT_LIMITS.proofActive, 'proof items')),
    leadership: z.array(LeaderSchema).max(12, 'Max 12 people.'),
    cta: CtaSchema,
    seo: SeoSchema
  })
  .strict()

export type AboutContentInput = z.infer<typeof AboutContentSchema>

// Stored shape: every repeater item has a server-assigned id.
export interface AboutContent extends Omit<AboutContentInput, 'values' | 'milestones' | 'proof' | 'leadership' | 'mission'> {
  mission: Omit<AboutContentInput['mission'], 'points'> & { points: WithId<AboutContentInput['mission']['points'][number]>[] }
  values: WithId<AboutContentInput['values'][number]>[]
  milestones: WithId<AboutContentInput['milestones'][number]>[]
  proof: WithId<AboutContentInput['proof'][number]>[]
  leadership: WithId<AboutContentInput['leadership'][number]>[]
}

export type AboutSectionKey = keyof AboutContent
export const ABOUT_SECTIONS: { key: AboutSectionKey; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'story', label: 'Company Story' },
  { key: 'vision', label: 'Vision' },
  { key: 'mission', label: 'Mission' },
  { key: 'values', label: 'Values' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'proof', label: 'Company Proof' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'cta', label: 'CTA' },
  { key: 'seo', label: 'SEO' }
]

export type AboutAdminState = SingletonAdminState<'about', AboutContent>

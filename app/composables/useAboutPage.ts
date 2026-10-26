import { PROOF_VALUE_PATTERN } from '#shared/utils/aboutSchema'
import { PublicAboutResponseSchema, type AboutPageContent, type PublicAboutPublished } from '#shared/utils/aboutPublic'

// Public /about content source (Step 3). The page resolves content ONCE and
// every About section reads the same normalized shape via useAboutPage() —
// no section knows whether it came from code or from the CMS.
//
//   legacy:  useAbout / useCompany / useWhoWeAre  → buildLegacyAboutContent
//   cms:     GET /api/public/pages/about           → adaptAboutCms(legacy, …)
//
// The CMS source is used only when the SERVER says so (runtime config flag,
// see server/api/public/pages/about.get.ts). Any failure, a disabled flag,
// no published snapshot or an unexpected response → legacy content.

const STATE_KEY = 'about-page-content'

export function buildLegacyAboutContent(): AboutPageContent {
  const about = useAbout()
  const c = about.company
  const { link: whatsappLink } = useWhatsapp()
  return {
    source: 'legacy',
    cmsVersion: null,
    hero: {
      eyebrow: about.eyebrow,
      promise: about.promise,
      lead: 'We turn',
      animatedWord: 'complexity',
      tail: 'into certainty',
      essence: about.essence,
      positioning: about.positioning,
      companyName: about.companyName,
      primaryCta: { label: 'Work with us', href: whatsappLink },
      secondaryCtaLabel: 'How PASTI works'
    },
    story: {
      introHeading: about.introHeading,
      introBody: about.introBody,
      more: about.storyMore,
      accentWords: ['technology', 'creativity', 'unified', 'scalable', 'measurable'],
      facts: c.facts,
      method: about.method
    },
    visionMission: { visionLabel: 'Vision', vision: c.vision, missionLabel: 'Mission', mission: c.mission },
    standards: c.standards.map((s) => ({ key: s.name.toLowerCase(), name: s.name, body: s.body })),
    milestones: c.milestones.map((m) => ({ key: m.year, year: m.year, text: m.text })),
    founder: {
      ...c.founder,
      photoAlt: `${c.founder.name}, ${c.founder.role} of PASTI`
    },
    venn: {
      positioning: about.positioning,
      coreEmotion: about.coreEmotion,
      stats: about.stats.map((s) => ({ key: s.label, value: s.value, decimals: 0, suffix: s.suffix ?? '', label: s.label }))
    }
  }
}

// Maps ONLY the CMS fields with an exact equivalent in the current design.
// Everything else (headline, facts, method, quote/foreword, pillars, Venn
// structure, clients, SEO) stays from the legacy source.
export function adaptAboutCms(legacy: AboutPageContent, cms: PublicAboutPublished): AboutPageContent {
  const c = cms.content
  const out: AboutPageContent = structuredClone(legacy)
  out.source = 'cms'
  out.cmsVersion = cms.version

  // Hero — eyebrow + CTA copy. The animated headline is not CMS-driven.
  if (c.hero.eyebrow) out.hero.eyebrow = c.hero.eyebrow
  if (c.hero.primaryCtaLabel && c.hero.primaryCtaUrl) out.hero.primaryCta = { label: c.hero.primaryCtaLabel, href: c.hero.primaryCtaUrl }
  if (c.hero.secondaryCtaLabel) out.hero.secondaryCtaLabel = c.hero.secondaryCtaLabel

  // Story — paragraph 1 is the word-by-word statement, the rest the body.
  out.story.introBody = c.story.paragraphs[0]!
  out.story.more = c.story.paragraphs.slice(1)

  out.visionMission = { visionLabel: c.vision.title, vision: c.vision.description, missionLabel: c.mission.title, mission: c.mission.description }

  // Lists arrive active-only and in sortOrder from the server.
  if (c.values.length) out.standards = c.values.map((v) => ({ key: v.id, name: v.title, body: v.description }))
  if (c.milestones.length) out.milestones = c.milestones.map((m) => ({ key: m.id, year: m.yearOrPeriod, text: m.title }))

  if (c.proof?.length) {
    const stats = c.proof.map((p) => {
      const m = PROOF_VALUE_PATTERN.exec(p.value)
      if (!m) return null
      const decimals = m[1]!.includes('.') ? m[1]!.split('.')[1]!.length : 0
      return { key: p.id, value: Number(m[1]), decimals, suffix: m[2] ?? '', label: p.label }
    })
    if (stats.every((s) => s !== null)) out.venn.stats = stats as AboutPageContent['venn']['stats']
  }

  // Leadership — the quote and foreword are this person's own words and stay
  // code-managed, so CMS may only update the record of the SAME person
  // (role, portrait, alt). A different name would put someone else's name on
  // those words; in that case the legacy founder is kept.
  const lead = c.leadership[0]
  if (lead && lead.name === legacy.founder.name) {
    out.founder.role = lead.role
    if (lead.portrait) {
      out.founder.photo = lead.portrait
      out.founder.photoAlt = lead.portraitAlt
    }
  }
  return out
}

// Called once by pages/about.vue.
export async function resolveAboutPageContent() {
  const legacy = buildLegacyAboutContent()
  const state = useState<AboutPageContent>(STATE_KEY, () => legacy)

  const { data } = await useAsyncData('about-cms-source', async () => {
    // SSR: skip the call entirely when the server-side flag is off.
    if (import.meta.server && !aboutCmsEnabledOnServer()) return { status: 'disabled' as const }
    try {
      const raw = await $fetch('/api/public/pages/about', { timeout: 2500 })
      const parsed = PublicAboutResponseSchema.safeParse(raw)
      if (!parsed.success) {
        if (import.meta.server) console.error('[about] CMS response failed validation — using legacy content')
        return { status: 'invalid' as const }
      }
      return parsed.data
    } catch (err) {
      if (import.meta.server) console.error('[about] CMS source unavailable — using legacy content:', (err as Error).message)
      return { status: 'error' as const }
    }
  })

  state.value = data.value?.status === 'published' ? adaptAboutCms(legacy, data.value) : legacy
  return state
}

function aboutCmsEnabledOnServer(): boolean {
  // Private runtime config — only readable during SSR, never in the bundle.
  const cms = useRuntimeConfig().cms as { aboutPublicEnabled?: unknown } | undefined
  return String(cms?.aboutPublicEnabled) === 'true'
}

// Every About section reads content through this.
export function useAboutPage(): AboutPageContent {
  const state = useState<AboutPageContent | undefined>(STATE_KEY)
  return state.value ?? buildLegacyAboutContent()
}

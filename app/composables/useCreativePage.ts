import type { InjectionKey } from 'vue'
import { isSafeLinkUrl } from '#shared/cms/fields'
import {
  COMPANY_MILESTONE_REFS,
  COMPANY_STANDARD_REFS,
  CREATIVE_TESTIMONIAL_REFS,
  CREATIVE_WORK_REFS
} from '#shared/utils/creativeSchema'
import {
  PublicCreativeResponseSchema,
  type CreativePageContent,
  type CreativeProjectCard,
  type PublicCreativePublished
} from '#shared/utils/creativePublic'

// Public /creative content source. The page resolves content ONCE and the
// Creative sections read the same normalized shape via useCreativePage() —
// no section knows whether it came from code or from the CMS.
//
//   legacy:  useCreative / useWhatsapp / pageSeo  → buildLegacyCreativeContent
//   cms:     GET /api/public/pages/creative        → adaptCreativeCms(legacy, …)
//
// The CMS source is used only when the SERVER says so (runtime config flag,
// see server/api/public/pages/creative.get.ts). Any failure, a disabled
// flag, no published snapshot or an unexpected response → legacy content.
// useCreative() itself stays untouched (useInsights reads it).

const STATE_KEY = 'creative-page-content'
const PREVIEW_KEY: InjectionKey<CreativePageContent> = Symbol('creative-preview')

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function buildLegacyCreativeContent(): CreativePageContent {
  const c = useCreative()
  const { link: whatsappLink } = useWhatsapp()
  // "Creative that gets business results." → the last two words start line two.
  const words = c.heading.replace(/\.$/, '').split(' ')
  return {
    source: 'legacy',
    cmsVersion: null,
    hero: {
      eyebrow: c.eyebrow,
      markerMeta: 'Move to paint',
      headlineLines: [words.slice(0, -2).join(' '), words.slice(-2).join(' ')],
      lede: c.introBody,
      primaryCta: { label: 'Brief us', href: whatsappLink },
      secondaryCtaLabel: 'What we make'
    },
    services: {
      sectionLabel: 'Services',
      eyebrow: c.servicesEyebrow,
      title: c.servicesHeading,
      items: c.services.map((s) => ({
        key: s.index,
        index: s.index,
        title: s.title,
        body: s.body,
        keywords: [...s.keywords],
        related: s.related.map((r) => ({ ...r })),
        art: s.art,
        ...(s.image ? { image: { ...s.image } } : {}),
        imageAlt: ''
      }))
    },
    wall: { sectionLabel: 'Studio wall', titleLead: 'Made in the', titleAccent: 'studio', visuals: c.visuals.map((v) => ({ key: v.src, src: v.src, label: v.label })) },
    work: {
      sectionLabel: 'Selected work',
      sectionMeta: 'Creative',
      eyebrow: 'Proof of craft',
      title: 'Selected creative work',
      feature: {
        title: c.work.feature.title,
        category: c.work.feature.category,
        image: c.work.feature.image,
        challenge: [...c.work.feature.challenge],
        gamePlan: c.work.feature.gamePlan,
        funnel: c.work.feature.funnel.map((f) => ({ ...f })),
        playbook: [...c.work.feature.playbook]
      },
      campaign: { ...c.work.campaign },
      testimonial: { ...c.work.testimonial },
      uiux: { title: 'UI/UX & digital experience', label: 'Brand Identity & UI/UX Design', items: c.work.uiux.map((u) => ({ ...u })) }
    },
    why: {
      leadLabel: c.why.leadLabel,
      statement: c.why.statement,
      standards: c.why.standards.map((s) => ({ name: s.name, body: s.body })),
      milestones: c.why.milestones.map((m) => ({ year: m.year, text: m.text }))
    },
    seo: { ...pageSeo.creative }
  }
}

// ---- TEMPORARY reference layer (until Work / Testimonial / Company CMS) ----
// A ref names an existing record; the card is built from that record exactly
// as useCreative builds it today. Unknown refs resolve to nothing.

function projectFor(ref: string) {
  if (!(CREATIVE_WORK_REFS as readonly string[]).includes(ref)) return null
  return useSelectedWork().projects.find((p) => `work:${p.index}` === ref) ?? null
}

// UI/UX tiles: the two app projects link to their /work case studies
// (same rule as useCreative), the others to their portfolio entry.
export function resolveCreativeUiuxRef(ref: string): CreativeProjectCard | null {
  const p = projectFor(ref)
  if (!p) return null
  const to = p.title === 'PowerHours' ? '/work#case-powerhours' : p.title === 'HDI Healthy Lifestyle' ? '/work#case-hdi' : `/work#work-${p.index}`
  return { title: p.title, category: p.category, image: p.image, to }
}

export function resolveCreativeCampaignRef(ref: string): (CreativeProjectCard & { description: string }) | null {
  const p = projectFor(ref)
  return p ? { title: p.title, category: p.category, description: p.description, image: p.image, to: `/work#work-${p.index}` } : null
}

export function resolveCreativeProjectImage(ref: string): string | null {
  return projectFor(ref)?.image ?? null
}

export function resolveCreativeTestimonialRef(ref: string) {
  if (!(CREATIVE_TESTIMONIAL_REFS as readonly string[]).includes(ref)) return null
  const t = useTestimonials().testimonials.find((x) => x.status === 'verified' && `t:${slug(x.name)}` === ref)
  return t ? { name: t.name, role: t.role, quote: t.quote, photo: t.photo } : null
}

export function resolveCompanyStandardRef(ref: string) {
  if (!(COMPANY_STANDARD_REFS as readonly string[]).includes(ref)) return null
  const s = useCompany().standards.find((x) => slug(x.name) === ref)
  return s ? { name: s.name, body: s.body } : null
}

export function resolveCompanyMilestoneRef(ref: string) {
  if (!(COMPANY_MILESTONE_REFS as readonly string[]).includes(ref)) return null
  const m = useCompany().milestones.find((x) => slug(x.year) === ref)
  return m ? { year: m.year, text: m.text } : null
}

// The refs today's legacy page corresponds to (used by the migration).
export function creativeLegacyRefs(legacy: CreativePageContent) {
  const company = useCompany()
  const projects = useSelectedWork().projects
  const byImage = (img: string) => projects.find((p) => p.image === img)
  const byTitle = (t: string) => projects.find((p) => p.title === t)
  const ref = (p: { index: string } | undefined) => (p ? `work:${p.index}` : '')
  return {
    featureImageRef: ref(byImage(legacy.work.feature.image)),
    campaignRef: ref(byTitle(legacy.work.campaign.title)),
    testimonialRef: `t:${slug(legacy.work.testimonial.name)}`,
    uiuxRefs: legacy.work.uiux.items.map((u) => ref(byTitle(u.title))),
    statementSource: legacy.why.statement === company.mission ? 'mission' : legacy.why.statement === company.vision ? 'vision' : '',
    standardRefs: legacy.why.standards.map((s) => slug(s.name)),
    milestoneRefs: legacy.why.milestones.map((m) => slug(m.year))
  }
}

// Maps the published CMS content onto the normalized shape. Lists arrive
// active-only and in sortOrder from the server. Links are re-checked here
// (defense in depth); anything unusable keeps the legacy value.
export function adaptCreativeCms(legacy: CreativePageContent, cms: Pick<PublicCreativePublished, 'version' | 'content'>): CreativePageContent {
  const c = cms.content
  const out: CreativePageContent = structuredClone(legacy)
  out.source = 'cms'
  out.cmsVersion = cms.version

  out.hero = {
    eyebrow: c.hero.eyebrow,
    markerMeta: c.hero.markerMeta,
    headlineLines: [c.hero.headlineLine1, c.hero.headlineLine2],
    lede: c.hero.lede,
    primaryCta: isSafeLinkUrl(c.hero.primaryCtaUrl) ? { label: c.hero.primaryCtaLabel, href: c.hero.primaryCtaUrl } : legacy.hero.primaryCta,
    secondaryCtaLabel: c.hero.secondaryCtaLabel
  }

  if (c.services.items.length) {
    out.services = {
      sectionLabel: c.services.sectionLabel,
      eyebrow: c.services.eyebrow,
      title: c.services.title,
      items: c.services.items.map((s, i) => ({
        key: s.id,
        index: String(i + 1).padStart(2, '0'),
        title: s.title,
        body: s.body,
        keywords: s.keywords,
        related: s.related.map((r) => (r.url && isSafeLinkUrl(r.url) ? { label: r.label, to: r.url } : { label: r.label })),
        // The interim illustration only draws without an image (never, in CMS).
        art: legacy.services.items.find((l) => l.title === s.title)?.art ?? 'communication',
        image: { src: s.image, w: s.imageWidth, h: s.imageHeight },
        imageAlt: s.imageAlt
      }))
    }
  }

  if (c.wall.visuals.length >= 3) {
    out.wall = { sectionLabel: c.wall.sectionLabel, titleLead: c.wall.titleLead, titleAccent: c.wall.titleAccent, visuals: c.wall.visuals.map((v) => ({ key: v.id, src: v.image, label: v.label })) }
  }

  const w = c.work
  const uiux = w.uiux.items.map((u) => resolveCreativeUiuxRef(u.ref)).filter((x): x is CreativeProjectCard => !!x)
  out.work = {
    sectionLabel: w.sectionLabel,
    sectionMeta: w.sectionMeta,
    eyebrow: w.eyebrow,
    title: w.title,
    feature: {
      title: w.feature.title,
      category: w.feature.category,
      image: resolveCreativeProjectImage(w.feature.imageRef) ?? legacy.work.feature.image,
      challenge: w.feature.challenge,
      gamePlan: w.feature.gamePlan,
      funnel: w.feature.funnel,
      playbook: w.feature.playbook
    },
    campaign: resolveCreativeCampaignRef(w.campaignRef) ?? legacy.work.campaign,
    testimonial: resolveCreativeTestimonialRef(w.testimonialRef) ?? legacy.work.testimonial,
    uiux: { title: w.uiux.title, label: w.uiux.label, items: uiux.length ? uiux : legacy.work.uiux.items }
  }

  const company = useCompany()
  const standards = c.why.standardRefs.map(resolveCompanyStandardRef).filter((x) => !!x)
  const milestones = c.why.milestoneRefs.map(resolveCompanyMilestoneRef).filter((x) => !!x)
  out.why = {
    leadLabel: c.why.leadLabel,
    statement: c.why.statementSource === 'vision' ? company.vision : c.why.statementSource === 'mission' ? company.mission : legacy.why.statement,
    standards: standards.length ? standards : legacy.why.standards,
    milestones: milestones.length >= 3 ? milestones : legacy.why.milestones
  }

  out.seo = {
    title: c.seo.metaTitle,
    description: c.seo.metaDescription,
    image: c.seo.ogImage || legacy.seo.image,
    ...(c.seo.canonicalUrl ? { canonical: c.seo.canonicalUrl } : {}),
    ...(c.seo.noIndex ? { noIndex: true } : {})
  }
  return out
}

// Called once by pages/creative.vue.
export async function resolveCreativePageContent() {
  const legacy = buildLegacyCreativeContent()
  const state = useState<CreativePageContent>(STATE_KEY, () => legacy)

  const { data } = await useAsyncData('creative-cms-source', async () => {
    // SSR: skip the call entirely when the server-side flag is off.
    if (import.meta.server && !creativeCmsEnabledOnServer()) return { status: 'disabled' as const }
    try {
      const raw = await $fetch('/api/public/pages/creative', { timeout: 2500 })
      const parsed = PublicCreativeResponseSchema.safeParse(raw)
      if (!parsed.success) {
        if (import.meta.server) console.error('[creative] CMS response failed validation — using legacy content')
        return { status: 'invalid' as const }
      }
      return parsed.data
    } catch (err) {
      if (import.meta.server) console.error('[creative] CMS source unavailable — using legacy content:', (err as Error).message)
      return { status: 'error' as const }
    }
  })

  state.value = data.value?.status === 'published' ? adaptCreativeCms(legacy, data.value) : legacy
  return state
}

function creativeCmsEnabledOnServer(): boolean {
  // Private runtime config — only readable during SSR, never in the bundle.
  const cms = useRuntimeConfig().cms as { creativePublicEnabled?: unknown } | undefined
  return String(cms?.creativePublicEnabled) === 'true'
}

// Admin draft preview: renders the real Creative components with draft
// content provided to that subtree only (never written to public state).
export function provideCreativePreview(content: CreativePageContent) {
  provide(PREVIEW_KEY, content)
}

// Every Creative section reads content through this.
export function useCreativePage(): CreativePageContent {
  const preview = inject(PREVIEW_KEY, null)
  if (preview) return preview
  const state = useState<CreativePageContent | undefined>(STATE_KEY)
  return state.value ?? buildLegacyCreativeContent()
}

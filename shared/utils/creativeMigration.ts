import type { CreativeContent } from './creativeSchema'
import type { CreativePageContent } from './creativePublic'

// Legacy Creative → CMS content. Pure and deterministic: the same legacy
// input always yields the same CMS content with the same item ids, so
// re-running the migration never duplicates or reshuffles records.
//
// Source of truth is the CURRENT public /creative as rendered today — the
// normalized legacy shape from buildLegacyCreativeContent() (useCreative +
// Hero/Services/Wall/Work template constants + pageSeo.creative) plus the
// refs that shape corresponds to. Nothing is rewritten or invented.

export const CREATIVE_MIGRATION_VERSION = 'creative-v1'

export interface CreativeLegacyRefs {
  featureImageRef: string
  campaignRef: string
  testimonialRef: string
  uiuxRefs: string[]
  statementSource: string
  standardRefs: string[]
  milestoneRefs: string[]
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 56)

export function legacyToCreativeContent(legacy: CreativePageContent, refs: CreativeLegacyRefs, seo: { canonicalUrl: string }): CreativeContent {
  const { hero, services, wall, work, why } = legacy
  // The schema enums are the allowlists; values are checked by the caller.
  type C = CreativeContent
  return {
    hero: {
      eyebrow: hero.eyebrow,
      markerMeta: hero.markerMeta,
      headlineLine1: hero.headlineLines[0],
      headlineLine2: hero.headlineLines[1],
      lede: hero.lede,
      primaryCtaLabel: hero.primaryCta.label,
      primaryCtaUrl: hero.primaryCta.href,
      secondaryCtaLabel: hero.secondaryCtaLabel
    },
    services: {
      sectionLabel: services.sectionLabel,
      eyebrow: services.eyebrow,
      title: services.title,
      items: services.items.map((s, i) => ({
        id: `svc-${slug(s.title)}`,
        title: s.title,
        body: s.body,
        keywords: [...s.keywords],
        related: s.related.map((r) => ({ label: r.label, url: r.to ?? '' })),
        image: s.image?.src ?? '',
        imageWidth: s.image?.w ?? 0,
        imageHeight: s.image?.h ?? 0,
        imageAlt: s.imageAlt,
        sortOrder: i + 1,
        active: true
      }))
    },
    wall: {
      sectionLabel: wall.sectionLabel,
      titleLead: wall.titleLead,
      titleAccent: wall.titleAccent,
      visuals: wall.visuals.map((v, i) => ({ id: `vis-${slug(v.label)}`, image: v.src, label: v.label, sortOrder: i + 1, active: true }))
    },
    work: {
      sectionLabel: work.sectionLabel,
      sectionMeta: work.sectionMeta,
      eyebrow: work.eyebrow,
      title: work.title,
      feature: {
        title: work.feature.title,
        category: work.feature.category,
        imageRef: refs.featureImageRef as C['work']['feature']['imageRef'],
        challenge: [...work.feature.challenge],
        gamePlan: work.feature.gamePlan,
        funnel: work.feature.funnel.map((f) => ({ stage: f.stage, text: f.text })),
        playbook: [...work.feature.playbook]
      },
      campaignRef: refs.campaignRef as C['work']['campaignRef'],
      testimonialRef: refs.testimonialRef as C['work']['testimonialRef'],
      uiux: {
        title: work.uiux.title,
        label: work.uiux.label,
        items: refs.uiuxRefs.map((ref, i) => ({ id: `ux-${slug(ref)}`, ref: ref as C['work']['uiux']['items'][number]['ref'], sortOrder: i + 1, active: true }))
      }
    },
    why: {
      leadLabel: why.leadLabel,
      statementSource: refs.statementSource as C['why']['statementSource'],
      standardRefs: refs.standardRefs as C['why']['standardRefs'],
      milestoneRefs: refs.milestoneRefs as C['why']['milestoneRefs']
    },
    seo: {
      metaTitle: legacy.seo.title,
      metaDescription: legacy.seo.description,
      ogImage: legacy.seo.image,
      canonicalUrl: seo.canonicalUrl,
      noIndex: false
    }
  }
}

// Strings that only ever appear in the dev seed — used to prove a record is
// free of dummy content.
export const CREATIVE_DUMMY_MARKERS = ['[Dummy]', 'Lorem ipsum', 'Dummy primary', 'Dummy secondary', 'Demo A', 'Demo B', 'Demo link', 'Demo stage']

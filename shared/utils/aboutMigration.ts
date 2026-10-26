import type { AboutContent } from './aboutSchema'
import type { AboutPageContent } from './aboutPublic'

// Step 4 — legacy About → CMS content. Pure and deterministic: the same
// legacy input always yields the same CMS content with the same item ids,
// so re-running the migration never duplicates or reshuffles records.
//
// Source of truth is the CURRENT public /about as rendered today — the
// normalized legacy shape from buildLegacyAboutContent() (useAbout /
// useCompany / useWhoWeAre / Hero constants) plus pageSeo.about. Nothing is
// rewritten, summarized or invented: fields with no current equivalent are
// left empty.

export const ABOUT_MIGRATION_VERSION = 'about-v1'

export interface LegacySeo {
  title: string
  description: string
  image: string
  canonicalUrl: string
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 56)

export function legacyToAboutContent(legacy: AboutPageContent, seo: LegacySeo): AboutContent {
  const { hero, story, visionMission: vm, founder, venn } = legacy
  return {
    hero: {
      eyebrow: hero.eyebrow,
      // Reference copy only — the public headline stays code-managed
      // (letter scatter on "complexity" + two-word marker tail).
      headline: hero.promise,
      supportingCopy: '',
      primaryCtaLabel: hero.primaryCta.label,
      primaryCtaUrl: hero.primaryCta.href,
      secondaryCtaLabel: hero.secondaryCtaLabel,
      // The secondary CTA scrolls to the manifesto section in code.
      secondaryCtaUrl: '#about-manifesto',
      heroMedia: '',
      heroMediaAlt: ''
    },
    story: {
      sectionLabel: story.introHeading,
      title: '',
      paragraphs: [story.introBody, ...story.more],
      supportingMedia: '',
      supportingMediaAlt: ''
    },
    vision: { title: vm.visionLabel, description: vm.vision },
    mission: { title: vm.missionLabel, description: vm.mission, points: [] },
    values: legacy.standards.map((s, i) => ({
      id: `val-${slug(s.name)}`,
      title: s.name,
      description: s.body,
      iconOrVisual: 'none' as const,
      sortOrder: i + 1,
      active: true
    })),
    milestones: legacy.milestones.map((m, i) => ({
      id: `ms-${slug(m.year)}`,
      yearOrPeriod: m.year,
      title: m.text,
      description: '',
      optionalMedia: '',
      optionalMediaAlt: '',
      sortOrder: i + 1,
      active: true
    })),
    proof: venn.stats.map((s, i) => ({
      id: `pf-${slug(s.label)}`,
      value: `${s.decimals ? s.value.toFixed(s.decimals) : s.value}${s.suffix}`,
      label: s.label,
      supportingText: '',
      sortOrder: i + 1,
      active: true
    })),
    leadership: [
      {
        id: `ld-${slug(founder.name)}`,
        name: founder.name,
        role: founder.role,
        // No equivalent: the public section has a quote and a foreword, which
        // stay code-managed and are not condensed into a bio.
        shortBio: '',
        portrait: founder.photo,
        portraitAlt: founder.photoAlt,
        sortOrder: 1,
        active: true
      }
    ],
    // The page has no About-specific CTA section (the global footer CTA is
    // shared), so nothing is migrated here.
    cta: { eyebrow: '', title: '', supportingCopy: '', primaryCtaLabel: '', primaryCtaUrl: '', secondaryCtaLabel: '', secondaryCtaUrl: '' },
    seo: {
      metaTitle: seo.title,
      metaDescription: seo.description,
      ogImage: seo.image,
      canonicalUrl: seo.canonicalUrl,
      noIndex: false
    }
  }
}

// Strings that only ever appear in the dev seed — used to prove a record is
// free of dummy content.
export const DUMMY_MARKERS = ['[Dummy]', 'Lorem ipsum', 'Dummy Person', 'Dummy Role', 'Demo counter', 'Dummy value', 'Demo A', 'Demo B', 'Demo C', 'Demo D', '00+']

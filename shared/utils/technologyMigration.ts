import type { TechnologyContent, TechnologyWorkRef } from './technologySchema'
import type { TechnologyPageContent } from './technologyPublic'

// Legacy Technology → CMS content. Pure and deterministic: the same legacy
// input always yields the same CMS content with the same item ids, so
// re-running the migration never duplicates or reshuffles records.
//
// Source of truth is the CURRENT public /technology as rendered today — the
// normalized legacy shape from buildLegacyTechnologyContent() (useTechnology
// + Hero/Work template constants + pageSeo.technology). Nothing is
// rewritten, summarized or invented.

export const TECHNOLOGY_MIGRATION_VERSION = 'technology-v1'

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 56)

export function legacyToTechnologyContent(
  legacy: TechnologyPageContent,
  workRefs: TechnologyWorkRef[],
  seo: { canonicalUrl: string }
): TechnologyContent {
  const { hero, capabilities, work } = legacy
  return {
    hero: {
      eyebrow: hero.eyebrow,
      headlineLine1: hero.headlineLines[0],
      headlineLine2: hero.headlineLines[1],
      headlineLine3: hero.headlineLines[2],
      lede: hero.lede,
      primaryCtaLabel: hero.primaryCta.label,
      primaryCtaUrl: hero.primaryCta.href,
      secondaryCtaLabel: hero.secondaryCtaLabel
    },
    capabilities: {
      eyebrow: capabilities.eyebrow,
      title: capabilities.title,
      items: capabilities.items.map((s, i) => ({
        id: `cap-${slug(s.title)}`,
        title: s.title,
        body: s.body,
        keywords: [...s.keywords],
        related: s.related.map((r) => ({ label: r.label, url: r.to ?? '' })),
        image: s.image,
        imageAlt: s.imageAlt,
        sortOrder: i + 1,
        active: true
      }))
    },
    work: {
      sectionLabel: work.sectionLabel,
      eyebrow: work.eyebrow,
      title: work.title,
      items: workRefs.map((ref, i) => ({ id: `tw-${slug(ref)}`, ref, sortOrder: i + 1, active: true }))
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
export const TECHNOLOGY_DUMMY_MARKERS = ['[Dummy]', 'Lorem ipsum', 'Dummy primary', 'Dummy secondary', 'Demo A', 'Demo B', 'Demo C', 'Demo link', 'Demo plain label']

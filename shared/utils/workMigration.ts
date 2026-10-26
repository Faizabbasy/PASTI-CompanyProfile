import type { CaseStudyContent } from '#shared/utils/caseStudySchema'
import type { ProjectContent } from '#shared/utils/projectSchema'
import type { WorkContent } from '#shared/utils/workSchema'

// CURRENT public /work content → Work CMS records (deterministic, no new
// copy). Used by scripts/cms-migrate-work.mjs; nothing here is published.
//
// Owner decisions (2026-10-23, Work CMS brief):
// - Featured Case Studies baseline = PowerHours, Textile, HDI. AT-WF is
//   migrated as a case study but NOT featured.
// - Textile (40% / 25%) and AT-WF (30% / 70%) metrics → needs_approval, even
//   though the code records an owner approval from 2026-10-07: approval must
//   now be given in the CMS by an admin.
// - AT-WF screenshots → needs_approval (narrative and UI don't match).
// - The legacy sources (useSelectedWork / useFeaturedCases / useWorkPortfolio)
//   are not modified, so Home and /technology are unaffected.

export const WORK_MIGRATION_VERSION = 'work-v1'
export const WORK_FEATURED_BASELINE = ['powerhours', 'textile', 'hdi'] as const
const NEEDS_APPROVAL_METRICS = new Set(['textile', 'at-wf'])
const NEEDS_APPROVAL_MEDIA = new Set(['at-wf'])

// Minimal shapes of the legacy records (useWorkPortfolio / useFeaturedCases).
export interface LegacyProject { index: string; title: string; category: string; description: string; image: string; group: string; caseId?: string }
export interface LegacyCase {
  id: string
  title: string
  client?: string
  category: string
  year?: string
  projectRef?: string
  businessContext?: string
  challenge?: string[]
  request?: string[]
  solution?: string[]
  outcome?: string[]
  insight?: string
  timeline?: { steps: { label: string; weeks: number }[]; total: string }
  technologyStack?: string[]
  metrics?: { value: string; label: string; source: string; publicationStatus: string }[]
  visuals: { src: string; alt: string; kind: 'poster' | 'screen' | 'dashboard'; source: string; publicationStatus: string }[]
  publicationStatus: string
  approvalNotes?: string[]
  source: string
}
export interface LegacyWorkPage {
  hero: { eyebrow: string; headlineLines: [string, string]; lede: string; primaryCtaLabel: string; secondaryCta: { label: string; href: string } }
  index: { sectionLabel: string }
  cases: { sectionLabel: string; titleLead: string; titleAccent: string; supportingCopy: string }
  seo: { title: string; description: string; image: string }
}

export const workSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')

const note = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' · ').slice(0, 300)

export interface WorkMigration {
  work: WorkContent
  projects: { id: string; legacyAnchor?: string; content: ProjectContent }[]
  cases: { id: string; content: CaseStudyContent }[]
}

export function legacyToWorkMigration(page: LegacyWorkPage, legacyProjects: LegacyProject[], legacyCases: LegacyCase[], opts: { canonicalUrl: string }): WorkMigration {
  const projects: WorkMigration['projects'] = legacyProjects.map((p) => {
    const c = legacyCases.find((x) => x.projectRef === p.title)
    const slug = workSlug(p.title)
    return {
      id: `prj-${slug}`,
      legacyAnchor: p.index,
      content: {
        name: p.title,
        slug,
        clientDisplayName: c?.client ?? '',
        category: p.category,
        filterGroup: p.group,
        // Owner placeholder year (2025) exists only on the case records.
        year: c?.year ?? '',
        shortDescription: p.description,
        poster: p.image,
        // The index renders the project title as the poster alt today.
        posterAlt: p.title
      }
    }
  })

  // Cases without a Selected Work project get a project record that is not
  // selected on the index (identity must live on a Project).
  for (const c of legacyCases) {
    if (c.projectRef && projects.some((p) => p.content.name === c.projectRef)) continue
    const slug = workSlug(c.title)
    const lead = c.visuals[0]
    projects.push({
      id: `prj-${slug}`,
      content: {
        name: c.title,
        slug,
        clientDisplayName: c.client ?? '',
        category: c.category,
        // Same fallback the legacy index uses for an unmapped category.
        filterGroup: 'Other',
        year: c.year ?? '',
        shortDescription: (c.businessContext ?? '').slice(0, 320),
        poster: lead?.src ?? '',
        posterAlt: lead?.alt ?? c.title
      }
    })
  }

  const projectFor = (c: LegacyCase) => projects.find((p) => p.content.name === (c.projectRef ?? c.title))!

  const cases: WorkMigration['cases'] = legacyCases.map((c) => {
    const p = projectFor(c)
    const approach = c.solution?.length ? { mode: 'solution' as const, points: [...c.solution] } : { mode: 'request' as const, points: [...(c.request ?? [])] }
    const approvals = (c.approvalNotes ?? []).join(' ')
    return {
      id: `cs-${c.id}`,
      content: {
        projectId: p.id,
        slug: c.id,
        categoryOverride: c.category === p.content.category ? '' : c.category,
        context: { body: c.businessContext ?? '' },
        challenge: { points: [...(c.challenge ?? [])] },
        approach,
        outcome: { points: [...(c.outcome ?? [])] },
        insight: c.insight ?? '',
        timeline: c.timeline ? { total: c.timeline.total, steps: c.timeline.steps.map((s) => ({ ...s })) } : { total: '', steps: [] },
        technologyLabels: [...(c.technologyStack ?? [])],
        metrics: (c.metrics ?? []).map((m, i) => ({
          id: `m-${c.id}-${i + 1}`,
          value: m.value,
          label: m.label,
          context: '',
          sourceNote: note(m.source, approvals ? 'Code noted owner approval 2026-10-07' : undefined, NEEDS_APPROVAL_METRICS.has(c.id) ? 'Brief 2026-10-23: re-approve in CMS before public use' : undefined),
          claimStatus: NEEDS_APPROVAL_METRICS.has(c.id) || m.publicationStatus !== 'approved' ? ('needs_approval' as const) : ('confirmed' as const),
          active: true,
          sortOrder: i + 1
        })),
        gallery: c.visuals.map((v, i) => ({
          id: `g-${c.id}-${i + 1}`,
          src: v.src,
          alt: v.alt,
          kind: v.kind,
          sourceNote: note(v.source, approvals),
          approvalStatus: NEEDS_APPROVAL_MEDIA.has(c.id) || v.publicationStatus !== 'approved' ? ('needs_approval' as const) : ('confirmed' as const),
          active: true,
          sortOrder: i + 1
        }))
      }
    }
  })

  const featured = WORK_FEATURED_BASELINE.map((id) => cases.find((c) => c.content.slug === id)).filter((c): c is WorkMigration['cases'][number] => !!c)

  const work: WorkContent = {
    hero: {
      eyebrow: page.hero.eyebrow,
      headlineLine1: page.hero.headlineLines[0],
      headlineLine2: page.hero.headlineLines[1],
      lede: page.hero.lede,
      primaryCtaLabel: page.hero.primaryCtaLabel,
      secondaryCtaLabel: page.hero.secondaryCta.label,
      secondaryCtaUrl: page.hero.secondaryCta.href
    },
    projectIndex: {
      sectionLabel: page.index.sectionLabel,
      items: legacyProjects.map((p, i) => ({ id: `wp-${workSlug(p.title)}`, projectId: `prj-${workSlug(p.title)}`, sortOrder: i + 1, active: true }))
    },
    featuredCases: {
      sectionLabel: page.cases.sectionLabel,
      titleLead: page.cases.titleLead,
      titleAccent: page.cases.titleAccent,
      supportingCopy: page.cases.supportingCopy,
      items: featured.map((c, i) => ({ id: `wc-${c.content.slug}`, caseStudyId: c.id, sortOrder: i + 1, active: true }))
    },
    seo: { metaTitle: page.seo.title, metaDescription: page.seo.description, ogImage: page.seo.image, canonicalUrl: opts.canonicalUrl, noIndex: false }
  }

  return { work, projects, cases }
}

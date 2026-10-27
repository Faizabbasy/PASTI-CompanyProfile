export interface WorkProjectEntry {
  index: string
  title: string
  category: string
  description: string
  image: string
  /** Filter group for the /work index. */
  group: string
  /** Public Featured Case Study id, when this project has one. */
  caseId?: string
}

/**
 * /work content (owner redesign, 2026-10-01).
 *
 * - `projects`: the six real projects (images + copy) shared with the homepage
 *   (useSelectedWork), grouped for the index filter.
 * - `caseId`: set when a public Featured Case Study (useFeaturedCases)
 *   references the project, so its card can link into that case. The legacy
 *   brief/result `caseFiles` were removed 2026-10-07 (replaced by Featured
 *   Case Studies).
 *
 * The former "more" entries (IKEA / PowerHours / HDI with Lorem-ipsum brief
 * and result) are removed — those projects already appear in `projects`
 * with real copy.
 */
export function useWorkPortfolio() {
  const { projects: selected } = useSelectedWork()
  const { publicCases } = useFeaturedCases()
  // Filter group per project, keyed by its stable index (not by category
  // text, which is translated on Indonesian pages). Group names are filter
  // keys; ProjectIndex shows them through t().
  const groupOf: Record<string, string> = {
    '01': 'Commerce', // Omnichannel E-Commerce
    '02': 'Enterprise', // Enterprise Platform
    '03': 'Wellness', // Fitness & Wellness App
    '04': 'Wellness', // Employee Wellness Platform
    '05': 'Campaign', // Corporate Campaign
    '06': 'Fintech' // Mobile Banking
  }
  const projects: WorkProjectEntry[] = selected.map((p) => ({
    index: p.index,
    title: p.title,
    category: p.category,
    description: p.description,
    image: p.image,
    group: groupOf[p.index] ?? 'Other',
    caseId: publicCases.find((c) => c.projectRef === p.title)?.id
  }))
  const groups = ['All', ...Array.from(new Set(projects.map((p) => p.group)))]

  return { projects, groups }
}

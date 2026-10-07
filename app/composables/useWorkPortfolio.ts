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
  const groupOf: Record<string, string> = {
    'Omnichannel E-Commerce': 'Commerce',
    'Enterprise Platform': 'Enterprise',
    'Fitness & Wellness App': 'Wellness',
    'Employee Wellness Platform': 'Wellness',
    'Corporate Campaign': 'Campaign',
    'Mobile Banking': 'Fintech'
  }
  const projects: WorkProjectEntry[] = selected.map((p) => ({
    index: p.index,
    title: p.title,
    category: p.category,
    description: p.description,
    image: p.image,
    group: groupOf[p.category] ?? 'Other',
    caseId: publicCases.find((c) => c.projectRef === p.title)?.id
  }))
  const groups = ['All', ...Array.from(new Set(projects.map((p) => p.group)))]

  return { projects, groups }
}

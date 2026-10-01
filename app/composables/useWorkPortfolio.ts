export interface WorkCaseFile {
  index: string
  client: string
  /** Short typographic mark for the file cover (no client imagery exists). */
  mark: string
  date: string
  brief: string
  result: string
}

export interface WorkProjectEntry {
  index: string
  title: string
  category: string
  description: string
  image: string
  /** Filter group for the /work index. */
  group: string
}

/**
 * /work content (owner redesign, 2026-10-01).
 *
 * - `projects`: the six real projects (images + copy) shared with the homepage
 *   (useSelectedWork), grouped for the index filter.
 * - `caseFiles`: the three case studies whose Brief / Result were scraped
 *   verbatim from pastipeople.id/portfolio. They have no matching project
 *   imagery in the repo (the old page borrowed the IKEA / Pertamina-campaign
 *   posters, which showed the wrong projects), so they are presented as
 *   text-led files with a typographic cover instead.
 *
 * The former "more" entries (IKEA / PowerHours / HDI with Lorem-ipsum brief
 * and result) are removed — those projects already appear in `projects`
 * with real copy.
 */
export function useWorkPortfolio() {
  const { projects: selected } = useSelectedWork()
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
    group: groupOf[p.category] ?? 'Other'
  }))
  const groups = ['All', ...Array.from(new Set(projects.map((p) => p.group)))]

  const caseFiles: WorkCaseFile[] = [
    {
      index: '01',
      client: 'Indonesia Exim Bank',
      mark: 'EXIM',
      date: 'July 2022',
      brief: 'Melakukan re-engineering sistem fund request internal dengan aspek: Pembaharuan UI/UX, Update teknologi, penambahan fitur.',
      result: 'System is now in use by the client internally.'
    },
    {
      index: '02',
      client: 'PT. Jasa Marga Persero',
      mark: 'JM',
      date: 'December 2022',
      brief: 'Melakukan re-engineering sistem fund request internal dengan aspek: Pembaharuan UI/UX, Update teknologi, penambahan fitur.',
      result: 'System is now in use by the client internally.'
    },
    {
      index: '03',
      client: 'Universitas Pertamina',
      mark: 'UP',
      date: 'November 2022',
      brief: 'Create customize Customer Relations Management (CRM) System for the university. The system hopefully can help Universitas Pertamina.',
      result: 'The system running until right now if you wanna try. You can chat all social media platform Universitas Pertamina.'
    }
  ]

  return { projects, groups, caseFiles }
}

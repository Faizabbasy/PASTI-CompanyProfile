export interface TechnologyRelated {
  label: string
  /** Internal link (a /work case or project anchor); absent = plain label. */
  to?: string
}

export interface TechnologyService {
  index: string
  title: string
  /** COMPRO 2025 sentence, verbatim. */
  body: string
  /** Terms lifted from that same sentence — no additions. */
  keywords: string[]
  /** Related work, mapped by project type (owner-approved 2026-10-07 as
   * "Related work", not "built with"). Empty when COMPRO has no such case. */
  related: TechnologyRelated[]
  source: string
  /** Visual shown with the row (cursor preview on desktop, inline on mobile).
   * Reuses existing approved project/insight artwork whose subject matches
   * the service — illustrative, not a claim that this project is that service. */
  image: string
}

export interface TechnologyCaseCard {
  kind: 'case' | 'project'
  title: string
  client?: string
  category: string
  image: string
  /** 'poster' fills a 4:5 frame; 'screen' keeps a UI capture on white. */
  imageKind: 'poster' | 'screen'
  /** Approved metrics, only ever shown with their own case. */
  metrics: { value: string; label: string }[]
  to: string
}

/**
 * /technology page content — COMPRO 2025 rebuild (owner decisions 2026-10-07).
 *
 * - Hero intro and the six capability bodies are the COMPRO 2025 sentences
 *   (pp. 30–35) verbatim; COMPRO gives each capability one sentence and no
 *   sub-features, so nothing is added. `keywords` only repeat terms from that
 *   sentence.
 * - `related` maps capabilities to work by project type (owner OK'd the
 *   inference, labelled "Related work"). AI, Cybersecurity and SLA have no
 *   case in COMPRO, so they show none.
 * - `cases` (Technology Case Studies) reuse the public Featured Cases from
 *   /work plus portfolio projects; MCD Indonesia and Micassa are held until
 *   the owner confirms them.
 * - `why` = Vision (p.27), the tech-relevant Standards (p.28) and the
 *   technology milestones (p.26; the 2022 creative-expansion step is left to
 *   the Creative page).
 */
export function useTechnology() {
  const eyebrow = 'Technology'
  const heading = 'Technology built to move business forward.'
  const introBody =
    'Technology is the backbone of modern business. PASTI builds customized systems that are secure, scalable, and aligned with real business needs.'

  const servicesEyebrow = 'What we build'
  const servicesHeading = 'Technology capabilities'

  const services: TechnologyService[] = [
    {
      index: '01',
      title: 'Technology Development',
      body: 'Technology is the backbone of modern business. PASTI builds customized systems that are secure, scalable, and aligned with real business needs.',
      keywords: ['Customized systems', 'Secure', 'Scalable'],
      related: [
        { label: 'IKEA Indonesia', to: '/work#work-01' },
        { label: 'JM-Click — Jasa Marga', to: '/work#work-02' }
      ],
      source: 'COMPRO 2025 p.30',
      image: '/images/selected-work/ikea-indonesia.webp'
    },
    {
      index: '02',
      title: 'Custom Built AI Solutions',
      body: 'We design and deploy AI models tailored to client objectives from predictive analytics, natural language processing, to machine-learning dashboards helping businesses make faster and smarter decisions.',
      keywords: ['Predictive analytics', 'Natural language processing', 'Machine-learning dashboards'],
      related: [],
      source: 'COMPRO 2025 p.31',
      image: '/images/insights/ai-digital-transformation.webp'
    },
    {
      index: '03',
      title: 'Enterprise Platforms',
      body: 'End-to-end (ERP, CRM, LMS, Dashboards) development of enterprise-grade systems for managing resources, customer relations, learning modules, and operational dashboards with real-time reporting.',
      keywords: ['ERP', 'CRM', 'LMS', 'Dashboards', 'Real-time reporting'],
      related: [
        { label: 'Textile Production Monitoring', to: '/work#case-textile' },
        { label: 'Workflow Automation (AT-WF)', to: '/work#case-at-wf' },
        { label: 'Universitas Pertamina — CRM' }
      ],
      source: 'COMPRO 2025 p.32',
      image: '/images/work/cases/textile-dashboard.webp'
    },
    {
      index: '04',
      title: 'Mobile App Development & MVP',
      body: 'Development of iOS and Android applications with Flutter and native stacks. We also specialize in Minimum Viable Product (MVP) design to test and validate business ideas rapidly.',
      keywords: ['iOS', 'Android', 'Flutter', 'Native stacks', 'MVP'],
      related: [
        { label: 'PowerHours', to: '/work#case-powerhours' },
        { label: 'HDI Healthy Lifestyle', to: '/work#case-hdi' }
      ],
      source: 'COMPRO 2025 p.33',
      image: '/images/selected-work/powerhours.webp'
    },
    {
      index: '05',
      title: 'Cybersecurity & Compliance Architecture',
      body: 'Secure-by-design systems with compliance to industry standards, including encryption layers, penetration testing, and data governance models to protect sensitive information.',
      keywords: ['Secure-by-design', 'Encryption layers', 'Penetration testing', 'Data governance'],
      related: [],
      source: 'COMPRO 2025 p.34',
      image: '/images/insights/cybersecurity-compliance.webp'
    },
    {
      index: '06',
      title: 'System Maintenance & SLA Support',
      body: 'Long-term operational support with SLA-based models, ensuring continuity, updates, and reliable performance across all deployed systems.',
      keywords: ['SLA-based models', 'Continuity', 'Updates', 'Reliable performance'],
      related: [],
      source: 'COMPRO 2025 p.35',
      image: '/images/insights/enterprise-technology.webp'
    }
  ]

  // Technology Case Studies: the public Featured Cases (with their own
  // approved metrics) first, then portfolio projects from Selected Work.
  const { publicCases } = useFeaturedCases()
  const caseOrder = ['textile', 'at-wf', 'powerhours', 'hdi']
  const featured: TechnologyCaseCard[] = caseOrder
    .map((id) => publicCases.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .map((c) => {
      const v = approvedVisuals(c)[0]
      return {
        kind: 'case' as const,
        title: c.title,
        client: c.client,
        category: c.category,
        image: v?.src ?? '',
        imageKind: v?.kind === 'poster' ? ('poster' as const) : ('screen' as const),
        metrics: approvedMetrics(c).map((m) => ({ value: m.value, label: m.label })),
        to: `/work#case-${c.id}`
      }
    })
  const { projects } = useSelectedWork()
  const portfolioTitles = ['IKEA Indonesia', 'JM-Click — Jasa Marga', 'OCTO Mobile — CIMB Niaga']
  const portfolio: TechnologyCaseCard[] = projects
    .filter((p) => portfolioTitles.includes(p.title))
    .map((p) => ({ kind: 'project' as const, title: p.title, category: p.category, image: p.image, imageKind: 'poster' as const, metrics: [], to: `/work#work-${p.index}` }))
  const cases = [...featured, ...portfolio]

  const company = useCompany()
  const why = {
    leadLabel: 'Our vision',
    statement: company.vision,
    standards: company.pickStandards('Innovation', 'Security', 'Efficiency'),
    milestones: company.pickMilestones('2020', '2021', '2023', 'Since 2024')
  }

  return { eyebrow, heading, introBody, servicesEyebrow, servicesHeading, services, cases, why }
}

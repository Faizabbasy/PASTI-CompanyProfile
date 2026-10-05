export interface OpenFlowStep {
  index: string
  label: string
  /** Module in Core Solutions this step maps to by name, if any. */
  module?: string
}

export interface OpenModule {
  index: string
  /** Anchor id, also used for "Request Demo" interest prefill. */
  id: string
  title: string
  /** Long-form title (e-Procurement only, from the brief). */
  subtitle?: string
  usp?: string
  body: string
  capabilities: string[]
  primary?: boolean
}

export interface OpenCase {
  client: string
  /** Proof points of this case shown in Business Impact. */
  hasProof?: boolean
}

export interface OpenProof {
  /** Numeric part, counted up on scroll. */
  value: number
  prefix?: string
  suffix: string
  outcome: string
  /** Case context — must always render next to the number. */
  context: string
  /** true while the brief doesn't say what this number measures. */
  pending?: boolean
}

/**
 * /open — OPEN by PASTI (One Procurement Ecosystem Network).
 *
 * Source of truth: docs/open/00-open-landing-page-brief.md; section order and
 * rules: docs/open/01-open-page-structure.md. Everything not in the brief is
 * placeholder (Lorem ipsum) and marked BUTUH DATA — never invented.
 * OPEN is the ecosystem; e-Procurement is one core solution inside it.
 */
export function useOpen() {
  const name = 'OPEN'
  const expansion = 'One Procurement Ecosystem Network'
  const positioning =
    'OPEN connects procurement, sourcing, e-Auction, vendor management, contracts, catalog, workflows, monitoring, and enterprise integrations in one transparent, integrated, and audit-ready procurement ecosystem.'

  // Brief §1 mental model.
  const mentalModel = {
    digitizes: 'e-Procurement digitizes the procurement process.',
    connects: 'OPEN connects the entire procurement ecosystem.'
  }

  // The ecosystem words of the positioning sentence — used by Problem →
  // Solution as the "scattered → connected" pieces.
  const ecosystemParts = ['Procurement', 'Sourcing', 'e-Auction', 'Vendor management', 'Contracts', 'Catalog', 'Workflows', 'Monitoring', 'Integrations']

  // BUTUH DATA: problem statements.
  const problemBody = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

  // Brief §3 — storytelling flow, not a mandatory sequence per client.
  const flow: OpenFlowStep[] = [
    { index: '01', label: 'Plan / Request' },
    { index: '02', label: 'Sourcing' },
    { index: '03', label: 'Vendor', module: 'vendor-management' },
    { index: '04', label: 'e-Auction / Bidding', module: 'e-auction' },
    { index: '05', label: 'Evaluation' },
    { index: '06', label: 'Approval' },
    { index: '07', label: 'Contract', module: 'contract-management' },
    { index: '08', label: 'Catalog / P2P', module: 'catalog-management' },
    { index: '09', label: 'Invoice / Finance' }
  ]
  const flowNote = 'An end-to-end overview. Each implementation can be tailored to the client’s own process.'
  const foundation = ['Integration', 'Governance', 'Auditability']

  // Brief §1 + §4. Modules 02–06: titles from the brief; body and
  // capabilities BUTUH DATA.
  const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.'
  const modules: OpenModule[] = [
    {
      index: '01',
      id: 'e-procurement',
      title: 'e-Procurement',
      subtitle: 'End-to-End Digital Procurement',
      usp: 'One Process. Full Visibility. Better Control.',
      body: lorem,
      capabilities: [
        'Procurement Planning',
        'Sourcing Management',
        'Vendor Management',
        'Digital Approval',
        'Document Management',
        'Procurement Monitoring',
        'Audit Trail',
        'Contract Management'
      ],
      primary: true
    },
    { index: '02', id: 'vendor-management', title: 'Vendor Management', body: lorem, capabilities: ['Lorem ipsum', 'Dolor sit amet', 'Consectetur'] },
    { index: '03', id: 'e-auction', title: 'e-Auction / Bidding', body: lorem, capabilities: ['Lorem ipsum', 'Dolor sit amet', 'Consectetur'] },
    { index: '04', id: 'contract-management', title: 'Contract Management', body: lorem, capabilities: ['Lorem ipsum', 'Dolor sit amet', 'Consectetur'] },
    { index: '05', id: 'catalog-management', title: 'Catalog Management', body: lorem, capabilities: ['Lorem ipsum', 'Dolor sit amet', 'Consectetur'] },
    { index: '06', id: 'collaborative-procurement', title: 'Collaborative Procurement / P2P', body: lorem, capabilities: ['Lorem ipsum', 'Dolor sit amet', 'Consectetur'] }
  ]
  /** e-Procurement capabilities that are also full modules → cross-link. */
  const capabilityModule: Record<string, string> = {
    'Vendor Management': 'vendor-management',
    'Contract Management': 'contract-management'
  }

  // BUTUH DATA: e-Auction flow copy and real UI.
  const auctionBody = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

  // BUTUH DATA: integrated systems, architecture, deployment model.
  const integrationBody = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore.'

  // Brief terms only; security standards BUTUH DATA (no ISO/SOC claims).
  const governancePillars = ['Governance', 'Auditability', 'Audit Trail', 'Digital Approval']
  const governanceBody = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

  // Brief §5. Context / scope / year per case BUTUH DATA.
  const cases: OpenCase[] = [
    { client: 'Bank Syariah Indonesia' },
    { client: 'Bank Mandiri', hasProof: true },
    { client: 'Pelindo' },
    { client: 'Lintasarta', hasProof: true },
    { client: 'Indonesia Eximbank / LPEI' }
  ]

  // Brief §6 — CASE-SPECIFIC claims. Never render without `context`.
  const proofs: OpenProof[] = [
    {
      value: 40,
      prefix: 'Up to ',
      suffix: '%',
      // BUTUH KONFIRMASI: the brief doesn't say what improved by 40%.
      outcome: 'Lorem ipsum dolor sit amet',
      context: 'e-Auction / e-Procurement integration example',
      pending: true
    },
    { value: 67, suffix: '%', outcome: 'Reduction in procurement approval lead time', context: 'Bank Mandiri case' },
    { value: 35, suffix: '%', outcome: 'Improvement in process visibility', context: 'Bank Mandiri case' },
    { value: 100, suffix: '% digital', outcome: 'Approval & contract', context: 'Lintasarta case' }
  ]

  // BUTUH DATA: Why PASTI Technology copy.
  const whyBody = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.'

  return {
    name,
    expansion,
    positioning,
    mentalModel,
    ecosystemParts,
    problemBody,
    flow,
    flowNote,
    foundation,
    modules,
    capabilityModule,
    auctionBody,
    integrationBody,
    governancePillars,
    governanceBody,
    cases,
    proofs,
    whyBody
  }
}

/**
 * Shared "Request Demo" plumbing: any CTA on the page can pre-select a
 * module of interest, then scroll to the form.
 */
export function useOpenDemo() {
  const interest = useState<string[]>('open-demo-interest', () => [])

  const scrollTo = (id: string) => {
    if (!import.meta.client) return
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenisInstance()
    if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.4 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  const requestDemo = (moduleId?: string) => {
    if (moduleId && !interest.value.includes(moduleId)) interest.value = [...interest.value, moduleId]
    scrollTo('demo')
  }

  return { interest, requestDemo, scrollTo }
}

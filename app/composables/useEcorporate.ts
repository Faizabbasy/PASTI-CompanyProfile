/**
 * /e-corporate — e-CORPORATE, Enterprise Digital Platform.
 *
 * Source of truth: docs/e-corporate/00-e-corporate-landing-page-brief.md.
 * CONFIRMED copy is used verbatim. Everything flagged `temporary: true` is
 * placeholder content the brief allows: generic, derived from the confirmed
 * positioning, and NOT a verified product fact (no modules, clients,
 * metrics, certifications or confirmed integrations are claimed).
 */

export interface EcorpItem {
  id: string
  title: string
  body: string
  /** Placeholder content derived from the confirmed positioning. */
  temporary?: boolean
}

export interface EcorpValue {
  title: string
  /** Verbatim phrase from the confirmed positioning / goals it rests on. */
  source: string
  /** The confirmed sentence that phrase sits in. */
  sentence: string
}

export interface EcorpUseCase extends EcorpItem {
  steps: string[]
}

export function useEcorporate() {
  // ---- SEO (editable content) -------------------------------------------
  const seo = {
    title: 'e-CORPORATE — Enterprise Digital Platform | PASTI',
    description: 'Enterprise digital platform connecting people, processes, and information in one integrated environment.'
  }

  // ---- CONFIRMED positioning (brief §1) ---------------------------------
  const name = 'e-CORPORATE'
  const category = 'Enterprise Digital Platform'
  const short =
    'e-CORPORATE is an enterprise digital platform that connects people, processes, and information in one integrated environment — helping organizations work smarter, collaborate better, and operate with greater control.'
  const positioning = [
    'e-CORPORATE is an enterprise digital platform designed to connect business processes, people, and information within one integrated environment.',
    'Built to support organizations in managing their operations more efficiently, e-CORPORATE provides a structured digital foundation that can be tailored to specific business requirements, organizational workflows, and operational needs.',
    'By bringing key processes into a connected digital environment, e-CORPORATE helps organizations improve collaboration, strengthen governance, increase operational visibility, and make better-informed decisions.'
  ]
  const goalScalable = 'provide a flexible and scalable digital foundation'

  // Hero headline — brief's own wording, set as three lines.
  const heroLines = ['people', 'processes', 'information']

  // ---- Problem → Solution (temporary framing, brief §4) ------------------
  // Each problem is paired with the confirmed goal it is answered by.
  const problems: Array<{ problem: string; answer: string; temporary: true }> = [
    { problem: 'Disconnected internal processes', answer: 'Processes connected in one environment', temporary: true },
    { problem: 'Manual workflows', answer: 'Structured digital workflows', temporary: true },
    { problem: 'Siloed information', answer: 'Information in one place', temporary: true },
    { problem: 'Limited operational visibility', answer: 'Operational visibility as work moves', temporary: true },
    { problem: 'Difficult cross-team collaboration', answer: 'Shared space for every role', temporary: true },
    { problem: 'Rigid legacy processes', answer: 'A foundation tailored to the organization', temporary: true }
  ]
  const solutionHeadline = 'One connected enterprise environment'

  // ---- Platform overview (brief §4: core relationship) -------------------
  const overviewLead = 'A digital operating foundation — not a single workflow tool.' // temporary: true (framing from brief)
  const nodes: EcorpItem[] = [
    { id: 'people', title: 'People', body: 'Every role works in the same environment, with responsibilities that stay clear to everyone involved.', temporary: true },
    { id: 'processes', title: 'Processes', body: 'Business processes run as structured digital flows instead of scattered manual steps.', temporary: true },
    { id: 'information', title: 'Information', body: 'Documents and data sit in one place, available to the people who need them.', temporary: true },
    { id: 'workflow', title: 'Workflow', body: 'Requests, reviews and approvals move through defined steps shaped around how the organization works.', temporary: true },
    { id: 'monitoring', title: 'Monitoring', body: 'Status and progress stay visible while work moves, rather than being reconstructed afterwards.', temporary: true },
    { id: 'integration', title: 'Integration', body: 'The environment is planned to sit alongside the systems an organization already runs.', temporary: true }
  ]

  // ---- Key values: CONFIRMED list, described with confirmed phrases ------
  const values: EcorpValue[] = [
    { title: 'Connected', source: 'connect business processes, people, and information', sentence: positioning[0]! },
    { title: 'Integrated', source: 'within one integrated environment', sentence: positioning[0]! },
    { title: 'Flexible', source: 'tailored to specific business requirements, organizational workflows, and operational needs', sentence: positioning[1]! },
    { title: 'Efficient', source: 'managing their operations more efficiently', sentence: positioning[1]! },
    { title: 'Governed', source: 'strengthen governance', sentence: positioning[2]! },
    { title: 'Scalable', source: 'flexible and scalable digital foundation', sentence: `e-CORPORATE aims to ${goalScalable}.` }
  ]

  // ---- Capability areas: TEMPORARY, not confirmed fixed modules ----------
  const capabilityNote = 'Indicative capability areas. Final scope is shaped around each organization.'
  const capabilities: EcorpItem[] = [
    { id: 'workflow', title: 'Internal Workflow Management', body: 'Define how internal work moves from one step and one role to the next.', temporary: true },
    { id: 'approval', title: 'Approval & Request Process', body: 'Submit, review and approve requests through a clear, traceable path.', temporary: true },
    { id: 'document', title: 'Document & Information Management', body: 'Keep documents and records together, next to the processes they belong to.', temporary: true },
    { id: 'dashboard', title: 'Operational Dashboard', body: 'A shared view of operational status for the people responsible for it.', temporary: true },
    { id: 'roles', title: 'Role-Based Collaboration', body: 'Work together across departments, with access and responsibility by role.', temporary: true },
    { id: 'monitoring', title: 'Business Monitoring', body: 'Follow how processes perform and where attention is needed.', temporary: true },
    { id: 'tasks', title: 'Notifications & Task Tracking', body: 'Keep people informed of what is waiting for them and what has moved on.', temporary: true },
    { id: 'integration', title: 'Enterprise Integration', body: 'Connect the environment with existing enterprise systems where required.', temporary: true }
  ]

  // ---- Use cases: TEMPORARY example scenarios, not client implementations
  const useCaseNote = 'Example scenarios — illustrative, not existing client implementations.'
  const useCases: EcorpUseCase[] = [
    { id: 'request', title: 'Internal Request & Approval', body: 'A request travels from submission to decision with every hand-off on record.', steps: ['Submit', 'Review', 'Approve', 'Notify'], temporary: true },
    { id: 'dashboard', title: 'Management Dashboard', body: 'Management sees the state of operations in one consolidated view.', steps: ['Collect', 'Consolidate', 'View'], temporary: true },
    { id: 'document', title: 'Document Workflow', body: 'Documents follow a defined review path instead of circulating by email.', steps: ['Draft', 'Review', 'Approve', 'Archive'], temporary: true },
    { id: 'collaboration', title: 'Department Collaboration', body: 'Teams coordinate shared work with clear ownership at each step.', steps: ['Assign', 'Coordinate', 'Hand over'], temporary: true },
    { id: 'monitoring', title: 'Operational Monitoring', body: 'Ongoing operations are followed as they run, so issues surface early.', steps: ['Track', 'Flag', 'Follow up'], temporary: true },
    { id: 'digitization', title: 'Business Process Digitization', body: 'A paper or spreadsheet process becomes a structured digital flow.', steps: ['Map', 'Configure', 'Run'], temporary: true }
  ]

  // ---- Configurable by organization -------------------------------------
  // temporary: true — marketing headline allowed by the brief.
  const configHeadline = { before: 'Adapt the platform to your organization — ', mark: 'not the other way around' }
  const configChain = ['Organization', 'Roles', 'Workflow', 'Approval', 'Process', 'Information', 'Dashboard']
  // CONFIRMED adaptation dimensions (brief: tailored to requirements, workflows, needs).
  const configAdapts = ['Organizational structure', 'User roles', 'Workflows', 'Approvals', 'Business requirements', 'Operational needs']

  // ---- Integration: EXAMPLE targets, not confirmed supported integrations
  const integrationNote = 'Example integration targets — not a list of confirmed supported integrations.'
  const integrationTargets = ['ERP', 'HR', 'Finance', 'Internal Database', 'Third-Party Applications']
  const integrationBody = 'e-CORPORATE is positioned as the connected layer of the enterprise. Integration is defined per organization, around the systems already in place.' // temporary: true

  // ---- Governance themes (brief-approved safe themes) -------------------
  const governanceThemes = [
    'Structured workflows',
    'Role-based responsibility',
    'Process visibility',
    'Approval visibility',
    'Centralized information',
    'Operational monitoring',
    'Accountability'
  ]
  // Illustrative approval trail for the governance visual (generic roles).
  const trail = [
    { step: 'Request submitted', role: 'Requester' },
    { step: 'Reviewed', role: 'Department head' },
    { step: 'Approved', role: 'Approver' },
    { step: 'Recorded', role: 'Information owner' }
  ]

  // ---- Business outcomes (non-numeric, brief list) ----------------------
  const outcomes = [
    'Better collaboration',
    'Reduced manual work',
    'Improved visibility',
    'Stronger governance',
    'More consistent processes',
    'Better-informed decisions'
  ]

  // ---- Why PASTI (restrained, brief list; descriptions temporary) -------
  const why: EcorpItem[] = [
    { id: 'custom', title: 'Custom enterprise solution experience', body: 'We build enterprise solutions around each organization rather than forcing a fixed template.', temporary: true },
    { id: 'business', title: 'Business-first approach', body: 'Work starts from the business process and its people, then the technology follows.', temporary: true },
    { id: 'integration', title: 'Integration mindset', body: 'New systems are planned to work with what an organization already runs.', temporary: true },
    { id: 'flexible', title: 'Flexible implementation', body: 'Scope and rollout adapt to organizational structure and operational needs.', temporary: true },
    { id: 'delivery', title: 'End-to-end delivery and support', body: 'From discovery and build to launch and ongoing support.', temporary: true }
  ]

  // ---- Request demo (CONFIRMED copy) ------------------------------------
  const demo = {
    headline: { before: 'Ready to connect your ', mark: 'enterprise operations', after: '?' },
    body: 'Let’s discuss how e-CORPORATE can be adapted to your organization, workflows, and operational needs.'
  }

  return {
    seo,
    name,
    category,
    short,
    positioning,
    heroLines,
    problems,
    solutionHeadline,
    overviewLead,
    nodes,
    values,
    capabilityNote,
    capabilities,
    useCaseNote,
    useCases,
    configHeadline,
    configChain,
    configAdapts,
    integrationNote,
    integrationTargets,
    integrationBody,
    governanceThemes,
    trail,
    outcomes,
    why,
    demo
  }
}

/** In-page scroll helper shared by e-CORPORATE CTAs (Lenis-aware). */
export function useEcorpScroll() {
  return (id: string) => {
    if (!import.meta.client) return
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenisInstance()
    if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.4 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }
}

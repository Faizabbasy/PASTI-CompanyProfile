/**
 * /fast — FAST, Flexible Advanced Scheduling Technology (FCP by PASTI
 * Technology). Brief + audit: docs/fast/00-fast-landing-page-brief.md.
 *
 * Source: FAST_FCP_Product_Book.docx (owner, 2026-10-19). Positioning comes
 * from its Product Blueprint; capabilities only where the FSD part shows
 * them implemented. Copy is an English rendering of the Indonesian source —
 * no AI / autonomous / real-time / optimisation claims, no ERP vendor
 * names, no client data, no numbers.
 *
 * Unverified capabilities stay here with an explicit status and are
 * filtered out of every rendered list (owner decision 2026-10-19).
 * All Gantt data below is neutral sample data, not taken from the source.
 */
export type CapabilityStatus = 'implemented' | 'specification_only' | 'implementation_status_to_verify' | 'needs_confirmation'

export interface FastCapability {
  name: string
  area: 'scheduling' | 'constraint' | 'readiness' | 'simulation' | 'execution' | 'visibility' | 'enterprise'
  status: CapabilityStatus
}

export interface FastConstraint {
  name: string
  body: string
  status: CapabilityStatus
}

export type GanttStep = 0 | 1 | 2 | 3
export interface GanttOp {
  id: string
  order: string
  label: string
  res: string
  fwd: [number, number]
  bwd: [number, number]
  /** Placement after the planner resolves the conflict (step 3). */
  fix?: { res: string; fwd: [number, number]; bwd: [number, number] }
  /** Breaks an active constraint once validated (step 2). */
  conflict?: string
  locked?: boolean
}

export function useFast() {
  const seo = {
    title: 'FAST — Production Planning & Scheduling | PASTI',
    description:
      'FAST is a configurable production planning and scheduling framework that helps manufacturers build feasible schedules around materials, resources, capacity, workforce, and operational constraints.'
  }

  // Internal register. Only `implemented` items are ever rendered.
  const capabilities: FastCapability[] = [
    { name: 'Scheduling Board / interactive Gantt', area: 'scheduling', status: 'implemented' },
    { name: 'Rescheduling drafts', area: 'scheduling', status: 'implemented' },
    { name: 'Constraint validation (hard / soft)', area: 'constraint', status: 'implemented' },
    { name: 'Material readiness', area: 'readiness', status: 'implemented' },
    { name: 'Process-time parameters', area: 'readiness', status: 'implemented' },
    { name: 'Skill matrix & suggested operator', area: 'readiness', status: 'implemented' },
    { name: 'Scenario simulation & comparison', area: 'simulation', status: 'implemented' },
    { name: 'Progress tracking (plan vs actual)', area: 'execution', status: 'implemented' },
    { name: 'Exception Center', area: 'execution', status: 'implemented' },
    { name: 'Capacity & bottleneck dashboard', area: 'visibility', status: 'implemented' },
    { name: 'KPI dashboard & reports', area: 'visibility', status: 'implemented' },
    { name: 'Multi-company / multi-plant', area: 'enterprise', status: 'implemented' },
    { name: 'Overlapping production', area: 'scheduling', status: 'implementation_status_to_verify' },
    { name: 'Actual production confirmation', area: 'execution', status: 'implementation_status_to_verify' },
    { name: 'On-time delivery / schedule adherence / order tracking dashboards', area: 'visibility', status: 'specification_only' },
    { name: 'Overlap parameters, workforce source of truth, calendar precedence, override rights', area: 'enterprise', status: 'needs_confirmation' }
  ]

  const subnav = [
    { id: 'overview', label: 'Overview' },
    { id: 'scheduling', label: 'Scheduling' },
    { id: 'constraints', label: 'Constraints' },
    { id: 'simulation', label: 'Simulation' },
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'integration', label: 'Integration' }
  ]

  // ---- 01 Hero ---------------------------------------------------------
  const hero = {
    eyebrow: 'Framework Code Product',
    name: 'FAST',
    full: 'Flexible Advanced Scheduling Technology',
    tagline: 'Your Production. Your Rules.',
    body: 'FAST is a configurable production planning and scheduling framework that helps manufacturers build feasible schedules around their production rules, resources, materials, capacity, workforce and operational constraints.',
    facts: ['Production planning', 'Finite-capacity scheduling', 'Built around your rules']
  }

  // ---- 02 Why it gets complex (F-06 inputs, §5.2) -------------------------
  const complexity = {
    eyebrow: 'The challenge',
    headline: 'Why production scheduling gets complex.',
    lede: 'A schedule only works when it satisfies many conditions at the same time — and those conditions move every day.',
    factors: [
      { name: 'Production orders', body: 'What has to be made, how much, and by when.' },
      { name: 'Routing', body: 'The sequence of operations each order follows.' },
      { name: 'Material readiness', body: 'Inputs and components available before an operation starts.' },
      { name: 'Resource capacity', body: 'What each machine or work center can carry.' },
      { name: 'Factory calendar', body: 'Working days, holidays and calendar exceptions.' },
      { name: 'Shifts', body: 'The working-time windows of every line.' },
      { name: 'Manpower', body: 'Operators available on each shift.' },
      { name: 'Skills', body: 'Who is qualified to run which resource.' },
      { name: 'Setup & changeover', body: 'Time spent switching from one product to the next.' },
      { name: 'Maintenance & downtime', body: 'Planned and unplanned unavailability.' },
      { name: 'Priorities', body: 'Rush orders and orders that cannot slip.' },
      { name: 'Due dates', body: 'Delivery commitments behind every order.' },
      { name: 'Operation dependencies', body: 'What must finish before the next step can start.' }
    ]
  }

  // ---- 03 FCP + built around your rules ---------------------------------
  const framework = {
    eyebrow: 'Framework Code Product',
    headline: 'Ready scheduling foundation. Configured around your production.',
    body: 'FAST is not generic SaaS, and not a fixed module package that forces your process to follow the product. It keeps a reusable product core, while rules, parameters, data boundaries, integrations and operational behaviour are adapted to each organisation.',
    not: ['Not generic SaaS', 'Not an ERP or MES replacement', 'Not blank-page custom development', 'Not a black box — planners stay in control'],
    core: ['Scheduling Board', 'Constraint validation', 'Material readiness', 'Scenario simulation', 'Plan vs actual & exceptions', 'Multi-company governance'],
    adapt: ['Business rules', 'Scheduling constraints', 'Company & plant configuration', 'Production methods', 'Routing logic', 'Material logic', 'Resource capacity', 'Manpower & skills', 'Calendars & shifts', 'Reports', 'Integrations', 'UI / UX', 'Data boundary'],
    steps: [
      { name: 'Understand', body: 'Your process, pain points, SOPs, data, constraints and KPIs.' },
      { name: 'Design', body: 'Blueprint, workflow, roles, data boundary, UI/UX and acceptance criteria.' },
      { name: 'Customize', body: 'Rules, configuration, parameters and the user experience.' },
      { name: 'Develop', body: 'The extensions you need, while the product core stays intact.' },
      { name: 'Integrate', body: 'FAST connected to your ERP, staging database or other systems in scope.' },
      { name: 'Deploy', body: 'Testing, deployment, handover and continuous improvement.' }
    ]
  }

  // ---- 04 How FAST works (blueprint flow) --------------------------------
  const flow = {
    eyebrow: 'How FAST works',
    headline: 'From source data to a plan you can run.',
    lede: 'Your systems stay the source of truth. FAST plans on top of them and feeds the result back into the next decision.',
    steps: [
      { name: 'Source system / ERP', body: 'Orders and master data stay where they belong.' },
      { name: 'Integration & staging', body: 'Planning data enters through an agreed boundary.' },
      { name: 'Planning data', body: 'Orders, routings, materials, resources, calendars and skills, prepared for planning.' },
      { name: 'Schedule & validate', body: 'Operations placed and checked against every active constraint.' },
      { name: 'Scenario review', body: 'Alternatives compared without touching the active plan.' },
      { name: 'Publish', body: 'The approved plan becomes the active schedule.' },
      { name: 'Progress sync', body: 'Execution progress is synced back from the floor.' },
      { name: 'Plan vs actual', body: 'Deviations and exceptions surface with their severity.' },
      { name: 'Reschedule', body: 'Adjustments are drafted, reviewed and published again.' }
    ]
  }

  // ---- 05 Scheduling Board ------------------------------------------------
  const board = {
    eyebrow: 'Scheduling Board',
    headline: 'One board for the whole production plan.',
    lede: 'Resources on one axis, time on the other. Place operations automatically or by hand — every move is checked against the rules you have switched on.',
    steps: [
      { name: 'Queue', body: 'Unscheduled orders wait with their due date, priority and readiness.' },
      { name: 'Schedule', body: 'A scheduling run places every eligible operation, forward or backward.' },
      { name: 'Validate', body: 'Active constraints are checked. Conflicts and blocking reasons are flagged before anything is confirmed.' },
      { name: 'Adjust', body: 'The planner moves the conflicting operation by hand and saves the result as a draft.' }
    ],
    features: [
      'Resource / work center timeline',
      'Unscheduled queue with due date and priority',
      'Automated scheduling run',
      'Manual drag & drop adjustment',
      'Forward and backward scheduling',
      'Hour, day and week views',
      'Validation before confirming',
      'Conflict and blocking-reason visibility',
      'Material readiness context',
      'Locked operations stay in place'
    ]
  }

  // Neutral sample plan (hours from 06:00). Three orders flow through
  // preparation → processing → packing; one waits on material.
  const gantt = {
    start: 6,
    resources: [
      { id: 'r1', name: 'Line A', short: 'Line A' },
      { id: 'r2', name: 'Line B', short: 'Line B' },
      { id: 'r3', name: 'Work Center 03', short: 'WC 03' },
      { id: 'r4', name: 'Work Center 04', short: 'WC 04' },
      { id: 'r5', name: 'Packing', short: 'Packing' }
    ],
    downtime: [{ res: 'r3', from: 10, to: 13, label: 'Planned maintenance' }],
    orders: [
      { id: 'PRD-1042', due: 20, priority: 'High', readiness: 'Fully available' },
      { id: 'PRD-1043', due: 22, priority: 'Normal', readiness: 'Fully available' },
      { id: 'PRD-1047', due: 16, priority: 'Rush', readiness: 'Partially available' },
      { id: 'PRD-1051', due: 24, priority: 'Normal', readiness: 'Material shortage' }
    ],
    ops: [
      { id: 'a1', order: 'PRD-1042', label: 'Op 10', res: 'r1', fwd: [0, 4], bwd: [10, 14], locked: true },
      { id: 'a2', order: 'PRD-1042', label: 'Op 20', res: 'r3', fwd: [4, 8], bwd: [14, 18] },
      { id: 'a3', order: 'PRD-1042', label: 'Op 30', res: 'r5', fwd: [8, 10], bwd: [18, 20] },
      { id: 'b1', order: 'PRD-1043', label: 'Op 10', res: 'r2', fwd: [0, 5], bwd: [10, 15] },
      { id: 'b2', order: 'PRD-1043', label: 'Op 20', res: 'r4', fwd: [5, 10], bwd: [15, 20] },
      { id: 'b3', order: 'PRD-1043', label: 'Op 30', res: 'r5', fwd: [10, 12], bwd: [20, 22] },
      { id: 'c1', order: 'PRD-1047', label: 'Op 10', res: 'r1', fwd: [4, 7], bwd: [7, 10] },
      { id: 'c2', order: 'PRD-1047', label: 'Op 20', res: 'r3', fwd: [7, 11], bwd: [10, 14], conflict: 'Overlaps planned maintenance on Work Center 03', fix: { res: 'r4', fwd: [10, 14], bwd: [10, 14] } },
      { id: 'c3', order: 'PRD-1047', label: 'Op 30', res: 'r5', fwd: [12, 14], bwd: [14, 16], fix: { res: 'r5', fwd: [14, 16], bwd: [14, 16] } }
    ] as GanttOp[],
    blocked: [{ order: 'PRD-1051', label: 'Op 10', reason: 'Material shortage — kept off the board until inputs are ready' }]
  }

  // ---- 06 Constraints (F-08 catalogue) ----------------------------------
  const constraintCatalog: FastConstraint[] = [
    { name: 'Planning horizon', body: 'Only schedule inside the planning window.', status: 'implemented' },
    { name: 'Due date', body: 'Keep operations aligned with delivery commitments.', status: 'implemented' },
    { name: 'Earliest start', body: 'Nothing starts before it is allowed to.', status: 'implemented' },
    { name: 'Operation sequence', body: 'Follow routing order and dependencies.', status: 'implemented' },
    { name: 'Material readiness', body: 'Hold operations until inputs are ready.', status: 'implemented' },
    { name: 'Resource availability', body: 'Respect downtime and unavailability.', status: 'implemented' },
    { name: 'Prevent overlapping operations', body: 'One operation per resource at a time.', status: 'implemented' },
    { name: 'Priority order', body: 'Place urgent orders first.', status: 'implemented' },
    { name: 'Factory calendar', body: 'Use working days only.', status: 'implemented' },
    { name: 'Work shift', body: 'Stay inside shift windows.', status: 'implemented' },
    { name: 'Skill matrix', body: 'Match operations to qualified operators.', status: 'implemented' },
    { name: 'Manpower availability', body: 'Account for operators on shift and absences.', status: 'implemented' },
    { name: 'Partial schedule results', body: 'Keep what fits; queue the rest with a reason.', status: 'implemented' },
    // Listed in the source catalogue as COMING SOON — not rendered.
    { name: 'Resource eligibility', body: '', status: 'specification_only' },
    { name: 'Resource capacity', body: '', status: 'specification_only' },
    { name: 'Respect pinned / firm schedule', body: '', status: 'specification_only' },
    { name: 'Setup time', body: '', status: 'specification_only' },
    { name: 'Changeover sequence', body: '', status: 'specification_only' }
  ]
  const constraints = {
    eyebrow: 'Constraint-aware scheduling',
    headline: 'Every placement is checked against your rules.',
    lede: 'Each constraint can be switched on or off globally, per plant or work center, or inside a single scenario — so the rules match how your operation really runs.',
    modes: [
      { name: 'Hard', state: 'Active', body: 'The scheduler must respect it. No placement may break it.' },
      { name: 'Soft', state: 'Inactive', body: 'Ignored during placement — but any potential breach is still logged as a warning in the Exception Center.' }
    ],
    scopes: ['Global', 'Plant / work center', 'Scenario'],
    catalog: constraintCatalog.filter((c) => c.status === 'implemented'),
    advanced: {
      title: 'Advanced production logic',
      body: 'Beyond simple slots, FAST reasons about how work actually moves through your plant.',
      items: [
        { name: 'Routing dependency', body: 'Predecessor and successor operations keep their order across resources.' },
        { name: 'Process-time parameters', body: 'Setup and changeover times feed into each operation’s duration.' },
        { name: 'Locked operations', body: 'Operations you lock are kept in place when the schedule is rerun.' },
        { name: 'Partial results with reasons', body: 'What cannot be placed stays queued with a traceable blocking reason.' }
      ]
    }
  }

  // ---- 07 Production readiness ------------------------------------------
  const readiness = {
    eyebrow: 'Production readiness',
    headline: 'Ready to run — or not yet, and why.',
    lede: 'Before an operation takes a slot, FAST checks whether the material, the capacity and the people are actually there.',
    states: [
      { name: 'Fully available', tone: 'ok' },
      { name: 'Partially available', tone: 'partial' },
      { name: 'Expected on time', tone: 'expected' },
      { name: 'Material shortage', tone: 'short' }
    ],
    pillars: [
      { name: 'Material', body: 'Readiness is evaluated from the inputs you already manage.', items: ['Bill of materials', 'Inventory', 'Purchase orders & ETA', 'Work in progress', 'Ongoing production orders', 'Scheduled production orders'] },
      { name: 'Capacity', body: 'Capacity comes from your resources, calendars and shifts.', items: ['Resources & work centers', 'Available capacity', 'Utilization', 'Bottlenecks', 'Calendars & shifts', 'Downtime & unavailability'] },
      { name: 'Workforce', body: 'Operators and their skills are part of the plan, not an afterthought.', items: ['Operators', 'Skill matrix — standard vs actual level', 'Shifts', 'Availability', 'Absences', 'Suggested operator per order'] }
    ]
  }

  // ---- 08 Scenarios & rescheduling ---------------------------------------
  const scenarios = {
    eyebrow: 'Scenario simulation & rescheduling',
    headline: 'Test the decision before changing the live plan.',
    lede: 'Simulations and drafts run beside the active schedule. Nothing reaches production until it is explicitly published.',
    list: [
      { name: 'Active production', status: 'Active', body: 'The schedule the floor is running.' },
      { name: 'Draft', status: 'Draft', body: 'A rescheduled board saved for review.' },
      { name: 'Simulation A', status: 'Simulation', body: 'Alternative plan with different priorities.' },
      { name: 'What-if', status: 'Simulation', body: 'A single change, tested in isolation.' }
    ],
    objectives: ['Maximize on-time delivery', 'Minimize setup & changeover', 'Minimize work in progress', 'Simulate machine downtime', 'Insert a priority order', 'Add an overtime shift'],
    kpis: ['On-time orders', 'Utilization', 'Late orders', 'Changeover time']
  }

  // ---- 09 Plan vs actual + exceptions -------------------------------------
  const execution = {
    eyebrow: 'Plan vs actual · Exception Center',
    headline: 'See the issue. Understand the cause. Decide what to do next.',
    lede: 'Progress is synced back and compared with the plan at operation level. When something drifts, it lands in one place — with its severity and a suggested next step.',
    fields: ['Planned start / finish', 'Actual start / finish', 'Planned quantity', 'Confirmed quantity', 'Remaining quantity', 'Execution status', 'Health', 'Last update'],
    health: ['Late', 'At risk', 'No update', 'On schedule', 'Ahead', 'Unplanned'],
    execStatus: ['Not started', 'Running', 'Stopped', 'Done'],
    categories: ['Material shortage', 'Capacity conflict', 'Machine breakdown', 'Skill mismatch', 'Setup / sequence issue', 'Delivery date risk', 'Resource conflict', 'Rush order', 'Dependency issue'],
    severity: [
      { name: 'Critical', body: 'Commitments at risk or a line cannot run.' },
      { name: 'High', body: 'Likely delay or significant disruption.' },
      { name: 'Medium', body: 'Buffer being consumed, efficiency dropping.' },
      { name: 'Low', body: 'Minor deviation within tolerance.' },
      { name: 'Info', body: 'Audit trail — overrides, toggles, data syncs.' }
    ],
    // Illustrative feed (neutral sample data).
    feed: [
      { sev: 'Critical', type: 'Delivery date risk', ref: 'PRD-1047', note: 'Projected finish passes the committed date.' },
      { sev: 'High', type: 'Capacity conflict', ref: 'WC 03', note: 'Operation overlaps planned maintenance.' },
      { sev: 'Medium', type: 'Skill mismatch', ref: 'Line B · Shift 2', note: 'Not enough qualified operators.' },
      { sev: 'Low', type: 'Setup / sequence issue', ref: 'Line A', note: 'Changeover longer than standard.' },
      { sev: 'Info', type: 'Manual override', ref: 'PRD-1043', note: 'Operation moved on the board.' }
    ]
  }

  // ---- 10 Management visibility (implemented views only) -----------------
  const visibility = {
    eyebrow: 'Management visibility',
    headline: 'The view each role needs — from the same plan.',
    lede: 'Planners, managers and viewers read the same schedule at the level of detail they need.',
    views: [
      { id: 'executive', name: 'Executive dashboard', body: 'Planning coverage, average utilization, open and unscheduled orders and critical exceptions at a glance.' },
      { id: 'capacity', name: 'Capacity & bottlenecks', body: 'Utilization per resource over time, with the most loaded resources flagged as bottleneck candidates.' },
      { id: 'scenario', name: 'Scenario comparison', body: 'Key indicators of the active plan and its alternatives, side by side.' },
      { id: 'reports', name: 'Reports & export', body: 'Production performance, capacity utilization and exception reports — filtered by scenario, plant and period, exportable to CSV.' }
    ]
  }

  // ---- 11 Integration & enterprise ----------------------------------------
  const integration = {
    eyebrow: 'Integration & enterprise operations',
    headline: 'Works with your systems, not instead of them.',
    body: 'FAST does not replace your ERP or transactional systems. Source systems remain the source of truth; FAST consumes planning data through an agreed integration and staging boundary.',
    note: 'Integration method, refresh frequency, reconciliation and data ownership are agreed for each implementation.',
    chain: [
      { name: 'ERP / source systems', body: 'Orders, materials, routings, inventory' },
      { name: 'Integration & staging', body: 'Agreed boundary and mapping' },
      { name: 'FAST', body: 'Planning, scheduling, monitoring' }
    ],
    enterprise: [
      { name: 'Multi-company', body: 'Separate data and configuration per company.' },
      { name: 'Multi-plant', body: 'Plants under each company, with their own rules.' },
      { name: 'Roles & permissions', body: 'Planner, manager, viewer and administrator access.' },
      { name: 'Scoped data', body: 'Every user sees only their company and plant scope.' },
      { name: 'Audit log', body: 'Changes to organisation and access are recorded.' },
      { name: 'Data freshness', body: 'Source and last synchronization shown where available.' }
    ]
  }

  // ---- 12 Why FAST + demo --------------------------------------------------
  const why = ['Finite-capacity scheduling', 'Constraint-aware planning', 'Material-aware scheduling', 'Capacity visibility', 'Workforce & skill context', 'Scenario simulation', 'Rescheduling drafts', 'Plan vs actual', 'Exception visibility', 'Multi-company / multi-plant', 'Integration-ready', 'Configurable product core']

  const demo = {
    eyebrow: 'Request a demo',
    headline: 'Build a production plan your operation can actually execute.',
    body: 'Tell us how you plan today and what keeps breaking the schedule. We will walk you through FAST using a production setup close to yours.',
    challenges: ['Manual or spreadsheet planning', 'Capacity and bottlenecks', 'Material readiness', 'Workforce and skills', 'Frequent rescheduling', 'Plan vs actual visibility', 'Other']
  }

  return { seo, capabilities, subnav, hero, complexity, framework, flow, board, gantt, constraints, readiness, scenarios, execution, visibility, integration, why, demo }
}

export function useFastScroll() {
  return (id: string) => {
    if (!import.meta.client) return
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenisInstance()
    if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.4 })
    else el.scrollIntoView({ behavior: window.matchMedia(reducedMotionQuery.reduce).matches ? 'auto' : 'smooth' })
  }
}

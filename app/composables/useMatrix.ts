import { MATRIX_ID } from '~/i18n/content/matrix'
/**
 * /matrix — MATRIX, Material Tracking, Inventory & Resource eXecution
 * (FCP by PASTI Technology). Brief + audit: docs/matrix/00-matrix-landing-page-brief.md.
 *
 * Source: MATRIX_Product_Book_by_PASTI_Technology.docx (owner, 2026-10-19),
 * itself based on a confidential client proposal. Copy is an English,
 * industry-neutral rendering of its product-level capabilities — no client,
 * place, people, codes, currency, RFID / offline / handover / duration,
 * automatic purchasing or disposal, AI or real-time claims.
 *
 * Unconfirmed or proposal-specific items stay in `register` with a status
 * and are never rendered. Every material, location, quantity and date below
 * is synthetic, illustrative sample data.
 */
export type MatrixStatus = 'core' | 'configurable' | 'proposal_specific' | 'needs_confirmation' | 'client_specific' | 'sample_data'

export interface MatrixRegisterItem {
  name: string
  source: string
  status: MatrixStatus
}

/** Balance composition of one material (illustrative). */
export interface StockMix {
  onHand: number
  reserved: number
  quarantine: number
  damaged: number
  requirement?: number
}
export type StockKey = 'net' | 'reserved' | 'quarantine' | 'damaged'

export const netAvailable = (m: StockMix) => Math.max(0, m.onHand - m.reserved - m.quarantine - m.damaged)

function matrixData() {
  const seo = {
    title: 'MATRIX — Inventory & Material Management | PASTI',
    description:
      'MATRIX is an integrated material and warehouse operations platform for inventory visibility, material availability, warehouse execution, replenishment, traceability, and operational control.'
  }

  // Internal register (docs/matrix/00). Only `core` / `configurable` render.
  const register: MatrixRegisterItem[] = [
    { name: 'Stock on hand & net availability', source: '§4', status: 'core' },
    { name: 'Inspection receipts not posted until confirmed', source: '§3', status: 'core' },
    { name: 'Material 360 & movement ledger', source: '§5', status: 'core' },
    { name: 'Critical availability', source: '§6', status: 'core' },
    { name: 'Replenishment recommendation under review', source: '§6', status: 'core' },
    { name: 'Aging & surplus with criticality guard', source: '§7', status: 'core' },
    { name: 'Receiving, inspection, putaway, request, picking, issue, transfer, return, stock count', source: '§8–9', status: 'core' },
    { name: 'Warehouse Explorer', source: '§10', status: 'core' },
    { name: 'Audit trail & reporting catalog', source: '§10–11', status: 'core' },
    { name: 'RBAC, maker-checker, approval authority, segregation of duties', source: '§11', status: 'core' },
    { name: 'Roles and KPI definitions', source: '§14', status: 'configurable' },
    { name: 'ERP interface, monitoring, migration, cutover', source: '§11 §13', status: 'configurable' },
    { name: 'Implementation phases', source: '§13', status: 'configurable' },
    { name: 'Equipment & spare parts context', source: '§12', status: 'proposal_specific' },
    { name: 'Document management, notifications', source: '§12', status: 'proposal_specific' },
    { name: 'Backup procedure, controlled deployment', source: '§11', status: 'needs_confirmation' },
    { name: 'RFID, offline-first mobile, source-code handover, duration', source: '§13 §15', status: 'needs_confirmation' },
    { name: 'Client, location, people, codes and values in the proposal UI', source: 'screenshots', status: 'client_specific' }
  ]

  const subnav = [
    { id: 'overview', label: 'Overview' },
    { id: 'intelligence', label: 'Intelligence' },
    { id: 'material-360', label: 'Material 360' },
    { id: 'execution', label: 'Execution' },
    { id: 'warehouse', label: 'Warehouse' },
    { id: 'governance', label: 'Governance' }
  ]

  // ---- Synthetic sample material (owner D3) --------------------------------
  const sample = {
    code: 'MTX-0412',
    name: 'Ball valve 2 in, Class 300',
    category: 'Valves & piping',
    unit: 'EA',
    warehouse: 'Central Warehouse',
    zone: 'Valve zone',
    bin: 'B-03-02',
    criticality: 'Critical',
    tracking: 'Serial tracked',
    movement: 'Moderate moving',
    mix: { onHand: 14, reserved: 5, quarantine: 2, damaged: 1, requirement: 9 } as StockMix,
    locations: [
      { path: 'Central Warehouse / Valve zone / B-03-02', qty: 10, state: 'Usable' },
      { path: 'Central Warehouse / Quarantine hold / Q-01', qty: 2, state: 'Quarantine' },
      { path: 'Yard B / Staging / S-04', qty: 2, state: 'Usable' }
    ],
    serials: [
      { id: 'SN-1041', state: 'Available' },
      { id: 'SN-1042', state: 'Reserved' },
      { id: 'SN-1043', state: 'Quarantine' },
      { id: 'SN-1044', state: 'Damaged' }
    ],
    planning: [
      { label: 'Reorder point', value: '8 EA' },
      { label: 'Minimum stock', value: '6 EA' },
      { label: 'Maximum stock', value: '20 EA' },
      { label: 'Lead time', value: '6 weeks' },
      { label: 'Near-term requirement', value: '9 EA' }
    ],
    ledger: [
      { time: 'Day 1 · 09:10', movement: 'Goods receipt', qty: '+12', from: 'Supplier delivery', to: 'Receiving', before: '2', after: '14', actor: 'Warehouse Operator', ref: 'GR-0001' },
      { time: 'Day 1 · 14:30', movement: 'Inspection → quarantine', qty: '2', from: 'Receiving', to: 'Quarantine hold', before: '0', after: '2', actor: 'Inspector', ref: 'IN-0007' },
      { time: 'Day 2 · 08:45', movement: 'Putaway', qty: '10', from: 'Receiving', to: 'Valve zone B-03-02', before: '0', after: '10', actor: 'Warehouse Operator', ref: 'PA-0019' },
      { time: 'Day 3 · 11:20', movement: 'Reservation', qty: '5', from: 'Net available', to: 'Work request', before: '0', after: '5', actor: 'Material Planner', ref: 'MR-0042' },
      { time: 'Day 4 · 16:05', movement: 'Condition → damaged', qty: '1', from: 'Valve zone', to: 'Damaged', before: '0', after: '1', actor: 'Warehouse Lead', ref: 'CC-0003' }
    ]
  }

  // ---- 01 Hero --------------------------------------------------------------
  const hero = {
    eyebrow: 'Framework Code Product',
    full: 'Material Tracking, Inventory & Resource eXecution',
    body: 'MATRIX is an integrated material and warehouse operations platform that helps organizations understand what material they have, where it is, what condition it is in, how much is actually available, and what operational action is required next.',
    facts: ['Net availability', 'Warehouse execution', 'Traceable movement']
  }

  // ---- 02 Problem -----------------------------------------------------------
  const problem = {
    eyebrow: 'The material visibility problem',
    headline: 'Having stock is not the same as having material ready for operation.',
    lede: 'A total on a screen hides the questions operations actually ask: can we use it, where is it, what state is it in, and who touched it last?',
    items: [
      { name: 'On hand is not usable', body: 'Physical stock includes material that cannot be issued today.' },
      { name: 'Reservations take their share', body: 'Material already promised to other work reduces what is available.' },
      { name: 'Quarantine and damage matter', body: 'Stock under inspection or in poor condition is not ready stock.' },
      { name: 'Location and condition matter', body: 'Knowing a quantity without knowing where and how it is stored is not enough.' },
      { name: 'Movement must be traceable', body: 'Every receipt, transfer and issue changes a balance someone will question later.' },
      { name: 'Requirements create shortfalls', body: 'Upcoming operational needs can exceed what is truly available.' },
      { name: 'Slow stock still needs context', body: 'An item that rarely moves may still be critical to keep.' }
    ]
  }

  // ---- 03 Layers ------------------------------------------------------------
  const layers = {
    eyebrow: 'What MATRIX is',
    headline: 'Three layers. One operational model.',
    lede: 'MATRIX connects understanding material, controlling warehouse work, and keeping the evidence behind every decision.',
    items: [
      { name: 'Material Intelligence', scope: ['Material master', 'Stock on hand', 'Material 360', 'Availability', 'Criticality', 'Aging', 'Replenishment'], out: 'Material identity and readiness, seen against what operations need.' },
      { name: 'Warehouse Execution', scope: ['Receiving', 'Inspection', 'Putaway', 'Request', 'Picking', 'Issue', 'Transfer', 'Return', 'Stock count'], out: 'Warehouse transactions recorded with status, reference and balance impact.' },
      { name: 'Governance & Control', scope: ['Approval', 'Role-based access', 'Maker-checker', 'Audit trail', 'Reporting', 'Interface control'], out: 'Decisions and changes that can be reviewed with supporting evidence.' }
    ],
    cycle: ['Receive', 'Inspect', 'Put away', 'Manage balance', 'Fulfil request', 'Issue / return', 'Count & reconcile', 'Monitor exceptions'],
    principle: 'Receipts still under inspection are not treated as posted stock until confirmed. Net availability always accounts for reservations, quarantine and damage.'
  }

  // ---- 04 Material intelligence (state explorer) ----------------------------
  const intelligence = {
    eyebrow: 'Material intelligence',
    headline: 'Read every state of a material, not just its total.',
    lede: 'Pick a state to see how it changes what one material can actually do for operations.',
    states: [
      { id: 'onhand', label: 'Stock on hand', body: 'Everything physically held across locations — the starting point, not the answer.' },
      { id: 'reserved', label: 'Reserved', body: 'Quantity already allocated to requests; it stays on hand but is no longer free.' },
      { id: 'quarantine', label: 'Quarantine', body: 'Held for inspection or decision; excluded until it is released.' },
      { id: 'damaged', label: 'Damaged', body: 'Recorded in poor condition; kept visible, never counted as usable.' },
      { id: 'net', label: 'Net available', body: 'On hand minus reserved, quarantine and damaged — what can be issued now.' },
      { id: 'location', label: 'Location', body: 'Where each quantity sits, from warehouse to zone to bin.' },
      { id: 'serial', label: 'Lot / serial', body: 'Which units carry which state, for serial- or lot-tracked material.' },
      { id: 'critical', label: 'Critical availability', body: 'Net available against the near-term requirement — and the shortfall.' },
      { id: 'replenish', label: 'Replenishment', body: 'Planning parameters that flag when stock needs a review.' },
      { id: 'aging', label: 'Aging / surplus', body: 'How long since the material last moved, and whether it needs a decision.' }
    ] as const
  }

  // ---- 05 Material 360 ------------------------------------------------------
  const m360 = {
    eyebrow: 'Material 360',
    headline: 'One material. One operational view.',
    lede: 'Identity, location, units, balance, readiness, planning and history — reviewed as one object instead of six screens.',
    steps: [
      { name: 'Identity', body: 'Code, description, category, criticality and tracking method.' },
      { name: 'Locations & serials', body: 'Where each quantity sits and the state of every unit.' },
      { name: 'Stock composition', body: 'On hand split into reserved, quarantine, damaged and net available.' },
      { name: 'Readiness', body: 'Net available checked against the near-term requirement.' },
      { name: 'Planning parameters', body: 'Reorder point, min / max and lead time behind the review.' },
      { name: 'Movement history', body: 'Every change to the balance, in order, with its evidence.' }
    ]
  }

  // ---- 06 Availability to action --------------------------------------------
  const availability = {
    eyebrow: 'Availability to action',
    headline: 'See the shortage. Understand the risk. Review the action.',
    lede: 'Critical exposure, shortfall, lead time and incoming supply become an item someone reviews — replenishment stays under user and governance control.',
    incoming: { qty: 4, eta: 'Week 3', ref: 'Open purchase order' },
    recommendation: { qty: 4, status: 'Pending review' },
    note: 'A recommendation is a proposal for review. MATRIX does not create purchases on its own.'
  }

  // ---- 07 Aging -------------------------------------------------------------
  const aging = {
    eyebrow: 'Aging, surplus & deadstock',
    headline: 'Old stock needs a decision, not an assumption.',
    lede: 'Age bands and movement classes surface surplus candidates. A criticality guard keeps essential material out of disposal review, and every decision leaves evidence.',
    bands: ['0–90 days', '91–180 days', '181–365 days', '365+ days'],
    items: [
      { code: 'MTX-0218', name: 'Mechanical seal kit', band: 3, age: 412, last: 'Over a year ago', cls: 'Non-moving', guarded: false },
      { code: 'MTX-0307', name: 'Pressure gauge 0–100 bar', band: 3, age: 388, last: 'Over a year ago', cls: 'Deadstock', guarded: false },
      { code: 'MTX-0455', name: 'Pump impeller, spare', band: 3, age: 530, last: 'Over a year ago', cls: 'Non-moving', guarded: true },
      { code: 'MTX-0129', name: 'Spiral-wound gasket set', band: 2, age: 236, last: 'Eight months ago', cls: 'Slow-moving', guarded: false },
      { code: 'MTX-0561', name: 'Hydraulic hose assembly', band: 1, age: 121, last: 'Four months ago', cls: 'Slow-moving', guarded: false }
    ],
    evidence: [
      { label: 'Review status', value: 'Surplus candidate · under review' },
      { label: 'Reason', value: 'No movement over the review period' },
      { label: 'Approver', value: 'Approver / Supervisor' },
      { label: 'Action', value: 'Pending decision' },
      { label: 'History', value: 'Recorded in the audit trail' }
    ]
  }

  // ---- 08 Warehouse execution -----------------------------------------------
  const execution = {
    eyebrow: 'Warehouse execution',
    headline: 'From the receiving dock to the count sheet.',
    lede: 'Every warehouse task is tied to its balance impact and its evidence — so the record follows the material.',
    steps: [
      { name: 'Receive', controls: ['PO / delivery line context', 'Quantity against expected', 'Serial / lot capture', 'Discrepancy recording', 'Documents and photos'] },
      { name: 'Inspect', controls: ['Inspection decision', 'Accept, quarantine or reject', 'Balance impact shown before confirmation', 'Not posted on hand until confirmed'] },
      { name: 'Put away', controls: ['Destination location', 'Capacity check', 'Storage restriction check', 'Task control'] },
      { name: 'Request', controls: ['Work context', 'Allocation from net available', 'Approval state', 'Fulfilment status'] },
      { name: 'Pick', controls: ['Location-based picking', 'Serial / lot confirmation', 'Short-pick handling'] },
      { name: 'Issue', controls: ['Issue against the request', 'Balance reduced with reference', 'Recorded in the movement ledger'] },
      { name: 'Transfer / return', controls: ['Between locations or warehouses', 'Return with condition', 'Before / after balance'] },
      { name: 'Count', controls: ['Blind count entry', 'Variance investigation', 'Adjustment workflow with approval'] }
    ]
  }

  // ---- 09 Warehouse explorer ------------------------------------------------
  type Restriction = 'standard' | 'controlled' | 'hazardous' | 'quarantine'
  const explorer = {
    eyebrow: 'Warehouse explorer',
    headline: 'Know where material is. Know whether it belongs there.',
    lede: 'Browse the warehouse by hierarchy, see occupancy and capacity per zone, and check storage restrictions before material moves.',
    warehouse: 'Central Warehouse',
    zones: [
      { id: 'recv', name: 'Receiving & staging', area: 'recv', used: 62, capacity: '24 positions', restriction: 'standard' as Restriction, held: 'Inbound deliveries awaiting inspection' },
      { id: 'valve', name: 'Valve zone', area: 'valve', used: 71, capacity: '48 bins', restriction: 'standard' as Restriction, held: 'MTX-0412 Ball valve 2 in · 10 EA in B-03-02' },
      { id: 'rot', name: 'Rotating spares', area: 'rot', used: 58, capacity: '36 bins', restriction: 'controlled' as Restriction, held: 'MTX-0455 Pump impeller, spare · 3 EA' },
      { id: 'inst', name: 'Instrument zone', area: 'inst', used: 66, capacity: '40 bins', restriction: 'controlled' as Restriction, held: 'MTX-0307 Pressure gauge · 6 EA' },
      { id: 'quar', name: 'Quarantine hold', area: 'quar', used: 35, capacity: '12 positions', restriction: 'quarantine' as Restriction, held: 'MTX-0412 Ball valve 2 in · 2 EA pending inspection' },
      { id: 'haz', name: 'Hazardous store', area: 'haz', used: 44, capacity: '10 positions', restriction: 'hazardous' as Restriction, held: 'Restricted to approved hazardous items' },
      { id: 'gen', name: 'General stores', area: 'gen', used: 83, capacity: '60 bins', restriction: 'standard' as Restriction, held: 'MTX-0218 Mechanical seal kit · 4 EA' }
    ],
    restrictions: {
      standard: 'Standard storage',
      controlled: 'Controlled environment',
      hazardous: 'Hazardous',
      quarantine: 'Quarantine'
    } as Record<Restriction, string>
  }

  // ---- 10 Governance --------------------------------------------------------
  const governance = {
    eyebrow: 'Traceability & governance',
    headline: 'Every movement leaves evidence.',
    lede: 'The movement ledger shows what changed a balance; the audit trail shows who changed what, when and why. Approvals and reports sit on the same record.',
    audit: [
      { time: 'Day 4 · 16:05', actor: 'Warehouse Lead', action: 'Condition changed', object: 'MTX-0412', before: 'Usable 1', after: 'Damaged 1', ref: 'CC-0003' },
      { time: 'Day 4 · 10:40', actor: 'Approver', action: 'Adjustment approved', object: 'Count C-0011', before: '—', after: 'Approved', ref: 'AD-0006' },
      { time: 'Day 3 · 15:12', actor: 'Approver', action: 'Request returned with reason', object: 'MR-0044', before: 'Submitted', after: 'Returned', ref: 'MR-0044' },
      { time: 'Day 3 · 11:20', actor: 'Material Planner', action: 'Reservation created', object: 'MTX-0412', before: 'Reserved 0', after: 'Reserved 5', ref: 'MR-0042' }
    ],
    controls: [
      { name: 'Role-based access', body: 'Access and navigation follow each user’s responsibility.' },
      { name: 'Maker-checker', body: 'The person who prepares is not the person who approves.' },
      { name: 'Approval authority', body: 'Who may approve what is configured, not improvised.' },
      { name: 'Segregation of duties', body: 'Conflicting tasks stay with different roles.' },
      { name: 'Rejection reason', body: 'A returned request always says why.' },
      { name: 'Decision evidence', body: 'Every decision keeps its reason, approver and reference.' }
    ],
    reports: ['Stock on hand', 'Stock movement ledger', 'Critical availability', 'Below reorder point', 'Aging & surplus', 'Quarantine & damaged stock', 'Receiving status', 'Replenishment review'],
    roles: ['Warehouse Operator', 'Warehouse Lead', 'Material Planner', 'Approver / Supervisor', 'Management / Audit']
  }

  // ---- 11 Integration -------------------------------------------------------
  const integration = {
    eyebrow: 'Integration & implementation',
    headline: 'Connected to your ERP. Introduced with control.',
    lede: 'Inventory transactions are exchanged through an agreed interface, monitored and reconciled — and the rollout follows an approved blueprint.',
    transactions: ['Goods receipt', 'Material issue', 'Transfer', 'Return', 'Stock balance', 'Adjustment result'],
    controls: ['Validation', 'Error log', 'Retry', 'Idempotency', 'Reconciliation', 'Data migration'],
    phases: [
      { name: 'Blueprint', body: 'Validate needs, processes, roles, warehouse locations, data, integration and acceptance criteria.' },
      { name: 'Configure & build', body: 'Configure processes, data model, interfaces, reports, roles, approvals and exceptions.' },
      { name: 'Migrate & validate', body: 'Map data, run trial migration, cleanse, reconcile and validate with users.' },
      { name: 'Test & train', body: 'Test operational flows, interfaces, controls, security and user readiness.' },
      { name: 'Cutover & stabilize', body: 'Run the approved cutover, monitor, resolve issues and hand over.' }
    ],
    note: 'Interface scope, data contract, timeline and acceptance criteria follow the approved blueprint. MATRIX is not assumed to be plug-and-play with every ERP.'
  }

  // ---- 12 Why + demo --------------------------------------------------------
  const why = ['Material visibility', 'Net availability', 'Material 360', 'Warehouse execution', 'Critical availability', 'Replenishment review', 'Aging & surplus control', 'Movement traceability', 'Audit evidence', 'Maker-checker & approval', 'Reporting', 'Integration-ready', 'Configurable by blueprint']

  const demo = {
    eyebrow: 'Request a demo',
    headline: 'Know what you have. Know what you can use. Know what to do next.',
    body: 'Tell us how your warehouses run today and where material certainty breaks down. We will walk you through MATRIX with a setup close to yours.',
    warehouses: ['1', '2 – 5', '6 – 20', 'More than 20'],
    challenges: ['Stock accuracy', 'Usable vs on-hand stock', 'Critical material shortfalls', 'Slow-moving & surplus stock', 'Warehouse task control', 'Traceability & audit', 'ERP integration', 'Other']
  }

  return { seo, register, subnav, sample, hero, problem, layers, intelligence, m360, availability, aging, execution, explorer, governance, integration, why, demo }
}

export type MatrixData = ReturnType<typeof matrixData>

// Bilingual site: English base data + Indonesian overlay (text only — ids,
// statuses and sample codes stay as above). Outside Nuxt → English.
export function useMatrix() {
  return localize(matrixData(), useLocale() === 'id' ? MATRIX_ID : undefined)
}

export type ShiftlyStatus = 'confirmed' | 'needs_approval' | 'placeholder'

export interface ShiftlyModule {
  name: string
  body: string
  /** Shown on the SHIFTLY Standard list (deck slide "All the Essentials"). */
  standard: boolean
}

export interface ShiftlyModuleGroup {
  id: string
  label: string
  modules: ShiftlyModule[]
}

export type CompareValue = 'included' | 'limited' | 'addon' | 'none' | 'text'
export interface ShiftlyCompareRow {
  capability: string
  standard: { kind: CompareValue; label: string }
  enterprise: { kind: CompareValue; label: string }
}

/**
 * SHIFTLY landing page content (owner brief 2026-10-07, docs/shiftly/).
 * Source of truth: "SHIFTLY PRODUCT_2026_UPDATE (1).pdf" (13 slides, image
 * only — transcribed). Slide numbers below are the PDF page order.
 *
 * Owner decisions 2026-10-07: display name "SHIFTLY"; contact = the site's
 * existing contact (temporary); the "SHIFTLY vs HRIS Umum" table is shown as
 * SHIFTLY's own column only (no competitor comparison); the page is
 * consolidated to ~10 sections ("Built for your business" folded into Why,
 * "Platform experience" into Hero + Modules).
 *
 * Excluded: slide 12 "Over 50++ Clients Trust Our Creative Services" (about
 * PASTI's creative services, not SHIFTLY adoption) and its logos; "global
 * compliance" / "compliant" wording (no certification in source); slide 13
 * "Technology meets wellness" (off-positioning). Pricing is stored in
 * `commercial` with publicationStatus 'needs_approval' and is NOT rendered.
 */
export function useShiftly() {
  const seo = {
    title: 'SHIFTLY — Modern HRIS & Workforce Platform | PASTI',
    description:
      'SHIFTLY is a customizable HRIS and workforce platform for managing employees, attendance, payroll, performance, workflows, and connected workplace devices in one integrated system.'
  }

  // Slide 1 + slide 13.
  const hero = {
    eyebrow: 'Modern HRIS Platform',
    headline: 'Everything HR, Simplified.',
    body: 'SHIFTLY helps your organization manage people, process, and performance in one unified platform.',
    pillars: ['All-in-One HRIS', 'Customizable Modules', 'Mobile Apps', 'Data-Driven Insights'],
    enterprise: 'Enterprise HR Infrastructure That Scales With Your Business.',
    traits: ['Flexible', 'Scalable', 'Customizable', 'Enterprise-Ready'],
    dashboard: { src: '/images/shiftly/dashboard.webp', alt: 'SHIFTLY web dashboard: HR overview with employees, leave, attendance and payroll cards, workforce insights and pending approvals' },
    mobile: { src: '/images/shiftly/mobile.webp', alt: 'SHIFTLY mobile app home: check-in card, quick access to attendance, leave, payslip and schedule, and upcoming schedule' }
  }

  // Slide 11.
  const platform = {
    eyebrow: 'More than just HRIS',
    headline: 'An Enterprise Workforce Operating Platform.',
    body: 'Unify people, processes, and technology in one intelligent platform to drive performance, engagement, and business growth.',
    layers: [
      { name: 'People', body: 'Empower every employee experience.' },
      { name: 'Process', body: 'Automate and optimize workflows.' },
      { name: 'Data', body: 'Make smarter decisions with real-time insights.' },
      { name: 'Technology', body: 'Scalable, secure, and built for enterprise.' }
    ],
    capabilities: [
      { name: 'Workforce Management', body: 'End-to-end employee lifecycle management.' },
      { name: 'Intelligent Automation', body: 'Streamline HR processes and reduce manual work.' },
      { name: 'Performance Enablement', body: 'Drive goals, feedback, and continuous growth.' },
      { name: 'Real-time Analytics', body: 'Actionable insights for better decisions.' },
      { name: 'Secure & Reliable', body: 'Enterprise-grade security for every integration.' },
      { name: 'Seamless Integrations', body: 'Connect with your essential business systems.' }
    ]
  }

  // Slides 3 + 6, grouped for the explorer. Bodies are the deck's own lines.
  const moduleGroups: ShiftlyModuleGroup[] = [
    {
      id: 'core',
      label: 'Core People Operations',
      modules: [
        { name: 'Employee Management', body: 'Centralized employee data, organization structure, and profiles.', standard: true },
        { name: 'Organization', body: 'Manage structure, teams, and positions.', standard: true },
        { name: 'Attendance & Shift', body: 'Mobile attendance, GPS, shift scheduling, and overtime management.', standard: true },
        { name: 'Leave & Permission', body: 'Leave requests, approvals, and balance tracking made simple.', standard: true },
        { name: 'Payroll', body: 'Payroll processing, components, deductions, and detailed reports.', standard: true }
      ]
    },
    {
      id: 'talent',
      label: 'Talent & Performance',
      modules: [
        { name: 'Performance', body: 'Set goals, track KPIs, and evaluate employee performance.', standard: true },
        { name: 'Recruitment', body: 'Manage candidates, hiring pipeline, and onboarding journey.', standard: false },
        { name: 'Training', body: 'Plan, assign, and track employee training and development.', standard: false }
      ]
    },
    {
      id: 'daily',
      label: 'Daily Operations',
      modules: [
        { name: 'Announcement', body: 'Broadcast important updates and engage employees.', standard: true },
        { name: 'Reimbursement', body: 'Manage expense claims and reimbursements.', standard: true },
        { name: 'Expense & Claim', body: 'Submit and approve expenses and claims efficiently.', standard: true },
        { name: 'Asset', body: 'Manage company assets and assignments.', standard: true },
        { name: 'Calendar', body: 'Company calendar and important schedules.', standard: true },
        { name: 'Document', body: 'Store and manage important HR documents.', standard: true }
      ]
    },
    {
      id: 'platform',
      label: 'Platform & Reporting',
      modules: [
        { name: 'Dashboard', body: 'Real-time overview of HR key metrics.', standard: true },
        { name: 'Report', body: 'Generate HR reports and analytics.', standard: true },
        { name: 'Settings', body: 'Configure system preferences and user access.', standard: true }
      ]
    }
  ]
  const modulesMore = 'And more — assets, policies, reports, document management, and more.'

  // Slide 8 (SHIFTLY Standard vs Enterprise Expansion; the generic
  // "Standard HRIS" comparison column is dropped).
  const compare: ShiftlyCompareRow[] = [
    { capability: 'Core HRIS Modules', standard: { kind: 'included', label: 'Included' }, enterprise: { kind: 'text', label: '—' } },
    { capability: 'Mobile Apps', standard: { kind: 'included', label: 'Included' }, enterprise: { kind: 'text', label: '—' } },
    { capability: 'Reporting & Analytics', standard: { kind: 'included', label: 'Included' }, enterprise: { kind: 'text', label: '—' } },
    { capability: 'Multi-level Approval', standard: { kind: 'included', label: 'Included' }, enterprise: { kind: 'text', label: '—' } },
    { capability: 'API Integration', standard: { kind: 'included', label: 'Included (Standard API)' }, enterprise: { kind: 'text', label: 'Advanced integration available' } },
    { capability: 'Workflow Customization', standard: { kind: 'limited', label: 'Limited (Standard Flow)' }, enterprise: { kind: 'addon', label: 'Available as Add-on' } },
    { capability: 'Module Development', standard: { kind: 'none', label: 'Not Available' }, enterprise: { kind: 'addon', label: 'Available as Add-on' } },
    { capability: 'Custom Branding / White-label', standard: { kind: 'none', label: 'Not Available' }, enterprise: { kind: 'addon', label: 'Available as Add-on' } },
    { capability: 'IoT & Smart Device Integration', standard: { kind: 'none', label: 'Not Available' }, enterprise: { kind: 'addon', label: 'Available as Add-on' } },
    { capability: 'Fingerprint Realtime Sync', standard: { kind: 'included', label: 'Included' }, enterprise: { kind: 'text', label: 'Advanced device integration' } },
    { capability: 'Face Recognition', standard: { kind: 'limited', label: 'Optional' }, enterprise: { kind: 'text', label: 'Enterprise-ready (Add-on)' } },
    { capability: 'Smart Door Lock Integration', standard: { kind: 'none', label: 'Not Available' }, enterprise: { kind: 'addon', label: 'Available as Add-on' } },
    { capability: 'Deployment Options', standard: { kind: 'limited', label: 'Cloud' }, enterprise: { kind: 'text', label: 'Dedicated / On-Premise' } },
    { capability: 'Scalability', standard: { kind: 'included', label: 'Enterprise-ready' }, enterprise: { kind: 'text', label: 'Fully expandable' } }
  ]
  const plans = {
    eyebrow: 'Standard subscription vs enterprise expansion',
    headline: 'Start with the essentials. Expand when you need to.',
    body: 'Core HRIS capabilities are included in the standard subscription. Enterprise customization, branding, and integrations are available separately based on your organization’s needs.',
    expansion: ['Workflow Customization', 'Module Engineering', 'Enterprise Branding', 'API Integrations', 'IoT & Smart Device Integrations', 'And more'],
    expansionNote: 'Available based on implementation scope and operational requirements.',
    why: 'Get a solid HRIS foundation today, and expand as your organization grows and your needs evolve.'
  }

  // Slides 4 + 10.
  const devices = {
    eyebrow: 'IoT & smart device integration',
    headline: 'Easy connect to smart devices.',
    body: 'Connect SHIFTLY with smart devices and IoT ecosystems to automate attendance, security, and workplace operations in real-time.',
    items: [
      { id: 'fingerprint', name: 'Fingerprint Attendance', body: 'Capture attendance instantly with fingerprint devices. Data syncs in real-time to ensure accuracy and reduce fraud.' },
      { id: 'face', name: 'Face Recognition', body: 'Seamless, secure access using face recognition technology for doors and office entry.' },
      { id: 'lock', name: 'Smart Door Lock', body: 'Control and monitor door access remotely, integrated with SHIFTLY for enhanced security and convenience.' },
      { id: 'sensor', name: 'Environment Sensors', body: 'Real-time data from sensors and other IoT devices, managed from the same dashboard.' }
    ],
    benefits: [
      { name: 'Real-time Sync', body: 'Capture and sync data from IoT devices instantly for accurate and up-to-date information.' },
      { name: 'Enhanced Security', body: 'Strengthen access control and authentication with smart lock and biometric integration.' },
      { name: 'Unified Platform', body: 'Manage all devices and data from a single dashboard within SHIFTLY.' },
      { name: 'Smarter Decisions', body: 'Leverage real-time data and insights to improve workplace efficiency.' }
    ],
    note: '…and more integrations, scoped per project.'
  }

  // Slide 9 (price withheld — see `commercial`).
  const branding = {
    eyebrow: 'Enterprise add-on',
    headline: 'Enterprise Branding Suite.',
    body: 'Make SHIFTLY truly yours. The Enterprise Branding Suite empowers your organization with a fully white-labeled experience that reflects your brand identity across the entire platform.',
    features: [
      { name: 'White-label Platform', body: 'Remove SHIFTLY branding and make it your own.' },
      { name: 'Custom Domain', body: 'Use your company’s domain for a seamless brand experience.' },
      { name: 'Corporate Identity', body: 'Apply your logo, colors, typography, and visual identity.' },
      { name: 'UI Personalization', body: 'Tailor the look and feel of the platform to match your brand guidelines.' },
      { name: 'Brand Deployment', body: 'Consistent branding across web dashboard and mobile apps.' }
    ],
    tagline: 'Your Brand. Your Platform. Your Identity.'
  }

  // Slide 5 (SHIFTLY column only) + slide 2 ("Built for your business").
  const why = {
    eyebrow: 'Our differentiator',
    headline: 'Different by design. Better by experience.',
    body: 'SHIFTLY isn’t just an HRIS. It combines flexibility, powerful features, and modern technology to give you an HR solution that truly fits your business.',
    items: [
      { name: 'Custom Modules', body: 'Create or adapt modules based on your business needs.' },
      { name: 'Custom Branding', body: 'Apply your logo, colors, domain, and visual identity.' },
      { name: 'Flexible Workflows', body: 'Set up approval flows and processes the way you work.' },
      { name: 'Easy Connect to IoT', body: 'Connect to devices like face recognition, door lock, fingerprint, and more.' },
      { name: 'Real-time Data', body: 'Live sync and instant updates across all modules.' },
      { name: 'Scalable & Future-ready', body: 'Designed to grow with your business, from small to enterprise.' },
      { name: 'Centralized Monitoring', body: 'Monitor all devices and activities from one dashboard.' },
      { name: 'Dedicated Support', body: 'Implementation, training, and ongoing support.' }
    ],
    statement: { title: 'Your system. Your brand. Your rules.', body: 'SHIFTLY gives you the freedom to build an HR platform that truly fits your organization.' }
  }

  // High level only (slides 4, 8, 10, 11) — no vendors, protocols or certs.
  const architecture = {
    eyebrow: 'Integration & architecture',
    headline: 'One platform at the centre of your workforce.',
    body: 'Connect SHIFTLY with your essential business systems and smart devices — all data updated instantly and accurately, and monitored from one dashboard.',
    nodes: [
      { id: 'hr', name: 'HR Operations', body: 'Employees, attendance, leave, payroll, performance.' },
      { id: 'web', name: 'Web & Mobile', body: 'Web dashboard and mobile apps for HR and employees.' },
      { id: 'systems', name: 'Business Systems', body: 'Standard API included; advanced integration as an enterprise add-on.' },
      { id: 'devices', name: 'IoT & Devices', body: 'Fingerprint, face recognition, smart door lock, sensors.' }
    ],
    deployment: [
      { name: 'Cloud', body: 'SHIFTLY Standard subscription.' },
      { name: 'Dedicated / On-Premise', body: 'Enterprise Expansion.' }
    ]
  }

  // Commercial data — NOT rendered (owner approval required).
  const commercial = {
    publicationStatus: 'needs_approval' as ShiftlyStatus,
    standardPrice: 'Rp 25.000 / user / year',
    standardIncludes: 'All standard HRIS modules and platform capabilities.',
    contract: '3 years minimum commitment (Enterprise)',
    priceExcludes: 'Price excludes Enterprise Expansion Services (add-on).',
    brandingFrom: 'Rp 250.000.000',
    source: 'SHIFTLY deck slides 8–9'
  }
  const pricing = {
    eyebrow: 'Pricing',
    headline: 'Flexible plans for growing teams and enterprises.',
    plans: [
      { name: 'SHIFTLY Standard', body: 'All core HRIS modules, mobile apps, reporting & analytics, multi-level approval and standard API — on cloud.', points: ['Per-user subscription', 'Core HRIS modules included', 'Cloud deployment'] },
      { name: 'Enterprise Expansion', body: 'Add-on services scoped to your implementation and operational requirements.', points: ['Workflow & module engineering', 'Enterprise branding / white-label', 'IoT, devices & advanced integration', 'Dedicated / on-premise options'] }
    ]
  }

  const demo = {
    headline: 'Ready to simplify your HR operations?',
    body: 'See how SHIFTLY helps you manage people, processes, performance, and connected devices in one unified platform.',
    sizes: ['1–50', '51–200', '201–500', '501–1,000', '1,000+'],
    challenges: ['Attendance & shift management', 'Payroll & reimbursement', 'Performance management', 'Recruitment & training', 'Workflow & approvals', 'Device / IoT integration', 'Custom branding / white-label', 'Other']
  }

  const subnav = [
    { id: 'overview', label: 'Overview' },
    { id: 'modules', label: 'Modules' },
    { id: 'enterprise', label: 'Enterprise' },
    { id: 'devices', label: 'Devices' },
    { id: 'pricing', label: 'Pricing' }
  ]

  return { seo, hero, platform, moduleGroups, modulesMore, compare, plans, devices, branding, why, architecture, commercial, pricing, demo, subnav }
}

export function useShiftlyScroll() {
  return (id: string) => {
    if (!import.meta.client) return
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenisInstance()
    if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.4 })
    else el.scrollIntoView({ behavior: window.matchMedia(reducedMotionQuery.reduce).matches ? 'auto' : 'smooth' })
  }
}

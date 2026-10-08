export type CasePublicationStatus = 'approved' | 'needs_approval'
export type CaseContentStatus = 'source-backed' | 'partial'

export interface CaseMetric {
  value: string
  label: string
  source: string
  publicationStatus: CasePublicationStatus
}

export interface CaseVisual {
  /** Public path the asset is (or will be) served from. */
  src: string
  alt: string
  kind: 'poster' | 'screen' | 'dashboard'
  source: string
  publicationStatus: CasePublicationStatus
  /** Original crop (outside public/) the served file was made from. */
  candidateFile?: string
}

export interface CaseTimelineStep {
  label: string
  weeks: number
}

export interface FeaturedCase {
  id: string
  index: string
  title: string
  client?: string
  category: string
  /** Project year. Owner-set placeholder (2026-10-07: "set to 2025" until
   * the real years are known), not from COMPRO. */
  year?: string
  /** Title of the matching Selected Work card on /work, if any. */
  projectRef?: string
  businessContext?: string
  challenge?: string[]
  request?: string[]
  solution?: string[]
  outcome?: string[]
  insight?: string
  timeline?: { steps: CaseTimelineStep[]; total: string }
  technologyStack?: string[]
  metrics?: CaseMetric[]
  visuals: CaseVisual[]
  publicationStatus: CasePublicationStatus
  contentStatus: CaseContentStatus
  /** Audit only — never rendered. */
  missingFields: string[]
  /** Audit only — never rendered. */
  approvalNotes?: string[]
  source: string
}

/**
 * Featured Case Studies for /work (owner decision 2026-10-07, Work Step 3).
 *
 * Every field is source-backed by the COMPRO 2025 company profile (page
 * numbers in `source`); copy follows the source wording as closely as
 * possible (Step 4 QA, 2026-10-07) — numbers removed, never extended.
 * Fields the source doesn't cover are simply absent — the UI omits them.
 *
 * Publication gates (owner approvals 2026-10-07, Work Step 5):
 * - A case renders only when its `publicationStatus` is 'approved'
 *   (`publicCases`). All four cases — including AT-WF — are now approved.
 * - Metrics and visuals carry their own status and the UI renders only the
 *   'approved' ones. The owner approved the COMPRO screenshots, the Textile
 *   metrics and the AT-WF metrics/screenshots; the crops are served from
 *   public/images/work/cases/ (originals kept in docs/work/case-assets/).
 * - The existing Selected Work posters remain the primary visual for
 *   PowerHours and HDI.
 * - `year` is an owner-set placeholder (2025) for every case.
 *
 * Stock-model photos from COMPRO are deliberately not included.
 */
export function useFeaturedCases() {
  const allCases: FeaturedCase[] = [
    {
      id: 'powerhours',
      index: '01',
      year: '2025',
      title: 'PowerHours',
      category: 'Mobile App / Wellness',
      projectRef: 'PowerHours',
      businessContext:
        'A fitness app that helps people stay consistent with their workouts, access professional training sessions and track progress in real time — for individuals, communities and corporate wellness programs.',
      challenge: [
        'Designing a highly engaging but lightweight UI/UX for all user levels.',
        'Optimizing video content for smooth playback on low-speed internet.',
        'Building a modular workout scheduling system.'
      ],
      solution: [
        'Developed a user-centric interface with motivational visual elements.',
        'Utilized CDN and video compression to ensure seamless streaming.',
        'Built a backend system with customizable training templates.',
        'Included built-in progress tracking with smart reminders and leaderboard gamification.'
      ],
      timeline: {
        steps: [
          { label: 'Discovery & Planning', weeks: 1 },
          { label: 'UI/UX Design', weeks: 2 },
          { label: 'Development & QA', weeks: 8 },
          { label: 'Deployment & Support', weeks: 3 }
        ],
        total: '~3.5 months'
      },
      technologyStack: [
        'Flutter (Android & iOS)',
        'Node.js + Firebase',
        'Firestore + Cloud Storage',
        'HLS via Firebase CDN',
        'Firebase Cloud Messaging'
      ],
      visuals: [
        {
          src: '/images/selected-work/powerhours.webp',
          alt: 'PowerHours fitness app shown on a phone beside a woman checking her workout progress',
          kind: 'poster',
          source: 'Selected Work poster (already public)',
          publicationStatus: 'approved'
        },
        {
          src: '/images/work/cases/powerhours-screens.webp',
          alt: 'Four PowerHours app screens: onboarding, membership offer, interest picker and personalised feed',
          kind: 'screen',
          source: 'COMPRO 2025 p.21',
          publicationStatus: 'approved',
          candidateFile: 'docs/work/case-assets/powerhours-screens.webp'
        }
      ],
      publicationStatus: 'approved',
      contentStatus: 'source-backed',
      missingFields: ['outcome', 'metrics', 'real year'],
      approvalNotes: ['Owner approved the app screens (2026-10-07) as shown — they include £9.99/month pricing.'],
      source: 'COMPRO 2025 p.21–22'
    },
    {
      id: 'textile',
      index: '02',
      year: '2025',
      title: 'Textile Production Monitoring Dashboard',
      client: 'Nagaria Textile',
      category: 'Operational Dashboard / Manufacturing Monitoring',
      businessContext:
        'A manufacturing company that needed to monitor production efficiency across multiple shifts and looms.',
      challenge: [
        'Production data was scattered and reporting was manual.',
        'Managers lacked real-time visibility into RPM, efficiency, yarn breakage and production quality.',
        'Delayed decisions reduced overall productivity.'
      ],
      // Conservative on purpose: the source doesn't describe PASTI's scope.
      solution: ['A production monitoring dashboard designed to centralize operational visibility across shifts and looms.'],
      outcome: [
        'Faster decision-making thanks to real-time visibility of production data.',
        'Shift managers could quickly identify inefficiencies.',
        'Improved product quality by tracking yarn breakage and loom-specific performance.',
        'Enhanced cross-shift accountability through comparative metrics.'
      ],
      metrics: [
        { value: '40%', label: 'faster decision-making', source: 'COMPRO 2025 p.9', publicationStatus: 'approved' },
        { value: '25%', label: 'reduction in downtime', source: 'COMPRO 2025 p.9', publicationStatus: 'approved' }
      ],
      visuals: [
        {
          src: '/images/work/cases/textile-dashboard.webp',
          alt: 'Nagaria Textile production dashboard with RPM, efficiency and per-shed loom charts and a monthly RPM trend',
          kind: 'dashboard',
          source: 'COMPRO 2025 p.9',
          publicationStatus: 'approved',
          candidateFile: 'docs/work/case-assets/textile-dashboard.webp'
        }
      ],
      publicationStatus: 'approved',
      contentStatus: 'partial',
      missingFields: ['solution detail / PASTI scope', 'timeline', 'technologyStack', 'real year', 'metric methodology'],
      approvalNotes: ['Owner approved the 40% / 25% metrics and the dashboard (2026-10-07); the dashboard shows a "Logo" placeholder in its UI.'],
      source: 'COMPRO 2025 p.9'
    },
    {
      id: 'hdi',
      index: '03',
      year: '2025',
      title: 'HDI Healthy Lifestyle',
      client: 'PT Harmoni Dinamik Indonesia',
      category: 'Mobile App / Employee Wellness',
      projectRef: 'HDI Healthy Lifestyle',
      businessContext:
        'A leading industrial workforce provider with a strong focus on employee wellbeing. It partnered with PASTI to develop a Healthy Lifestyle App that encourages healthier habits through digital wellness tools tailored for its workforce.',
      challenge: [
        'Delivering health education in a format that is engaging and not overly formal.',
        'Developing a self-assessment system that is simple yet insightful.',
        'Encouraging daily usage among non-digital-native employees.'
      ],
      request: [
        'Educational content on physical and mental wellness.',
        'Periodic health self-assessments for employees.',
        'Activity tracking (hydration, meditation, exercise, etc.).',
        'Personalized recommendations and daily health reminders.'
      ],
      visuals: [
        {
          src: '/images/selected-work/hdi-healthy-lifestyle.webp',
          alt: 'HDI Healthy Lifestyle app on a phone showing daily activity and challenges, held by a smiling woman',
          kind: 'poster',
          source: 'Selected Work poster (already public)',
          publicationStatus: 'approved'
        },
        {
          src: '/images/work/cases/hdi-screens-a.webp',
          alt: 'HDI app onboarding, welcome and sign-in screens',
          kind: 'screen',
          source: 'COMPRO 2025 p.23',
          publicationStatus: 'approved',
          candidateFile: 'docs/work/case-assets/hdi-screens-a.webp'
        },
        {
          src: '/images/work/cases/hdi-screens-b.webp',
          alt: 'HDI app mood check, training plan, meals, recipes and goal-setting screens',
          kind: 'screen',
          source: 'COMPRO 2025 p.24',
          publicationStatus: 'approved',
          candidateFile: 'docs/work/case-assets/hdi-screens-b.webp'
        }
      ],
      publicationStatus: 'approved',
      contentStatus: 'partial',
      missingFields: ['solution', 'outcome', 'metrics', 'timeline', 'technologyStack', 'real year'],
      approvalNotes: ['Owner approved the app screens (2026-10-07) as shown — some are labelled "Slimming Apps".'],
      source: 'COMPRO 2025 p.22–24'
    },
    {
      id: 'at-wf',
      index: '04',
      year: '2025',
      title: 'Workflow Automation Platform (AT-WF)',
      client: 'A major enterprise',
      category: 'Workflow Automation / Enterprise Platform',
      businessContext: 'An enterprise managing operational workflows across departments.',
      challenge: [
        'Manual processes and fragmented communication.',
        'No real-time monitoring, leading to delays, duplicated work and difficulty ensuring compliance.',
        'A need for a centralized workflow system to standardize processes, improve transparency and accelerate decisions.'
      ],
      outcome: [
        'Faster approval processes across departments.',
        'Improved compliance and accountability through audit-ready reports.',
        'Fewer manual errors by eliminating duplication and paper-based workflows.',
        'Stronger cross-department collaboration as processes became transparent and standardized.'
      ],
      insight:
        'Workflow automation accelerated operational efficiency and shifted teams from reactive to proactive collaboration; standardization became the backbone for further digital transformation.',
      metrics: [
        { value: '30%', label: 'faster approvals within the first quarter', source: 'COMPRO 2025 p.11', publicationStatus: 'approved' },
        { value: '70%', label: 'fewer manual errors', source: 'COMPRO 2025 p.11', publicationStatus: 'approved' }
      ],
      visuals: [
        {
          src: '/images/work/cases/atwf-dashboard.webp',
          alt: 'Warehouse management dashboard with stock mix per warehouse and an all-demand table',
          kind: 'dashboard',
          source: 'COMPRO 2025 p.10',
          publicationStatus: 'approved',
          candidateFile: 'docs/work/case-assets/atwf-dashboard.webp'
        },
        {
          src: '/images/work/cases/atwf-supply-orders.webp',
          alt: 'Warehouse supply-order table grouped by warehouse and hub',
          kind: 'dashboard',
          source: 'COMPRO 2025 p.11',
          publicationStatus: 'approved',
          candidateFile: 'docs/work/case-assets/atwf-supply-orders.webp'
        }
      ],
      publicationStatus: 'approved',
      contentStatus: 'partial',
      missingFields: ['client name', 'solution / PASTI scope', 'timeline', 'technologyStack', 'real year', 'metric methodology'],
      approvalNotes: [
        'Owner approved the case, its 30% / 70% metrics and the "Astro WHM" screenshots (2026-10-07).',
        'Client stays "A major enterprise" (source wording) until the owner confirms the name to show.',
        'Narrative describes approval workflows; the UI shows warehouse / supply-order management.'
      ],
      source: 'COMPRO 2025 p.10–11'
    }
  ]

  const publicCases = allCases.filter((c) => c.publicationStatus === 'approved')

  return { allCases, publicCases }
}

/** Active Featured Case on /work, shared by the case browser and the
 * Selected Work cards that link into it. */
export function useActiveCase() {
  const active = useState<string>('work-active-case', () => 'powerhours')

  // Make `id` the active case and scroll to it (Lenis when running, native
  // otherwise). Desktop: the case section (reel + dossier). Below desktop:
  // the dossier, since the swipe rail above already shows the chosen card.
  const openCase = (id: string) => {
    active.value = id
    const desktop = window.matchMedia(breakpointQuery.desktopUp).matches
    const reduce = window.matchMedia(reducedMotionQuery.reduce).matches
    const el = document.getElementById(desktop ? 'work-cases' : 'case-dossier')
    if (!el) return
    const offset = desktop ? -40 : -90
    const lenis = getLenisInstance()
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 })
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduce ? 'auto' : 'smooth' })
  }

  return { active, openCase }
}

/** Public-safe projections used by the UI. */
export const approvedVisuals = (c: FeaturedCase) => c.visuals.filter((v) => v.publicationStatus === 'approved')
export const approvedMetrics = (c: FeaturedCase) => (c.metrics ?? []).filter((m) => m.publicationStatus === 'approved')

/** Runs `fn` once the page can scroll: app.vue resets to the top on load and
 * the first-visit BrandIntro locks scrolling (Lenis stopped + html overflow
 * hidden) for ~3s. Returns a cancel function. Used by /work deep links. */
export function whenScrollable(fn: () => void) {
  const started = Date.now()
  const timer = setInterval(() => {
    const html = document.documentElement
    const locked = html.classList.contains('lenis-stopped') || html.style.overflow === 'hidden'
    if (locked && Date.now() - started < 8000) return
    clearInterval(timer)
    setTimeout(fn, 300)
  }, 150)
  return () => clearInterval(timer)
}

export type CreativeArt = 'communication' | 'campaign' | 'social' | 'video' | 'production' | 'brand'

export interface CreativeRelated {
  label: string
  to?: string
}

export interface CreativeService {
  index: string
  title: string
  /** COMPRO 2025 sentence, verbatim. */
  body: string
  /** Terms lifted from that same sentence — no additions. */
  keywords: string[]
  /** Related work (owner-approved 2026-10-07); empty when COMPRO has none. */
  related: CreativeRelated[]
  source: string
  /** INTERIM drawn illustration (CreativeCapArt) until real creative visuals
   * exist — deliberately not a project poster, so no project is implied to
   * be that service. */
  art: CreativeArt
}

export interface CreativeVisual {
  src: string
  label: string
}

/**
 * /creative page content — COMPRO 2025 rebuild (owner decisions 2026-10-07).
 *
 * - Hero heading kept (owner); intro + the six capability bodies are the
 *   COMPRO 2025 sentences (pp. 36–41) verbatim.
 * - Capability visuals are interim drawn illustrations (owner: "ilustrasi
 *   sementara"); project posters were removed from the service cards because
 *   they implied e.g. PowerHours was a video job.
 * - `work`: OCTO Mobile's performance-marketing strategy (COMPRO pp. 18–19,
 *   translated from Indonesian, simulated results excluded), the Pertamina
 *   campaign (existing Selected Work, not in COMPRO), UI/UX work from
 *   technology projects, and the BSI UI/UX testimonial — all owner-approved.
 * - `why`: Mission (p.27), the 2022 creative milestone (p.26) and the
 *   creative-relevant Standards (p.28).
 */
export function useCreative() {
  const eyebrow = 'Creative'
  const heading = 'Creative that gets business results.'
  const introBody =
    'We combine creativity, strategy, and execution to build brands that stand out, win attention, and earn trust.'

  const servicesEyebrow = 'What we make'
  const servicesHeading = 'Creative capabilities'

  const services: CreativeService[] = [
    {
      index: '01',
      title: 'Creative Communication',
      body: 'We combine creativity, strategy, and execution to build brands that stand out, win attention, and earn trust.',
      keywords: ['Creativity', 'Strategy', 'Execution'],
      related: [{ label: 'Pertamina — Energi Untuk Negeri', to: '/work#work-05' }],
      source: 'COMPRO 2025 p.36',
      art: 'communication'
    },
    {
      index: '02',
      title: 'Integrated Campaign Strategy',
      body: 'Development of 360° campaign strategies with unified messaging across offline and online channels, designed to maximize reach and impact.',
      keywords: ['360° campaigns', 'Unified messaging', 'Offline + online'],
      related: [
        { label: 'OCTO Mobile — CIMB Niaga', to: '#creative-work' },
        { label: 'Pertamina — Energi Untuk Negeri', to: '/work#work-05' }
      ],
      source: 'COMPRO 2025 p.37',
      art: 'campaign'
    },
    {
      index: '03',
      title: 'Social Media Playbooks & Management',
      body: 'Creation of tailored social media strategies, daily content management, trend-based execution, and continuous optimization to drive engagement.',
      keywords: ['Social strategy', 'Daily content', 'Trend-based', 'Optimization'],
      related: [],
      source: 'COMPRO 2025 p.38',
      art: 'social'
    },
    {
      index: '04',
      title: 'Vertical Video Development',
      body: 'Short-form video production for TikTok, Instagram Reels, and YouTube Shorts—leveraging fast edits, strong hooks, and trend integration to maximize organic performance.',
      keywords: ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'Strong hooks'],
      related: [],
      source: 'COMPRO 2025 p.39',
      art: 'video'
    },
    {
      index: '05',
      title: 'Production House Services',
      body: 'Full in-house production capabilities including commercial videos, testimonials, lifestyle and studio photography, motion graphics, and post-production editing.',
      keywords: ['Commercial videos', 'Photography', 'Motion graphics', 'Post-production'],
      related: [],
      source: 'COMPRO 2025 p.40',
      art: 'production'
    },
    {
      index: '06',
      title: 'Brand Identity & UI/UX Design',
      body: 'Development of logos, visual systems, brand guidelines, and user-centered design for websites and apps, ensuring a seamless and professional digital experience.',
      keywords: ['Logos', 'Visual systems', 'Brand guidelines', 'UI/UX'],
      related: [
        { label: 'IKEA Indonesia', to: '/work#work-01' },
        { label: 'JM-Click — Jasa Marga', to: '/work#work-02' },
        { label: 'PowerHours', to: '/work#case-powerhours' },
        { label: 'HDI Healthy Lifestyle', to: '/work#case-hdi' }
      ],
      source: 'COMPRO 2025 p.41',
      art: 'brand'
    }
  ]

  // Selected creative work.
  const { projects } = useSelectedWork()
  const byTitle = (t: string) => projects.find((p) => p.title === t)!
  const octo = byTitle('OCTO Mobile — CIMB Niaga')
  const pertamina = byTitle('Pertamina')
  const work = {
    feature: {
      title: 'OCTO Mobile — CIMB Niaga',
      category: 'Performance Marketing Strategy',
      image: octo.image,
      source: 'COMPRO 2025 pp.18–19',
      challenge: [
        'Digital banks in Indonesia still relied on high-interest promos ("money burning") to acquire users.',
        'The model was not sustainable — users churned once incentives stopped.',
        'Traditional products such as credit cards had stagnated for acquisition.'
      ],
      gamePlan: 'Digital Wallet Banking: Rekening Ponsel → OCTO Mobile → OctoPay — a digital-first ecosystem built on the account and the phone number.',
      funnel: [
        { stage: 'Awareness', text: 'Digital campaigns, influencers and merchant bundling.' },
        { stage: 'Interest', text: 'Educating the benefits of digital wallet banking over non-bank e-wallets.' },
        { stage: 'Conversion', text: 'Digital onboarding with e-KYC.' },
        { stage: 'Retention', text: 'A transaction-based loyalty program instead of interest promos.' }
      ],
      playbook: [
        'Account registration bundled so OctoPay activates automatically.',
        'PayLater cross-sold to savings and credit-card customers.',
        'A partnership ecosystem: transport cashback, online shopping, F&B.',
        'A transaction-based referral program, not balance-based.'
      ]
    },
    campaign: { title: pertamina.title, category: pertamina.category, description: pertamina.description, image: pertamina.image, to: '/work#work-05' },
    uiux: ['IKEA Indonesia', 'JM-Click — Jasa Marga', 'PowerHours', 'HDI Healthy Lifestyle'].map((t) => {
      const p = byTitle(t)
      return { title: p.title, category: p.category, image: p.image, to: t === 'PowerHours' ? '/work#case-powerhours' : t === 'HDI Healthy Lifestyle' ? '/work#case-hdi' : `/work#work-${p.index}` }
    }),
    testimonial: (() => {
      const t = useTestimonials().testimonials.find((x) => x.name === 'Yodi Izharivan')!
      return { name: t.name, role: t.role, quote: t.quote }
    })()
  }

  const company = useCompany()
  const why = {
    leadLabel: 'Our mission',
    statement: company.mission,
    standards: company.pickStandards('Innovation', 'Integrity', 'Security'),
    milestones: company.pickMilestones('2020', '2022', '2023')
  }

  // Studio wall: approved project visuals and UI screens (no stock imagery).
  const visuals: CreativeVisual[] = [
    { src: '/images/selected-work/pertamina.webp', label: 'Pertamina — Energi Untuk Negeri' },
    { src: '/images/selected-work/octo-mobile.webp', label: 'OCTO Mobile — CIMB Niaga' },
    { src: '/images/selected-work/ikea-indonesia.webp', label: 'IKEA Indonesia' },
    { src: '/images/selected-work/hdi-healthy-lifestyle.webp', label: 'HDI Healthy Lifestyle' },
    { src: '/images/selected-work/powerhours.webp', label: 'PowerHours' },
    { src: '/images/selected-work/jm-click.webp', label: 'JM-Click — Jasa Marga' },
    { src: '/images/insights/creative-and-brand.webp', label: 'Creative & Brand' },
    { src: '/images/insights/digital-product-ux.webp', label: 'Digital Product & UX' },
    { src: '/images/insights/ideas-that-move-business.webp', label: 'Ideas That Move Business' }
  ]

  return { eyebrow, heading, introBody, servicesEyebrow, servicesHeading, services, work, why, visuals }
}

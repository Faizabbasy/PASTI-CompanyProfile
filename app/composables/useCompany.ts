export interface CompanyStandard {
  name: 'Innovation' | 'Security' | 'Efficiency' | 'Integrity'
  body: string
}

export interface CompanyMilestone {
  year: string
  text: string
}

/**
 * Official company content from the COMPRO 2025 company profile — single
 * source for /about, /technology and /creative (2026-10-07).
 *
 * Owner decisions 2026-10-07:
 * - Brand name is "PASTI" (COMPRO p.2), not "PASTI People".
 * - "Over the past five years" (true in 2025) → "since 2020".
 * - Unbacked claims dropped: "across ten industries" (2023 milestone) and
 *   "expanding to global partnerships" (2024 milestone); "2024 – NOW" shown
 *   as "Since 2024".
 * - Excluded entirely: the Project Shareholder / RD Abdul Goni pages (pp.3–4),
 *   NPWP and AHU numbers.
 */
export function useCompany() {
  const facts = [
    { label: 'Company', value: 'PT Hidup Pasti Bahagia' },
    { label: 'Brand', value: 'PASTI' },
    { label: 'Established', value: '2020' },
    { label: 'Website', value: 'www.pastipeople.id' },
    { label: 'Email', value: 'klien@pastipeople.id' },
    { label: 'Office', value: 'Mutu Work – RS Fatmawati No. 39, Cilandak, South Jakarta 12430' }
  ]

  // "What We Stand For" (p.25), paragraph by paragraph.
  const story = [
    'PASTI, operating under PT Hidup Pasti Bahagia, was established in 2020 with a mission to merge technology and creativity into one unified service. We specialize in developing scalable systems, building powerful brand communications, and enabling business growth with measurable results.',
    'Since 2020, we have delivered more than 70 successful projects for 50+ clients, including state-owned enterprises, multinational corporations, and leading brands in finance, FMCG, and lifestyle sectors. Our one-roof delivery model ensures efficiency, consistency, and accountability at every stage of execution.',
    'With a foundation built on innovation, security, efficiency, and integrity, PASTI continues to evolve as a strategic partner for organizations seeking digital transformation. We are committed to empowering businesses with solutions that are agile, future-ready, and designed to create lasting impact.'
  ]

  const vision = 'To empower businesses with innovative, secure, and seamless digital solutions that accelerate impact.'
  const mission =
    'We are committed to delivering scalable systems, strategic creativity, and long-term digital support, tailored to real business growth. By merging technology expertise with creative excellence, we enable our clients to move faster, stay relevant, and achieve sustainable success.'

  // "Standards We Live By" (p.28).
  const standards: CompanyStandard[] = [
    { name: 'Innovation', body: 'We believe innovation is not optional but essential. Every solution we design is fueled by curiosity and shaped by courage—whether it is developing AI-driven platforms, crafting bold campaigns, or finding new ways to solve complex business challenges.' },
    { name: 'Security', body: 'Trust is our infrastructure. From system architecture to creative data handling, we prioritize security at every step. Our clients rely on us because we ensure that what we build is safe, compliant, and reliable for long-term use.' },
    { name: 'Efficiency', body: 'We streamline processes to make businesses faster, smarter, and more cost-effective. Efficiency for us means achieving maximum output with optimized resources, while ensuring quality never takes a back seat.' },
    { name: 'Integrity', body: 'Partnerships thrive on honesty and accountability. Integrity is reflected in how we communicate, how we deliver, and how we take responsibility. We stay transparent and human—because real trust comes from consistency.' }
  ]
  const pickStandards = (...names: CompanyStandard['name'][]) => names.map((n) => standards.find((s) => s.name === n)!)

  // "The Milestones" (p.26).
  const milestones: CompanyMilestone[] = [
    { year: '2020', text: 'Incorporation of PT Hidup Pasti Bahagia, with initial focus on technology.' },
    { year: '2021', text: 'First state-owned enterprise project delivered for Jasa Marga.' },
    { year: '2022', text: 'Expansion to creative marketing services and transformation roadmapping.' },
    { year: '2023', text: '50+ clients served, 70+ projects delivered.' },
    { year: 'Since 2024', text: 'AI-powered business systems.' }
  ]
  const pickMilestones = (...years: string[]) => years.map((y) => milestones.find((m) => m.year === y)!)

  // Leadership voice on /about (owner 2026-10-08: replaces the CEO
  // foreword). COMPRO 2025 "Operational Perspective", text verbatim — only
  // the missing dash in the first sentence added. Photo cropped from the
  // COMPRO portrait page (below the page's footer line).
  const founder = {
    name: 'Amelia N. Fauziah',
    role: 'Co-Founder & COO',
    photo: '/images/people/amelia-n-fauziah.webp',
    eyebrow: 'Operational perspective',
    meta: 'COO perspective',
    quote: 'Operational excellence for us is the bridge between bold ideas and real business impact.',
    foreword: [
      'At PASTI, execution is not just about delivering a project — it is about ensuring that every detail aligns with the client’s vision, objectives, and long-term success.',
      'As the Operational Director, my role is to transform strategies into measurable outcomes by ensuring seamless collaboration across technology, creative, and growth teams. We emphasize agility, scalability, and precision in all our projects, supported by SLA-driven processes and transparent performance tracking.',
      'Operational excellence for us is the bridge between bold ideas and real business impact. With more than 70 projects successfully executed across industries, PASTI has proven that reliable systems, disciplined execution, and collaborative teams deliver results that last.'
    ]
  }

  const sectors = ['State-owned enterprises', 'Public sector', 'Finance', 'FMCG', 'Lifestyle']

  return { facts, story, vision, mission, standards, pickStandards, milestones, pickMilestones, founder, sectors }
}

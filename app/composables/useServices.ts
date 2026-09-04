export interface Service {
  index: string
  title: string
  body: string
  cta: string
  /** Which pillar detail page ("/technology" or "/creative") this row links to. */
  category: 'technology' | 'creative'
}

/**
 * Homepage service rows, per .docs/PASTI_Cuberto_Template_Content_Mapping.docx
 * section 04 — SERVICE CARDS. Titles were truncated in the source doc to fit a
 * character-count layout guide (e.g. "Creative Commu", "Cybersecurity & Comp");
 * the full, contextually-correct titles are used here per the client's
 * instruction that meaning and readability outrank character parity.
 *
 * `category` maps each row to the pillar detail page it belongs to per
 * section 10's Technology/Creative service split (all five rows here used
 * to link to /technology regardless of category — a bug, since Creative
 * Communication is a Creative-pillar service). /creative doesn't exist yet,
 * so that row's link 404s until that page is built, same as /technology
 * 404'd before this task.
 */
export function useServices() {
  const services: Service[] = [
    {
      index: '01',
      title: 'Technology Development',
      body: 'We build secure, scalable digital systems aligned with real business needs.',
      cta: 'Explore',
      category: 'technology'
    },
    {
      index: '02',
      title: 'Enterprise Platforms',
      body: 'We build enterprise platforms that connect people, processes and data.',
      cta: 'Explore',
      category: 'technology'
    },
    {
      index: '03',
      title: 'Mobile App Development',
      body: 'We design and develop mobile products and MVPs built for launch, validation and growth.',
      cta: 'Explore',
      category: 'technology'
    },
    {
      index: '04',
      title: 'Creative Communication',
      body: 'We turn strategy into creative communication that builds attention, trust and brand impact.',
      cta: 'Explore',
      category: 'creative'
    },
    {
      index: '05',
      title: 'Cybersecurity & Compliance',
      body: 'We help businesses build secure digital foundations through architecture, protection and compliance.',
      cta: 'Explore',
      category: 'technology'
    }
  ]

  return { services }
}

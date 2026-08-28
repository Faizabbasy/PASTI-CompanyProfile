export interface Service {
  index: string
  title: string
  body: string
  cta: string
}

/**
 * Homepage service rows, per .docs/PASTI_Cuberto_Template_Content_Mapping.docx
 * section 04 — SERVICE CARDS. Titles were truncated in the source doc to fit a
 * character-count layout guide (e.g. "Creative Commu", "Cybersecurity & Comp");
 * the full, contextually-correct titles are used here per the client's
 * instruction that meaning and readability outrank character parity.
 */
export function useServices() {
  const services: Service[] = [
    {
      index: '01',
      title: 'Technology Development',
      body: 'We build secure, scalable digital systems aligned with real business needs.',
      cta: 'Explore'
    },
    {
      index: '02',
      title: 'Enterprise Platforms',
      body: 'We build enterprise platforms that connect people, processes and data.',
      cta: 'Explore'
    },
    {
      index: '03',
      title: 'Mobile App Development',
      body: 'We design and develop mobile products and MVPs built for launch, validation and growth.',
      cta: 'Explore'
    },
    {
      index: '04',
      title: 'Creative Communication',
      body: 'We turn strategy into creative communication that builds attention, trust and brand impact.',
      cta: 'Explore'
    },
    {
      index: '05',
      title: 'Cybersecurity & Compliance',
      body: 'We help businesses build secure digital foundations through architecture, protection and compliance.',
      cta: 'Explore'
    }
  ]

  return { services }
}

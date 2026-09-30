export interface TechnologyService {
  index: string
  title: string
  body: string
  /** Visual shown with the row (cursor preview on desktop, inline on mobile).
   * Reuses existing approved project/insight artwork whose subject matches
   * the service — illustrative, not a claim that this project is that service. */
  image: string
}

/**
 * /technology page content. The six service names and their Technology-
 * pillar grouping come from .docs/PASTI_Cuberto_Template_Content_Mapping.docx
 * section 10 (Service Expansion / Content Model) and section 16 (Placement
 * Rules: "the full PASTI service list belongs on Technology and Creative
 * detail pages; homepage cards are summaries"). The doc supplies only the
 * six service names — no body copy — so the descriptions below are a first
 * draft written for this page, not sourced from the doc; replace with the
 * client's own copy once supplied. Layout follows the numbered-list-with-
 * rules pattern already used for About's "Best Services" section.
 */
export function useTechnology() {
  const eyebrow = 'Technology'
  const heading = 'Technology built to move business forward.'
  const introBody =
    'From custom platforms to AI-driven systems, we build the technology that runs your business — engineered for scale, security, and real-world use from day one.'

  const servicesEyebrow = 'What we build'
  const servicesHeading = 'Technology services'

  const services: TechnologyService[] = [
    {
      index: '01',
      title: 'Technology Development',
      body: 'Modern web and mobile products built on solid architecture, from first line of code to production-ready release.',
      image: '/images/selected-work/ikea-indonesia.png'
    },
    {
      index: '02',
      title: 'Custom Built AI Solutions',
      body: 'Bespoke AI systems designed around your workflow, from internal automation to customer-facing intelligent features.',
      image: '/images/insights/ai-digital-transformation.png'
    },
    {
      index: '03',
      title: 'Enterprise Platforms',
      body: 'Scalable systems built to handle real operational load, integrated with the tools your business already runs on.',
      image: '/images/selected-work/jm-click.png'
    },
    {
      index: '04',
      title: 'Mobile App Development & MVP',
      body: 'From validated idea to shipped product, built lean and fast without cutting corners on quality.',
      image: '/images/selected-work/powerhours.png'
    },
    {
      index: '05',
      title: 'Cybersecurity & Compliance Architecture',
      body: 'Security built into the foundation, not bolted on after — protecting your systems and meeting compliance from day one.',
      image: '/images/insights/cybersecurity-compliance.png'
    },
    {
      index: '06',
      title: 'System Maintenance & SLA Support',
      body: 'Ongoing care and guaranteed response times, so what we build keeps running long after launch.',
      image: '/images/insights/enterprise-technology.png'
    }
  ]

  return { eyebrow, heading, introBody, servicesEyebrow, servicesHeading, services }
}

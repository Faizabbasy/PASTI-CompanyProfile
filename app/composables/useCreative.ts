export interface CreativeService {
  index: string
  title: string
  body: string
  /** Illustrative visual (existing approved PASTI artwork) shown with the
   * service — not a claim that this artwork is that service's case study. */
  image: string
}

export interface CreativeVisual {
  src: string
  label: string
}

/**
 * /creative page content. The six service names and their Creative-pillar
 * grouping come from .docs/PASTI_Cuberto_Template_Content_Mapping.docx
 * section 10 (Service Expansion / Content Model) and section 16 (Placement
 * Rules: "the full PASTI service list belongs on Technology and Creative
 * detail pages; homepage cards are summaries"). The doc supplies only the
 * six service names — no body copy — so the descriptions below are a first
 * draft written for this page, not sourced from the doc; replace with the
 * client's own copy once supplied. Layout mirrors /technology (same
 * numbered-list-with-rules pattern used for About's "Best Services").
 */
export function useCreative() {
  const eyebrow = 'Creative'
  const heading = 'Creative that gets business results.'
  const introBody =
    'From brand identity to campaign execution, we build creative work that does more than look good — it moves people, and moves the numbers that matter to your business.'

  const servicesEyebrow = 'What we make'
  const servicesHeading = 'Creative services'

  const services: CreativeService[] = [
    {
      index: '01',
      title: 'Creative Communication',
      body: 'Strategy turned into communication that builds attention, trust, and lasting brand impact.',
      image: '/images/insights/creative-and-brand.webp'
    },
    {
      index: '02',
      title: 'Integrated Campaign Strategy',
      body: 'Campaigns planned across channels from a single strategy, so every touchpoint pulls in the same direction.',
      image: '/images/selected-work/pertamina.webp'
    },
    {
      index: '03',
      title: 'Social Media Playbooks & Management',
      body: 'Content systems and day-to-day management built to keep your brand consistent and active where your audience is.',
      image: '/images/insights/ideas-that-move-business.webp'
    },
    {
      index: '04',
      title: 'Vertical Video Development',
      body: 'Short-form video built for how people actually watch today, from concept to a finished, platform-ready cut.',
      image: '/images/selected-work/powerhours.webp'
    },
    {
      index: '05',
      title: 'Production House Services',
      body: 'Full production support — shoot, edit, and post — for campaigns and content that need to look and feel premium.',
      image: '/images/selected-work/octo-mobile.webp'
    },
    {
      index: '06',
      title: 'Brand Identity & UI/UX Design',
      body: 'Visual identity and product design built together, so your brand feels the same everywhere someone meets it.',
      image: '/images/insights/digital-product-ux.webp'
    }
  ]

  // Studio wall: existing PASTI-made visuals (project posters + insight
  // artwork). Labels are the project / article names already used on the site.
  const visuals: CreativeVisual[] = [
    { src: '/images/selected-work/pertamina.webp', label: 'Pertamina — Energi Untuk Negeri' },
    { src: '/images/insights/creative-and-brand.webp', label: 'Creative & Brand' },
    { src: '/images/selected-work/octo-mobile.webp', label: 'OCTO Mobile — CIMB Niaga' },
    { src: '/images/insights/ideas-that-move-business.webp', label: 'Ideas That Move Business' },
    { src: '/images/selected-work/hdi-healthy-lifestyle.webp', label: 'HDI Healthy Lifestyle' },
    { src: '/images/insights/digital-product-ux.webp', label: 'Digital Product & UX' },
    { src: '/images/selected-work/powerhours.webp', label: 'PowerHours' },
    { src: '/images/selected-work/ikea-indonesia.webp', label: 'IKEA Indonesia' },
    { src: '/images/insights/future-of-business.webp', label: 'The Future of Business' }
  ]

  return { eyebrow, heading, introBody, servicesEyebrow, servicesHeading, services, visuals }
}

export interface CreativeService {
  index: string
  title: string
  body: string
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
      body: 'Strategy turned into communication that builds attention, trust, and lasting brand impact.'
    },
    {
      index: '02',
      title: 'Integrated Campaign Strategy',
      body: 'Campaigns planned across channels from a single strategy, so every touchpoint pulls in the same direction.'
    },
    {
      index: '03',
      title: 'Social Media Playbooks & Management',
      body: 'Content systems and day-to-day management built to keep your brand consistent and active where your audience is.'
    },
    {
      index: '04',
      title: 'Vertical Video Development',
      body: 'Short-form video built for how people actually watch today, from concept to a finished, platform-ready cut.'
    },
    {
      index: '05',
      title: 'Production House Services',
      body: 'Full production support — shoot, edit, and post — for campaigns and content that need to look and feel premium.'
    },
    {
      index: '06',
      title: 'Brand Identity & UI/UX Design',
      body: 'Visual identity and product design built together, so your brand feels the same everywhere someone meets it.'
    }
  ]

  return { eyebrow, heading, introBody, servicesEyebrow, servicesHeading, services }
}

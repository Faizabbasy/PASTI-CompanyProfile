export interface WhoWeArePortrait {
  src: string
  alt: string
  /** Small caption tag beside the frame. */
  tag: string
}

export interface WhoWeAreStat {
  value: number
  suffix: string
  label: string
}

/**
 * Content for the owner-directed "Who We Are" section + Trusted Partner card
 * (owner decision 2026-09-30 — see WhoWeAre.vue header). Heading/body and the
 * Trusted Partner copy come from the owner's reference (legacy site, see
 * docs/legacy/PASTIPEOPLE_EXISTING_CONTENT_SOURCE.md §Trusted Partner) with
 * typo fixes only. The 200+/130+ figures were confirmed verified by the owner.
 *
 * Portraits are PLACEHOLDERS — drop real photos into public/images/people/
 * and update `src`/`alt` here.
 */
export function useWhoWeAre() {
  const eyebrow = 'Who We Are'
  // `highlight` is rendered on the PASTI Yellow marker bar.
  const heading = { before: 'Trusted', highlight: '100%', after: 'by many people, gradually.' }
  const body =
    'Our commitment to reliable IT solutions and strategic digital marketing has earned the trust of businesses across Indonesia.'

  const facts = [
    { label: 'Company', value: 'PT Hidup Pasti Bahagia' },
    { label: 'Positioning', value: 'Technology × Creative Execution Partner' },
    { label: 'Essence', value: 'Certainty Through Execution' }
  ]

  const portraits: WhoWeArePortrait[] = [
    { src: '/images/people/placeholder-1.svg', alt: 'PASTI team portrait (placeholder)', tag: 'People · 01' },
    { src: '/images/people/placeholder-2.svg', alt: 'PASTI team portrait (placeholder)', tag: 'People · 02' },
    { src: '/images/people/placeholder-3.svg', alt: 'PASTI team portrait (placeholder)', tag: 'People · 03' }
  ]

  const clientStat: WhoWeAreStat = { value: 130, suffix: '+', label: 'Happy clients' }

  const partner = {
    kicker: "Let's Development",
    panelTitle: 'Work With Us',
    panelBody: 'Together we build your product.',
    portrait: { src: '/images/people/placeholder-4.svg', alt: 'PASTI team portrait (placeholder)' },
    title: 'Trusted Partner',
    body: 'for Technology and Creative Marketing, delivering impactful growth.',
    stats: [
      { value: 200, suffix: '+', label: 'Completed Projects' },
      { value: 130, suffix: '+', label: 'Clients Delivered' }
    ] as WhoWeAreStat[]
  }

  const cta = { label: "Let's Work" }

  return { eyebrow, heading, body, facts, portraits, clientStat, partner, cta }
}

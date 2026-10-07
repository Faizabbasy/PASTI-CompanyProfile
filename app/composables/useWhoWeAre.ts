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
 * typo fixes only.
 *
 * COMPRO 2025 enrichment (owner decision 2026-10-07): proof figures follow the
 * company profile — 70+ projects / 50+ clients (p.25–26), replacing the
 * earlier 200+/130+. Established 2020 (p.2) and the client-sector sentence
 * (p.25) come from the same document; no other figures are added.
 *
 * Portraits (who-01..03) and the Trusted Partner cutout (work-with-us) are
 * cropped from the owner's reference images (2026-09-30).
 */
export function useWhoWeAre() {
  const eyebrow = 'Who We Are'
  // `highlight` is rendered on the PASTI Yellow marker bar.
  const heading = { before: 'Trusted', highlight: '100%', after: 'by many people, gradually.' }
  const body =
    'Our commitment to reliable IT solutions and strategic digital marketing has earned the trust of businesses across Indonesia — from state-owned enterprises and multinational corporations to leading brands in finance, FMCG and lifestyle.'

  const facts = [
    { label: 'Company · Est. 2020', value: 'PT Hidup Pasti Bahagia' },
    { label: 'Positioning', value: 'Technology × Creative Execution Partner' },
    { label: 'Essence', value: 'Certainty Through Execution' }
  ]

  const portraits: WhoWeArePortrait[] = [
    { src: '/images/people/who-01.webp', alt: 'Smiling PASTI client holding a tablet and coffee', tag: 'Client · 01' },
    { src: '/images/people/who-02.webp', alt: 'Smiling PASTI client in a yellow jacket', tag: 'Client · 02' },
    { src: '/images/people/who-03.webp', alt: 'Happy PASTI client making an OK sign', tag: 'Client · 03' }
  ]

  const clientStat: WhoWeAreStat = { value: 50, suffix: '+', label: 'Happy clients' }

  const partner = {
    kicker: "Let's Development",
    panelTitle: 'Work With Us',
    panelBody: 'Together we build your product.',
    portrait: { src: '/images/people/work-with-us.webp', alt: 'Smiling woman holding a laptop' },
    title: 'Trusted Partner',
    body: 'for Technology and Creative Marketing, delivering impactful growth.',
    stats: [
      { value: 70, suffix: '+', label: 'Completed Projects' },
      { value: 50, suffix: '+', label: 'Clients Delivered' }
    ] as WhoWeAreStat[]
  }

  const cta = { label: "Let's Work" }

  return { eyebrow, heading, body, facts, portraits, clientStat, partner, cta }
}

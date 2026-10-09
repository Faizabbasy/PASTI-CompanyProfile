// MILESTONE 4C — Selected Work, total rework per
// docs/rework-v2/04-homepage-spec.md §3 ("Pinned Project Exchange" / "A
// Curated Sequence of Execution Proof, Not Ten Slides With Ten Effects").
// Schema expanded from the previous 6-field {index,title,image} shape to
// support the frozen 10-project baseline, the section's own rhythm
// vocabulary, and the content-status honesty pattern established in
// Milestone 3 (see Testimonials/Insights — never let "we have an image for
// it" collapse into "verified", and never invent client claims/metrics).
//
// Content model (owner decision, 2026-09-30): the 6 real projects only.
// The 4 Lorem-ipsum `placeholder` slots that padded the list to the 10-project
// baseline were removed — they reused images 01/02/03/05, so the gallery
// showed the same visual twice. Categories/descriptions are paraphrased from
// each project's own promo image (public/images/selected-work/), no figures
// or claims beyond what the image states. Status stays `existing-unverified`
//
// COMPRO 2025 enrichment (owner decision 2026-10-07): descriptions add each
// project's scope from the company profile (IKEA p.12, JM-Click p.14,
// PowerHours p.20–21, HDI p.21). No COMPRO
// figures are used (the NPS/"Delivered 100%" lines and OCTO's simulated
// numbers stay off the homepage). Slot 05 stays the Pertamina campaign —
// Universitas Pertamina is a different organization and is listed as a
// client only (useClients, /work case file), per owner 2026-10-07.
// until the §11 verification task. Add a project here only with its own image.

export type ProjectStatus = 'verified' | 'existing-unverified' | 'placeholder'

export type ProjectTreatment =
  | 'standard'
  | 'media-dominant'
  | 'typography-dominant'
  | 'full-bleed'
  | 'accelerated'
  | 'slower-showcase'
  | 'closing'

export interface SelectedWorkProject {
  index: string
  title: string
  category: string
  description: string
  image: string
  /** Landscape 16:9 version (owner, 2026-10-09) — the homepage hero
   * gallery card. `image` stays the portrait poster used elsewhere. */
  landscape: string
  status: ProjectStatus
  /** Rhythm Vocabulary assignment (04-homepage-spec.md §3) — content-driven,
   * not arbitrary-by-index. Placeholder entries default to 'standard' per
   * the milestone instruction ("if content is still placeholder, default
   * to Standard"). */
  treatment: ProjectTreatment
}

export function useSelectedWork() {
  const projects: SelectedWorkProject[] = [
    {
      index: '01',
      title: 'IKEA Indonesia',
      category: 'Omnichannel E-Commerce',
      description: 'An interactive web and mobile shopping experience connecting inspiration, products and people — from shop-by-room browsing to a seamless checkout journey. Flow, UI/UX and development by PASTI.',
      image: '/images/selected-work/ikea-indonesia.webp',
      landscape: '/images/selected-work/landscape/ikea-indonesia.webp',
      status: 'existing-unverified',
      // Opener gets its own pacing per spec (04-homepage-spec.md §3).
      treatment: 'slower-showcase'
    },
    {
      index: '02',
      title: 'JM-Click — Jasa Marga',
      category: 'Enterprise Platform',
      description: 'An integrated dashboard and mobile app digitalizing operations across Jasa Marga Group — real-time traffic, toll transactions, maintenance and incidents in one place. Flow, UI/UX and development by PASTI.',
      image: '/images/selected-work/jm-click.webp',
      landscape: '/images/selected-work/landscape/jm-click.webp',
      status: 'existing-unverified',
      treatment: 'standard'
    },
    {
      index: '03',
      title: 'PowerHours',
      category: 'Fitness & Wellness App',
      description: 'A fitness companion with video workouts from certified coaches, personalized training schedules, progress tracking and community leaderboards — built in Flutter for iOS and Android.',
      image: '/images/selected-work/powerhours.webp',
      landscape: '/images/selected-work/landscape/powerhours.webp',
      status: 'existing-unverified',
      // Pattern break roughly mid-sequence — media-dominant widens the visual proof.
      treatment: 'media-dominant'
    },
    {
      index: '04',
      title: 'HDI Healthy Lifestyle',
      category: 'Employee Wellness Platform',
      description: 'An employee wellness app for PT Harmoni Dinamik Indonesia that makes healthy habits engaging — activity tracking, self-assessments, challenges and personalized daily reminders.',
      image: '/images/selected-work/hdi-healthy-lifestyle.webp',
      landscape: '/images/selected-work/landscape/hdi-healthy-lifestyle.webp',
      status: 'existing-unverified',
      treatment: 'standard'
    },
    {
      index: '05',
      title: 'Pertamina',
      category: 'Corporate Campaign',
      description: 'The “Energi Untuk Negeri” campaign — a digital presence connecting Pertamina with communities across Indonesia through stories of energy, innovation and sustainability.',
      image: '/images/selected-work/pertamina.webp',
      landscape: '/images/selected-work/landscape/pertamina.webp',
      status: 'existing-unverified',
      treatment: 'accelerated'
    },
    {
      index: '06',
      title: 'OCTO Mobile — CIMB Niaga',
      category: 'Mobile Banking',
      description: 'A digital banking experience for CIMB Niaga’s OCTO Mobile — seamless transactions, smarter money management and better everyday banking.',
      image: '/images/selected-work/octo-mobile.webp',
      landscape: '/images/selected-work/landscape/octo-mobile.webp',
      status: 'existing-unverified',
      // Closer gets its own pacing per spec, distinct from mid-sequence Standard.
      treatment: 'closing'
    }
  ]

  return { projects }
}

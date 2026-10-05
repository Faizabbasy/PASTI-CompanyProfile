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
      description: 'An interactive web and mobile shopping experience connecting inspiration, products and people — from shop-by-room browsing to a seamless checkout journey.',
      image: '/images/selected-work/ikea-indonesia.webp',
      status: 'existing-unverified',
      // Opener gets its own pacing per spec (04-homepage-spec.md §3).
      treatment: 'slower-showcase'
    },
    {
      index: '02',
      title: 'JM-Click — Jasa Marga',
      category: 'Enterprise Platform',
      description: 'An integrated dashboard and mobile app digitalizing operations across Jasa Marga Group — real-time traffic, toll transactions, maintenance and incidents in one place.',
      image: '/images/selected-work/jm-click.webp',
      status: 'existing-unverified',
      treatment: 'standard'
    },
    {
      index: '03',
      title: 'PowerHours',
      category: 'Fitness & Wellness App',
      description: 'A digital wellness companion with personalized workout plans, nutrition tracking and progress insights that help people move better and live healthier.',
      image: '/images/selected-work/powerhours.webp',
      status: 'existing-unverified',
      // Pattern break roughly mid-sequence — media-dominant widens the visual proof.
      treatment: 'media-dominant'
    },
    {
      index: '04',
      title: 'HDI Healthy Lifestyle',
      category: 'Employee Wellness Platform',
      description: 'An employee wellness app that makes healthy habits engaging — activity tracking, step challenges, reward points and personal insights.',
      image: '/images/selected-work/hdi-healthy-lifestyle.webp',
      status: 'existing-unverified',
      treatment: 'standard'
    },
    {
      index: '05',
      title: 'Pertamina',
      category: 'Corporate Campaign',
      description: 'The “Energi Untuk Negeri” campaign — a digital presence connecting Pertamina with communities across Indonesia through stories of energy, innovation and sustainability.',
      image: '/images/selected-work/pertamina.webp',
      status: 'existing-unverified',
      treatment: 'accelerated'
    },
    {
      index: '06',
      title: 'OCTO Mobile — CIMB Niaga',
      category: 'Mobile Banking',
      description: 'A digital banking experience for CIMB Niaga’s OCTO Mobile — seamless transactions, smarter money management and better everyday banking.',
      image: '/images/selected-work/octo-mobile.webp',
      status: 'existing-unverified',
      // Closer gets its own pacing per spec, distinct from mid-sequence Standard.
      treatment: 'closing'
    }
  ]

  return { projects }
}

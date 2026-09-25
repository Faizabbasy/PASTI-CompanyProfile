// MILESTONE 4C — Selected Work, total rework per
// docs/rework-v2/04-homepage-spec.md §3 ("Pinned Project Exchange" / "A
// Curated Sequence of Execution Proof, Not Ten Slides With Ten Effects").
// Schema expanded from the previous 6-field {index,title,image} shape to
// support the frozen 10-project baseline, the section's own rhythm
// vocabulary, and the content-status honesty pattern established in
// Milestone 3 (see Testimonials/Insights — never let "we have an image for
// it" collapse into "verified", and never invent client claims/metrics).
//
// Content model (per user decision, 2026-09-25): the previous 6 real
// projects (title + image, no homepage-level brief/description copy) are
// kept exactly as they were — status `existing-unverified`, since no
// description copy has ever been through the §11 verification task at the
// homepage level. 4 new slots are added as explicit `placeholder` entries
// (Lorem ipsum copy) to reach the frozen 10-project baseline, rather than
// merging in `/work`'s separate 3-project dataset — that page's entries
// carry different titles/clients for the same images (a pre-existing,
// unresolved content inconsistency), and blending the two here would
// create a new, unvalidated inconsistency rather than resolve one.

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
      category: 'E-Commerce Platform',
      description: 'A digital experience connecting inspiration, products, and people across IKEA Indonesia’s retail ecosystem.',
      image: '/images/selected-work/ikea-indonesia.png',
      status: 'existing-unverified',
      // Opener gets its own pacing per spec ("opener (01) and closer (10)
      // each get their own pacing behavior distinct from mid-sequence
      // Standard") — Slower Showcase gives the first project more dwell to
      // establish the section's own rhythm before Standard takes over.
      treatment: 'slower-showcase'
    },
    {
      index: '02',
      title: 'JM-Click — Jasa Marga',
      category: 'Enterprise Platform',
      description: 'An integrated operational platform for Jasa Marga’s toll-road network, unifying traffic, transaction, and maintenance data.',
      image: '/images/selected-work/jm-click.png',
      status: 'existing-unverified',
      treatment: 'standard'
    },
    {
      index: '03',
      title: 'PowerHours',
      category: 'Productivity Platform',
      description: 'A time and productivity tracking product built for distributed teams.',
      image: '/images/selected-work/powerhours.png',
      status: 'existing-unverified',
      // First of the 2 strong pattern-break moments — media-dominant widens
      // the visual proof, breaking the Standard rhythm roughly a third of
      // the way through the sequence.
      treatment: 'media-dominant'
    },
    {
      index: '04',
      title: 'HDI Healthy Lifestyle',
      category: 'Wellness Platform',
      description: 'A digital wellness platform connecting members to healthy-living programs and services.',
      image: '/images/selected-work/hdi-healthy-lifestyle.png',
      status: 'existing-unverified',
      treatment: 'standard'
    },
    {
      index: '05',
      title: 'Pertamina',
      category: 'Corporate Campaign',
      description: 'A digital campaign presence for Pertamina’s “Energi Untuk Negeri” initiative.',
      image: '/images/selected-work/pertamina.png',
      status: 'existing-unverified',
      // Subtle pacing variation, roughly mid-sequence.
      treatment: 'accelerated'
    },
    {
      index: '06',
      title: 'OCTO Mobile — CIMB Niaga',
      category: 'Mobile Banking',
      description: 'A mobile banking experience for CIMB Niaga’s OCTO platform, built for everyday financial tasks.',
      image: '/images/selected-work/octo-mobile.png',
      status: 'existing-unverified',
      // Second strong pattern-break — typography-dominant narrows the
      // media, widens the type zone.
      treatment: 'typography-dominant'
    },
    {
      index: '07',
      title: 'Lorem ipsum dolor sit amet',
      category: 'Lorem ipsum',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
      image: '/images/selected-work/ikea-indonesia.png',
      status: 'placeholder',
      treatment: 'standard'
    },
    {
      index: '08',
      title: 'Lorem ipsum dolor sit amet',
      category: 'Lorem ipsum',
      description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.',
      image: '/images/selected-work/jm-click.png',
      status: 'placeholder',
      treatment: 'standard'
    },
    {
      index: '09',
      title: 'Lorem ipsum dolor sit amet',
      category: 'Lorem ipsum',
      description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      image: '/images/selected-work/powerhours.png',
      status: 'placeholder',
      treatment: 'standard'
    },
    {
      index: '10',
      title: 'Lorem ipsum dolor sit amet',
      category: 'Lorem ipsum',
      description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.',
      image: '/images/selected-work/pertamina.png',
      status: 'placeholder',
      // Closer gets its own pacing per spec, distinct from mid-sequence Standard.
      treatment: 'closing'
    }
  ]

  return { projects }
}

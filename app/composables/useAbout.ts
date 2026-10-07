export interface AboutPillar {
  index: string
  name: string
  meaning: string
  visual: string
}

/**
 * /about content (owner decision 2026-10-01): the old page quoted placeholder
 * WordPress-template copy ("Live out your life.", one repeated filler line for
 * six services, "2M+ Get Awards" / "Cup of Coffee" stats). It is replaced by
 * the official brand foundation from docs/rework-v2/00-brand-guide.md
 * (§01 Brand Core, §02 Brand Pillars, §03 Personality) plus the company intro
 * from the live site. Proof numbers are the COMPRO 2025 70+ / 50+ shared
 * with the homepage (useWhoWeAre) — nothing new is claimed here.
 */
export function useAbout() {
  const eyebrow = 'About PASTI'
  const promise = 'We turn complexity into certainty.'
  const essence = 'Certainty Through Execution'
  const positioning = 'Technology × Creative Execution Partner'
  const companyName = 'PT Hidup Pasti Bahagia'
  const brandName = 'PASTI'

  // COMPRO 2025 rebuild (2026-10-07): company story, facts, vision/mission,
  // standards, milestones and the founder come from useCompany (COMPRO).
  // The brand-guide pillars stay as "How we work"; the brand-guide
  // personality block (is / is not, spectrum) was dropped from the public
  // page as an internal guideline.
  const company = useCompany()
  const introHeading = 'Our DNA'
  const introBody = company.story[0]!
  const storyMore = company.story.slice(1)

  // Brand guide §01 — what PASTI does, in order.
  const method = ['Understands the problem', 'Structures it', 'Builds the solution', 'Delivers it', 'Supports what comes next']
  const coreEmotion = ['Confidence', 'Momentum', 'Certainty']

  const pillars: AboutPillar[] = [
    { index: '01', name: 'Certainty', meaning: 'Reduce ambiguity through clarity, structure, and predictable execution.', visual: 'Strong hierarchy, clean alignment, decisive states.' },
    { index: '02', name: 'Precision', meaning: 'Operate with engineering discipline and attention to detail.', visual: 'Grid, spacing, exact alignment, controlled motion.' },
    { index: '03', name: 'Momentum', meaning: 'Move fast with control rather than rushing.', visual: 'Directional transitions, progress cues, responsive interaction.' },
    { index: '04', name: 'Practicality', meaning: 'Technology and creative work must be understandable and useful.', visual: 'Clarity before decoration; content remains usable.' },
    { index: '05', name: 'Impact', meaning: 'Judge work by what changes for the business or user.', visual: 'Real proof, projects, outcomes, measurable value.' }
  ]

  const { partner } = useWhoWeAre()
  const stats = partner.stats

  return {
    eyebrow,
    promise,
    essence,
    positioning,
    companyName,
    brandName,
    introHeading,
    introBody,
    method,
    coreEmotion,
    pillars,
    stats,
    storyMore,
    company
  }
}

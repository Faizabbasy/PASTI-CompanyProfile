export interface AboutPillar {
  index: string
  name: string
  meaning: string
  visual: string
}

export interface AboutSpectrum {
  a: string
  b: string
  /** Bias toward pole A, 0–10 (brand guide §03 dots). */
  bias: number
}

/**
 * /about content (owner decision 2026-10-01): the old page quoted placeholder
 * WordPress-template copy ("Live out your life.", one repeated filler line for
 * six services, "2M+ Get Awards" / "Cup of Coffee" stats). It is replaced by
 * the official brand foundation from docs/rework-v2/00-brand-guide.md
 * (§01 Brand Core, §02 Brand Pillars, §03 Personality) plus the company intro
 * from the live site. Proof numbers are the owner-verified 200+ / 130+ shared
 * with the homepage (useWhoWeAre) — nothing new is claimed here.
 */
export function useAbout() {
  const eyebrow = 'About PASTI'
  const promise = 'We turn complexity into certainty.'
  const essence = 'Certainty Through Execution'
  const positioning = 'Technology × Creative Execution Partner'
  const companyName = 'PT Hidup Pasti Bahagia'
  const brandName = 'PASTI People'

  const introHeading = 'Unlocking the Power of Technology and Creativity'
  const introBody =
    'At PT Hidup Pasti Bahagia, we are dedicated to providing you with exceptional services that cater to your business needs. With our expertise and commitment to excellence, we deliver efficient IT solutions and impactful digital marketing, ensuring rapid and effective results for your business.'

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

  const personalityIs = ['Certain', 'Precise', 'Confident', 'Agile', 'Modern', 'Practical', 'Impact-driven']
  const personalityIsNot = ['Chaotic', 'Gimmicky', 'Childish', 'Overly futuristic', 'Pretentious', 'Template-driven', 'Overly corporate', 'Hesitant']
  const spectrum: AboutSpectrum[] = [
    { a: 'Expert', b: 'Approachable', bias: 7 },
    { a: 'Fast', b: 'Deliberate', bias: 8 },
    { a: 'Clean', b: 'Decorative', bias: 9 },
    { a: 'Direct', b: 'Expressive', bias: 7 },
    { a: 'Modern', b: 'Traditional', bias: 8 }
  ]

  // Owner-verified figures, shared with the homepage Trusted Partner card.
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
    personalityIs,
    personalityIsNot,
    spectrum,
    stats
  }
}

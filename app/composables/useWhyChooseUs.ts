export interface DeliveryLane {
  /** Step label — PASTI's own working method (useAbout().method). */
  label: string
  /** Week the step starts (0-based, fractional allowed). */
  start: number
  /** Length in weeks. */
  length: number
  /** Disciplines staffed on the step: T = Technology, C = Creative. */
  roles: Array<'T' | 'C'>
  /** Continuous step: shows "Ongoing" instead of a finished "Done". */
  ongoing?: boolean
}

/**
 * Content for the owner-directed "Why Choose Us" section (2026-10-01, see
 * WhyChooseUs.vue header). Heading/body come from the legacy site's Why
 * Choose Us block (docs/legacy/PASTIPEOPLE_EXISTING_CONTENT_SOURCE.md §Why
 * Choose Us; same sentence in useAbout.ts), typo fixed. The reasons are the
 * four "Standards We Live By" from COMPRO 2025 p.28 (owner decision
 * 2026-10-07), labels only — they replaced the legacy "existing messaging"
 * bullets. They sit beside the brand-guide pillars, not in place of them. Timeline lanes reuse the
 * brand method steps from useAbout() — an illustrative sprint, not a client
 * project and not a delivery-time claim.
 */
export function useWhyChooseUs() {
  const eyebrow = 'Why Choose Us'
  // `highlight` sits on the PASTI Yellow marker bar.
  const heading = { highlight: 'Fast', after: 'work is our focus.' }
  const body =
    'We deliver efficient IT solutions and impactful digital marketing, ensuring rapid and effective results for your business.'

  const reasons = ['Innovation', 'Security', 'Efficiency', 'Integrity']

  const { method } = useAbout()
  const spans: Array<Omit<DeliveryLane, 'label'>> = [
    { start: 0, length: 2, roles: ['T', 'C'] },
    { start: 1.5, length: 3, roles: ['T', 'C'] },
    { start: 3.5, length: 5, roles: ['T'] },
    { start: 8, length: 2.5, roles: ['T', 'C'] },
    { start: 10, length: 2, roles: ['T'], ongoing: true }
  ]
  const lanes: DeliveryLane[] = spans.map((s, i) => ({ ...s, label: method[i] ?? '' }))

  const weeks = 12
  const board = { title: 'Delivery timeline', done: 'Done', progress: 'In progress', finish: 'Delivered' }

  return { eyebrow, heading, body, reasons, lanes, weeks, board }
}

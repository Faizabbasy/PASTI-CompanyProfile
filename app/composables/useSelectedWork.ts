export interface SelectedWorkProject {
  index: string
  title: string
  image: string
}

/**
 * Selected Work project cards, per .docs/PASTI_Cuberto_Template_Content_Mapping.docx
 * section 06 — SELECTED WORK. Images sourced from .docs/image/SW (1-8).PNG plus
 * SW ().PNG, real client case-study promo visuals supplied by the client. SW (6)
 * was a duplicate of SW (2) (both JM-Click / Jasa Marga) and was skipped, leaving
 * 6 unique projects — the list was trimmed from the prior 10-slot placeholder set
 * to match. Titles use the real brand/client names shown in each image rather
 * than the previous generic placeholder copy. Slot 05 (Pertamina) originally had
 * the JM-Click image duplicated into it by mistake; SW ().PNG — the real Pertamina
 * "Energi Untuk Negeri" campaign visual — replaced it, and the title was corrected
 * from the incorrect "Universitas Pertamina" to "Pertamina" to match.
 */
export function useSelectedWork() {
  const projects: SelectedWorkProject[] = [
    { index: '01', title: 'IKEA Indonesia', image: '/images/selected-work/ikea-indonesia.png' },
    { index: '02', title: 'JM-Click — Jasa Marga', image: '/images/selected-work/jm-click.png' },
    { index: '03', title: 'PowerHours', image: '/images/selected-work/powerhours.png' },
    { index: '04', title: 'HDI Healthy Lifestyle', image: '/images/selected-work/hdi-healthy-lifestyle.png' },
    { index: '05', title: 'Pertamina', image: '/images/selected-work/pertamina.png' },
    { index: '06', title: 'OCTO Mobile — CIMB Niaga', image: '/images/selected-work/octo-mobile.png' }
  ]

  return { projects }
}

export interface SelectedWorkProject {
  index: string
  title: string
}

/**
 * Selected Work project cards, per .docs/PASTI_Cuberto_Template_Content_Mapping.docx
 * section 06 — SELECTED WORK. Order follows the mapping table as-is; the doc does
 * not pair specific PASTI case studies (section 11) to specific card slots, and per
 * the client that pairing is deferred rather than guessed.
 *
 * No project imagery exists yet — cards render an empty placeholder visual until
 * approved case-study assets are provided, per placement rule "Selected Work should
 * use PASTI case-study visuals," the same approach taken for Trust's client logos.
 */
export function useSelectedWork() {
  const projects: SelectedWorkProject[] = [
    { index: '01', title: 'Transforming procurement into one connected digital ecosystem' },
    { index: '02', title: 'Building a digital ecosystem for enterprise operations' },
    { index: '03', title: 'Turning brand stories into engaging digital experiences' },
    { index: '04', title: 'Connecting people, processes and workforce operations' },
    { index: '05', title: 'Building scalable technology for complex business needs' },
    { index: '06', title: 'Building a digital platform from strategy to execution' },
    { index: '07', title: 'Turning a business idea into a complete digital product' },
    { index: '08', title: 'Creating digital experiences that connect brands and people' },
    { index: '09', title: 'Creating connected experiences across digital touchpoints' },
    { index: '10', title: 'Reimagining business experiences through technology and creativity' }
  ]

  return { projects }
}

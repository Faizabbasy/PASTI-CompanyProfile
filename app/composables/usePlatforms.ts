export interface Platform {
  index: string
  name: string
  positioning: string
  image: string
  to: string
  /** Character label per 04-homepage-spec.md §6 mental model ("OPEN: Expansive
   * Precision. e-CORPORATE: Structured Precision."). Approved copy exception
   * alongside "Platforms"/"OPEN"/"e-CORPORATE" — not Lorem ipsum. */
  character: string
}

/**
 * Homepage platform section, per .docs/PASTI_Cuberto_Template_Content_Mapping.docx
 * section 10 — PASTI SERVICE EXPANSION / CONTENT MODEL, PLATFORMS line.
 *
 * Positioning copy and cover images (public/images/platforms/) supplied directly by
 * the client, replacing the earlier "e-CORPORATE: keep high-level, Coming soon"
 * placeholder — both platforms now have real, client-approved positioning.
 */
export function usePlatforms() {
  const platforms: Platform[] = [
    {
      index: '01',
      name: 'OPEN',
      character: 'Expansive Precision',
      positioning: 'Digitize your procurement from planning to contract. e-Procurement connects people, processes, vendors, approvals, and documents into one structured digital workflow.',
      image: '/images/platforms/open.png',
      to: '/open'
    },
    {
      index: '02',
      name: 'e-CORPORATE',
      character: 'Structured Precision',
      positioning: 'e-CORPORATE is an enterprise digital platform that connects people, processes, and information in one integrated environment — helping organizations work smarter, collaborate better, and operate with greater control.',
      image: '/images/platforms/e-corporate.png',
      to: '/e-corporate'
    }
  ]

  return { platforms }
}

export interface Platform {
  index: string
  name: string
  positioning: string
  image: string
  to: string
  /** Milestone 7: see NavItem.comingSoon in useNavigation.ts — `to` has no
   * real destination page yet, so consumers must render the CTA as
   * non-navigating/disabled rather than linking to a 404. */
  comingSoon?: boolean
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
      // OPEN PRODUCT 2026.pdf (owner approved the update, 2026-10-07): a
      // ready-to-develop procurement framework, not e-Procurement / SaaS.
      positioning: 'OPEN is a ready-to-develop procurement framework that connects procurement, vendors, catalogs, governance, approvals, monitoring, and enterprise integrations — customized around your organization.',
      image: '/images/platforms/open.webp',
      to: '/open'
    },
    {
      index: '02',
      name: 'e-CORPORATE',
      character: 'Structured Precision',
      positioning: 'e-CORPORATE is an enterprise digital platform that connects people, processes, and information in one integrated environment — helping organizations work smarter, collaborate better, and operate with greater control.',
      image: '/images/platforms/e-corporate.webp',
      to: '/e-corporate'
    }
  ]

  return { platforms }
}

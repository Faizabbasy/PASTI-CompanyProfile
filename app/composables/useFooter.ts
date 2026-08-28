export interface FooterLink {
  label: string
  to: string
}

/**
 * Footer navigation and platform links, per
 * .docs/PASTI_Cuberto_Template_Content_Mapping.docx section 15 — FOOTER / PLATFORM
 * LINKS. Three of the five nav-link cells are truncated mid-word in the source doc
 * with no ellipsis marker ("Solution", "Insi", "Let's Ta") and the two platform
 * cells are single-letter placeholders ("O", "e") — none of these are usable as
 * final display copy. The full labels below were confirmed directly by the client.
 *
 * Routes reuse the same paths already used by the primary navigation
 * (useNavigation) and homepage platform section (usePlatforms), so footer links
 * point at the same destinations rather than inventing new routes.
 */
export function useFooter() {
  const navLinks: FooterLink[] = [
    { label: 'Solutions', to: '/technology' },
    { label: 'Insights', to: '/insights' },
    { label: 'Our Work', to: '/work' },
    { label: 'About', to: '/about' },
    { label: "Let's Talk", to: '/contact' }
  ]

  const platformLinks: FooterLink[] = [
    { label: 'OPEN', to: '/open' },
    { label: 'e-CORPORATE', to: '/e-corporate' }
  ]

  return { navLinks, platformLinks }
}

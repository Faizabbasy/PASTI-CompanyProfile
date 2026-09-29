export interface FooterLink {
  label: string
  to: string
  /** Milestone 7: see NavItem.comingSoon in useNavigation.ts — same 404
   * finding, same fix, applied to the footer's platform links. */
  comingSoon?: boolean
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
    { label: 'OPEN', to: '/open', comingSoon: true },
    { label: 'e-CORPORATE', to: '/e-corporate', comingSoon: true }
  ]

  // Service links: labels are the real service titles (useServices); each
  // routes to its pillar page, same mapping the homepage rows use.
  const { services } = useServices()
  const serviceLinks: FooterLink[] = services.map((s) => ({
    label: s.title,
    to: s.category === 'creative' ? '/creative' : '/technology'
  }))

  // Contact facts. The WhatsApp number is the real one already used by every
  // CTA (useWhatsapp). The office address is NOT known — no address exists in
  // the brief or repo and none may be invented — so it stays a Lorem ipsum
  // placeholder (global copy rule). Set `address` to the real string and the
  // placeholder disappears.
  const contact = {
    whatsappDisplay: '+62 821-2549-2299',
    address: null as string | null,
    addressPlaceholder: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    entity: 'PT Hidup Pasti Bahagia',
    positioning: 'Technology × Creative Execution Partner'
  }

  return { navLinks, serviceLinks, platformLinks, contact }
}

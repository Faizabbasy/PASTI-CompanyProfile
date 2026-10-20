export interface NavItem {
  label: string
  to: string
  isPlatform?: boolean
  /** Milestone 7 cutover-readiness fix: OPEN/e-CORPORATE have no page under
   * `/open`/`/e-corporate` in the repo (genuine 404s) and the frozen docs
   * don't define an alternate existing target. Per the milestone's fix
   * policy ("no legitimate existing target -> make the CTA non-navigation/
   * static until the proper route exists, never ship a 404, never invent
   * destination content"), this marks the item as a non-navigating,
   * disabled label instead — consumers (NavLink.vue, MobileMenu.vue) must
   * render it without a real `to` navigation when true. */
  comingSoon?: boolean
  /** Grouped item (2026-10-16): renders as a dropdown on desktop and an
   * accordion in the mobile menu. `to` is then only a key — the group has
   * no page of its own. */
  children?: NavChild[]
  /** Small caps title above the dropdown list, e.g. "Our Frameworks". */
  heading?: string
}

export type NavIconName = 'technology' | 'creative' | 'open' | 'shiftly' | 'ecorp' | 'fast' | 'dora' | 'matrix'

export interface NavChild {
  label: string
  to: string
  /** One existing line about the page (its hero headline or product tagline). */
  description: string
  isPlatform?: boolean
  /** Built but not public yet — filtered out of the bar and mobile menu. */
  hidden?: boolean
  /** Line icon on the dropdown tile (LayoutNavIcon). */
  icon: NavIconName
}

/**
 * Single source of truth for primary navigation, per
 * .docs/PASTI_Cuberto_Template_Content_Mapping.docx section 01 — NAVIGATION.
 *
 * Grouped bar (owner decision 2026-10-16): the bar had grown to 9 links, so
 * the two service pages sit under "Services" and the three products under
 * "Platforms" — no page was removed. Owner kept "Home" and added the
 * /contact page to the bar (the "Let's Talk" button stays a direct WhatsApp
 * link). Child descriptions reuse existing copy: the service pages' hero
 * headlines and each product's SEO tagline.
 */
export function useNavigation() {
  const navItems: NavItem[] = [
    { label: 'Home', to: '/' },
    {
      label: 'Services',
      to: '#services',
      heading: 'Our Services',
      children: [
        { label: 'Technology', to: '/technology', description: 'Technology built to move business forward.', icon: 'technology' },
        { label: 'Creative', to: '/creative', description: 'Creative that gets business results.', icon: 'creative' }
      ]
    },
    {
      // Bar label renamed "Frameworks" (owner 2026-10-19); the homepage /
      // footer / technology sections still say "Platforms".
      label: 'Frameworks',
      to: '#frameworks',
      isPlatform: true,
      heading: 'Our Frameworks',
      // Descriptions follow the owner's dropdown reference (2026-10-19).
      children: [
        { label: 'OPEN', to: '/open', description: 'Customizable Procurement Framework', isPlatform: true, icon: 'open' },
        { label: 'SHIFTLY', to: '/shiftly', description: 'Customizable Human Capital Framework', isPlatform: true, icon: 'shiftly' },
        { label: 'e-CORPORATE', to: '/e-corporate', description: 'Customizable Enterprise Management Framework', isPlatform: true, icon: 'ecorp' },
        // FAST and DORA published by the owner on 2026-10-19.
        { label: 'FAST', to: '/fast', description: 'Flexible Production Planning & Scheduling Framework', isPlatform: true, icon: 'fast' },
        { label: 'DORA', to: '/dora', description: 'Document Recognition & Analysis', isPlatform: true, icon: 'dora' },
        // MATRIX published at launch (owner 2026-10-19, docs/matrix/00).
        { label: 'MATRIX', to: '/matrix', description: 'Integrated Inventory & Material Management', isPlatform: true, icon: 'matrix' }
      ].filter((c) => !c.hidden)
    },
    { label: 'Work', to: '/work' },
    { label: 'About', to: '/about' },
    { label: 'Insights', to: '/insights' },
    { label: 'Contact', to: '/contact' }
  ]

  const primaryCta = { label: "Let's Talk", to: '/contact' }

  return { navItems, primaryCta }
}

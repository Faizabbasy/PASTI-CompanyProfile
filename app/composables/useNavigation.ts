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
}

export interface NavChild {
  label: string
  to: string
  /** One existing line about the page (its hero headline or product tagline). */
  description: string
  isPlatform?: boolean
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
      children: [
        { label: 'Technology', to: '/technology', description: 'Technology built to move business forward.' },
        { label: 'Creative', to: '/creative', description: 'Creative that gets business results.' }
      ]
    },
    {
      label: 'Platforms',
      to: '#platforms',
      isPlatform: true,
      children: [
        { label: 'OPEN', to: '/open', description: 'Customizable Procurement Ecosystem', isPlatform: true },
        { label: 'SHIFTLY', to: '/shiftly', description: 'Modern HRIS & Workforce Platform', isPlatform: true },
        { label: 'e-CORPORATE', to: '/e-corporate', description: 'Enterprise Digital Platform', isPlatform: true }
      ]
    },
    { label: 'Work', to: '/work' },
    { label: 'About', to: '/about' },
    { label: 'Insights', to: '/insights' },
    { label: 'Contact', to: '/contact' }
  ]

  const primaryCta = { label: "Let's Talk", to: '/contact' }

  return { navItems, primaryCta }
}

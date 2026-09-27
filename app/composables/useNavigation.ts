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
}

/**
 * Single source of truth for primary navigation, per
 * .docs/PASTI_Cuberto_Template_Content_Mapping.docx section 01 — NAVIGATION.
 * OPEN and e-CORPORATE are first-class platform destinations (isPlatform: true).
 */
export function useNavigation() {
  const navItems: NavItem[] = [
    { label: 'Home', to: '/' },
    { label: 'Technology', to: '/technology' },
    { label: 'Creative', to: '/creative' },
    { label: 'OPEN', to: '/open', isPlatform: true, comingSoon: true },
    { label: 'e-CORPORATE', to: '/e-corporate', isPlatform: true, comingSoon: true },
    { label: 'Work', to: '/work' },
    { label: 'About', to: '/about' },
    { label: 'Insights', to: '/insights' }
  ]

  const primaryCta = { label: "Let's Talk", to: '/contact' }

  return { navItems, primaryCta }
}

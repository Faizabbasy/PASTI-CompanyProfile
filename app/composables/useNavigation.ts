export interface NavItem {
  label: string
  to: string
  isPlatform?: boolean
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
    { label: 'OPEN', to: '/open', isPlatform: true },
    { label: 'e-CORPORATE', to: '/e-corporate', isPlatform: true },
    { label: 'Work', to: '/work' },
    { label: 'About', to: '/about' },
    { label: 'Insights', to: '/insights' }
  ]

  const primaryCta = { label: "Let's Talk", to: '/contact' }

  return { navItems, primaryCta }
}

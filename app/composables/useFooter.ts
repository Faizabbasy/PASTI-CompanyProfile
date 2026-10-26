import type { SocialCmsKey } from '#shared/utils/sharedContentSchema'
import { ctasSource } from './useSharedContentSource'

export type SocialKey = 'linkedin' | 'instagram' | 'whatsapp' | 'tiktok' | 'youtube'

export interface FooterSocial {
  key: SocialKey
  label: string
  /** null = not supplied yet: the icon renders dimmed and non-interactive
   * (same "coming soon" pattern as the platform links) — never a fake URL. */
  url: string | null
}

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
    { label: 'OPEN', to: '/open' },
    { label: 'SHIFTLY', to: '/shiftly' },
    { label: 'e-CORPORATE', to: '/e-corporate' },
    { label: 'FAST', to: '/fast' },
    { label: 'DORA', to: '/dora' },
    { label: 'MATRIX', to: '/matrix' }
  ]

  // Service links: labels are the real service titles (useServices); each
  // routes to its pillar page, same mapping the homepage rows use.
  const { services } = useServices()
  const serviceLinks: FooterLink[] = services.map((s) => ({
    label: s.title,
    to: s.category === 'creative' ? '/creative' : '/technology'
  }))

  // Contact facts. The WhatsApp number is the real one already used by every
  // CTA (useWhatsapp). Office address, email, maps link and hours are NOT known
  // yet — no such data exists in the brief or repo and none may be invented —
  // so they are null and the Footer simply omits those rows (no placeholder
  // copy). Fill them in here when the owner supplies them.
  // Address + email (2026-10-07) come from the COMPRO 2025 company profile
  // (p.2, p.42); maps link and hours are still unknown.
  //
  // Shared Content CMS (Global CTAs): when its flag is on and a version is
  // published, its email, address, maps link, hours, positioning line and
  // social links replace these (an empty CMS field = row hidden / icon
  // dimmed). The WhatsApp number and the legal entity stay in code.
  const cms = ctasSource.read()
  const orNull = (v: string) => (v.trim() ? v.trim() : null)
  const { email } = useFinalCta()
  const contact = {
    whatsappDisplay: '+62 821-2549-2299',
    email,
    address: (cms ? orNull(cms.address) : 'Mutu Work – RS Fatmawati No. 39, Cilandak, South Jakarta 12430') as string | null,
    mapsUrl: (cms ? orNull(cms.mapsUrl) : null) as string | null,
    hours: (cms ? orNull(cms.hours) : null) as string | null,
    entity: 'PT Hidup Pasti Bahagia',
    positioning: cms ? cms.positioning : 'Technology × Creative Execution Partner'
  }

  // Social profiles. Only WhatsApp has a real destination so far; the others
  // stay null until the owner provides the official URLs.
  const { link: whatsappLink } = useWhatsapp()
  const social = (key: SocialCmsKey): string | null => (cms ? orNull(cms.socials[key]) : null)
  const socials: FooterSocial[] = [
    { key: 'linkedin', label: 'LinkedIn', url: social('linkedin') },
    { key: 'instagram', label: 'Instagram', url: social('instagram') },
    { key: 'whatsapp', label: 'WhatsApp', url: whatsappLink },
    { key: 'tiktok', label: 'TikTok', url: social('tiktok') },
    { key: 'youtube', label: 'YouTube', url: social('youtube') }
  ]

  return { navLinks, serviceLinks, platformLinks, contact, socials }
}

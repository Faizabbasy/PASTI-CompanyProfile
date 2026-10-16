/**
 * /contact content (2026-10-16). Composed entirely from data that already
 * exists — no new contact facts:
 * - WhatsApp, email, office and entity come from useFooter().contact (the
 *   email and address are COMPRO 2025, p.2 / p.42).
 * - The maps link is derived from that address (a Google Maps search URL),
 *   per the owner's choice of a link over an embedded map. Opening hours
 *   are still unknown, so they're not shown.
 * - Hero copy reuses approved lines: useFinalCta's eyebrow/heading and the
 *   homepage hero's body sentence.
 * - "What do you need?" options are the real service titles (useServices)
 *   plus the three platforms from the footer.
 *
 * The form hands off to WhatsApp (owner decision 2026-10-16) — there is no
 * form backend.
 */
export function useContact() {
  const { contact, socials, platformLinks } = useFooter()
  const { eyebrowLine, headingLine } = useFinalCta()
  const { link: whatsappLink, phone } = useWhatsapp()
  const { services } = useServices()

  const mapsUrl =
    contact.mapsUrl ??
    (contact.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}` : null)

  const hero = {
    eyebrow: eyebrowLine,
    heading: headingLine,
    body: 'We build technology and creative solutions for businesses ready to move forward.'
  }

  const needs = [...services.map((s) => s.title), ...platformLinks.map((p) => p.label), 'Other']

  return {
    hero,
    contact: { ...contact, mapsUrl },
    socials: socials.filter((s) => s.url && s.key !== 'whatsapp'),
    needs,
    whatsappLink,
    phone
  }
}

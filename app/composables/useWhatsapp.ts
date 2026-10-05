/**
 * Single source of truth for the PASTI WhatsApp contact link (Rizal,
 * +62 821-2549-2299), used by every "Let's Talk" / "Tell us about it" CTA
 * that should open WhatsApp instead of the internal /contact route.
 */
export function useWhatsapp() {
  const phone = '6282125492299'
  const message = 'Halo, saya tertarik untuk berdiskusi dengan tim PASTI'
  const link = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

  return { link, phone }
}

export interface FinalCtaContent {
  eyebrowLine: string
  headingLine: string
  ctaTo: string
  officeLabel: string
  email: string | null
}

/**
 * Final CTA copy, per .docs/PASTI_Cuberto_Template_Content_Mapping.docx section 09 — FINAL CTA.
 *
 * Both the eyebrow and heading are truncated mid-word in the source doc ("Have a
 * challe" / "Let's build what", no ellipsis marker) — their full text ("Have a
 * challenge?" / "Let's build what matters") was confirmed directly by the client
 * rather than guessed.
 *
 * The doc's PASTI email replacement is also truncated ("hello@pastitech." with no
 * TLD) and no complete PASTI email/address/phone exists anywhere in the mapping
 * doc or this repository. Per the client's explicit instruction not to invent
 * contact details, `email` is left null until the real address is confirmed —
 * consuming components must treat a null email as "omit the email action
 * entirely," not fall back to a placeholder string.
 *
 * "Our office" is used as a label only; no office address is set here because the
 * source doc doesn't provide one and none should be invented.
 *
 * Email (2026-10-07): klien@pastipeople.id, from the COMPRO 2025 company profile
 * (p.2 and p.42).
 */
export function useFinalCta(): FinalCtaContent {
  return {
    eyebrowLine: 'Have a challenge?',
    headingLine: "Let's build what matters",
    ctaTo: '/contact',
    officeLabel: 'Our office',
    email: 'klien@pastipeople.id'
  }
}

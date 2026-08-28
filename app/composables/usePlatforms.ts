export interface Platform {
  index: string
  name: string
  positioning: string
  to: string
}

/**
 * Homepage platform section, per .docs/PASTI_Cuberto_Template_Content_Mapping.docx
 * section 10 — PASTI SERVICE EXPANSION / CONTENT MODEL, PLATFORMS line:
 * "OPEN: One Procurement Ecosystem Network. e-CORPORATE: keep high-level until an
 * approved product brief is available."
 *
 * OPEN's positioning is quoted verbatim from the doc. e-CORPORATE has no
 * positioning, tagline, feature, or module copy anywhere in the source — the doc
 * carries its own explicit disclaimer ("the uploaded PASTI company profile does
 * not provide enough detailed product information to safely invent feature-level
 * copy") — so `positioning` is a neutral status label only ("Enterprise platform
 * · Coming soon"), not an invented description, confirmed with the client rather
 * than authored here. Replace it with real positioning once an approved product
 * brief exists.
 */
export function usePlatforms() {
  const platforms: Platform[] = [
    { index: '01', name: 'OPEN', positioning: 'One Procurement Ecosystem Network', to: '/open' },
    { index: '02', name: 'e-CORPORATE', positioning: 'Enterprise platform · Coming soon', to: '/e-corporate' }
  ]

  return { platforms }
}

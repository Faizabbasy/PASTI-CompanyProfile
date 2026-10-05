export interface TrustedClient {
  name: string
  logo: string
}

/**
 * Client logos for the Trust section, per .docs/PASTI_Cuberto_Template_Content_Mapping.docx
 * section 05 — TRUST and placement rule "Client logos must be approved for publication."
 *
 * Assets confirmed by the client as approved-for-publication, supplied in
 * .docs/LOGO/ and copied to public/logos/.
 */
export function useTrustedClients() {
  const clients: TrustedClient[] = [
    { name: 'Google', logo: '/logos/google.webp' },
    { name: 'Microsoft', logo: '/logos/microsoft.webp' },
    { name: 'Meta', logo: '/logos/meta.webp' },
    { name: 'Shopify', logo: '/logos/shopify.webp' },
    { name: 'Shopee', logo: '/logos/shopee.webp' },
    { name: 'TikTok', logo: '/logos/tiktok.webp' },
    { name: 'WordPress', logo: '/logos/wordpress.webp' }
  ]

  return { clients }
}

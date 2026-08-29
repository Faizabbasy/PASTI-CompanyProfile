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
    { name: 'Google', logo: '/logos/google.png' },
    { name: 'Microsoft', logo: '/logos/microsoft.png' },
    { name: 'Meta', logo: '/logos/meta.png' },
    { name: 'Shopify', logo: '/logos/shopify.png' },
    { name: 'Shopee', logo: '/logos/shopee.png' },
    { name: 'TikTok', logo: '/logos/tiktok.jpg' },
    { name: 'WordPress', logo: '/logos/wordpress.png' }
  ]

  return { clients }
}

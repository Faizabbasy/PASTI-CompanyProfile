export interface TrustedClient {
  name: string
  logo: string
}

/**
 * Client logos for the Trust section, per .docs/PASTI_Cuberto_Template_Content_Mapping.docx
 * section 05 — TRUST and placement rule "Client logos must be approved for publication."
 *
 * Empty until PASTI provides approved logo assets — do not fill with invented,
 * placeholder, or unapproved client names/marks. See TASK 05 report for the
 * asset request.
 */
export function useTrustedClients() {
  const clients: TrustedClient[] = []

  return { clients }
}

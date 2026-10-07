export type ClientPublicationStatus = 'approved' | 'needs_approval'

export interface Client {
  name: string
  /** Public logo path; null when no publishable file exists. */
  logo: string | null
  /** Logo width / height (trimmed file) — drives optical sizing in Trust.vue. */
  ratio: number
  /** Where the logo came from. */
  source: string
  publication_status: ClientPublicationStatus
  /** Shown in the homepage Trusted marquee (Trust.vue). */
  trusted: boolean
}

/**
 * Client ecosystem for the homepage Trusted marquee.
 *
 * Owner decisions 2026-10-07: client logos replace the platform logos in
 * Trusted (the platforms moved to HomeTechStrip); all clients are
 * `approved`. The list started from the COMPRO 2025 client wall (p.7); the
 * owner then supplied original logo files for 26 of them plus four more
 * clients (Mandiri Taspen, Perum Jasa Tirta II, Trisula Corporation, BSI).
 * Files are trimmed, background-free WebPs in public/logos/clients/.
 * Compas and Raya still use the interim COMPRO crops — replace them under
 * the same filenames when originals arrive.
 *
 * "Compas" is not Kompas: its logo reads "Compas — Comprehensive Price and
 * Analytics". "Bank AL Habib" was listed as "Rusk Al Habib" from the COMPRO
 * crop; the original logo reads Bank AL Habib.
 */
export function useClients() {
  const entry = (name: string, file: string, ratio: number, source = 'Owner-supplied logo (2026-10-07)'): Client => ({
    name,
    logo: `/logos/clients/${file}.webp`,
    ratio,
    source,
    publication_status: 'approved',
    trusted: true
  })
  const interim = 'Interim crop from COMPRO 2025 p.7'

  const clients: Client[] = [
    entry('Indonesia Eximbank', 'indonesia-eximbank', 2.888),
    entry('Jasa Marga', 'jasamarga', 4.108),
    entry('Perdana', 'perdana', 2.659),
    entry('Universitas Pertamina', 'universitas-pertamina', 1.423),
    entry('BRIN', 'brin', 2.548),
    entry('Compas', 'compas', 2.69, interim),
    entry('Raya', 'raya', 2.179, interim),
    entry('Tiara Medika Clinic', 'tiara-medika-clinic', 1.075),
    entry('Klinik KIS', 'klinik-kis', 0.9),
    entry('Rumah Sakit Rosela', 'rumah-sakit-rosela', 1),
    entry('Prolepsis Medical Centers', 'prolepsis-medical-centers', 3.857),
    entry('Cakra Medika', 'cakra-medika', 3.83),
    entry('Indo Medika International', 'indo-medika-international', 1.818),
    entry('BNI Syariah', 'bni-syariah', 1.892),
    entry('Bank AL Habib', 'bank-al-habib', 0.967),
    entry('Garuda Indonesia', 'garuda-indonesia', 1.758),
    entry('Mister Aladin', 'mister-aladin', 3.429),
    entry('Vivo', 'vivo', 3.81),
    entry('JD.ID', 'jd-id', 2.85),
    entry('CGV', 'cgv', 1),
    entry('JOOX', 'joox', 3.117),
    entry('Tokopedia', 'tokopedia', 2.971),
    entry('AEON Mall', 'aeon-mall', 1),
    entry('Philips', 'philips', 0.792),
    entry('Mandiri Taspen', 'mandiri-taspen', 1.883),
    entry('Perum Jasa Tirta II', 'perum-jasa-tirta-ii', 3.86),
    entry('Trisula Corporation', 'trisula-corporation', 1.881),
    entry('Bank Syariah Indonesia', 'bsi', 3.582)
  ]

  return { clients }
}

import type { DeepPartial } from '~/utils/localize'
import type { FooterData } from '~/composables/useFooter'

// Contact facts that can come from the CMS (email, address, maps, hours) are
// deliberately absent: the overlay must never replace CMS values. The
// positioning line is also CMS-editable, so its Indonesian default lives in
// useFooter (used only when no CMS record is published).
export const FOOTER_ID: DeepPartial<FooterData> = {
  navLinks: [{ label: 'Solusi' }, { label: 'Insights' }, { label: 'Karya Kami' }, { label: 'Tentang' }, { label: 'Hubungi Kami' }]
}

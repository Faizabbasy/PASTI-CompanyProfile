import type { DeepPartial } from '~/utils/localize'
import type { WorkPageContent } from '#shared/utils/workPublic'

// Indonesian wording for the /work legacy content (buildLegacyWorkContent).
// Hero headline: two lines, the yellow full stop follows line 2.
export const WORK_PAGE_ID: DeepPartial<WorkPageContent> = {
  hero: {
    eyebrow: 'Karya',
    headlineLines: ['Karya', 'pilihan'],
    lede: 'Melihat lebih dekat cara kami bekerja bersama klien — proyek nyata, dari brief hingga hasil yang berjalan sampai hari ini.',
    primaryCtaLabel: 'Lihat proyek',
    secondaryCta: { label: 'Ceritakan pada kami' }
  },
  index: { sectionLabel: 'Indeks' },
  cases: {
    sectionLabel: 'Studi kasus',
    titleLead: 'Studi kasus',
    titleAccent: 'pilihan.',
    supportingCopy: 'Tantangan nyata. Solusi praktis. Hasil yang berarti.'
  }
}

import type { DeepPartial } from '~/utils/localize'
import type { NavigationData } from '~/composables/useNavigation'

export const NAVIGATION_ID: DeepPartial<NavigationData> = {
  navItems: [
    { label: 'Beranda' },
    {
      label: 'Layanan',
      heading: 'Layanan Kami',
      children: [
        { description: 'Teknologi yang dibangun untuk menggerakkan bisnis.' },
        { description: 'Kreativitas untuk hasil bisnis.' }
      ]
    },
    {
      label: 'Framework',
      heading: 'Framework Kami',
      children: [
        { description: 'Framework Pengadaan yang Dapat Disesuaikan' },
        { description: 'Framework Human Capital yang Dapat Disesuaikan' },
        { description: 'Framework Manajemen Enterprise yang Dapat Disesuaikan' },
        { description: 'Framework Perencanaan & Penjadwalan Produksi yang Fleksibel' },
        { description: 'Pengenalan & Analisis Dokumen' },
        { description: 'Manajemen Inventaris & Material Terintegrasi' }
      ]
    },
    { label: 'Karya' },
    { label: 'Tentang' },
    { label: 'Insights' },
    { label: 'Kontak' }
  ],
  primaryCta: { label: 'Hubungi Kami' }
}

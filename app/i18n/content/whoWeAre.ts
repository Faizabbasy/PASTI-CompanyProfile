import type { DeepPartial } from '~/utils/localize'
import type { WhoWeAreData } from '~/composables/useWhoWeAre'

export const WHO_WE_ARE_ID: DeepPartial<WhoWeAreData> = {
  eyebrow: 'Siapa Kami',
  heading: { before: 'Dipercaya', after: 'oleh banyak orang, bertahap.' },
  body: 'Komitmen kami pada solusi IT yang andal dan pemasaran digital yang strategis telah mendapat kepercayaan bisnis di seluruh Indonesia — dari BUMN dan perusahaan multinasional hingga brand terkemuka di bidang keuangan, FMCG, dan lifestyle.',
  facts: [
    { label: 'Perusahaan · Berdiri 2020' },
    { label: 'Positioning', value: 'Partner Eksekusi Teknologi × Kreatif' },
    { label: 'Esensi' }
  ],
  portraits: [
    { alt: 'Klien PASTI tersenyum sambil memegang tablet dan kopi', tag: 'Klien · 01' },
    { alt: 'Klien PASTI tersenyum mengenakan jaket kuning', tag: 'Klien · 02' },
    { alt: 'Klien PASTI yang senang membuat tanda OK', tag: 'Klien · 03' }
  ],
  clientStat: { label: 'Klien puas' },
  partner: {
    kicker: 'Mari Berkembang',
    panelTitle: 'Bekerja Bersama Kami',
    panelBody: 'Bersama kita bangun produk Anda.',
    portrait: { alt: 'Perempuan tersenyum sambil memegang laptop' },
    title: 'Partner Tepercaya',
    body: 'untuk Teknologi dan Pemasaran Kreatif, menghadirkan pertumbuhan yang berdampak.',
    stats: [{ label: 'Proyek Selesai' }, { label: 'Klien Terlayani' }]
  },
  cta: { label: 'Mari Bekerja Sama' }
}

import type { DeepPartial } from '~/utils/localize'
import type { InsightsData } from '~/composables/useInsights'

// Indonesian overlay for useInsights() — the seven PASTI articles, same order
// as the base list. Faithful to the English copy (transcribed from each
// poster); nothing added. `topic` is a filter key and stays English (shown
// through t()). The PASTI-perspective sentence itself comes translated from
// useTechnology / useCreative / useCompany, so only its label and link labels
// are overlaid here; project names in links stay.
export const INSIGHTS_ID: DeepPartial<InsightsData> = {
  articles: [
    {
      title: 'Keamanan Siber: Lindungi yang Penting. Bangun dengan Percaya Diri.',
      page: {
        category: 'Keamanan',
        headline: { text: 'Keamanan Siber' },
        tagline: { text: 'Lindungi yang Penting.', accent: 'Bangun dengan Percaya Diri.' },
        description: 'Solusi keamanan canggih untuk melindungi data, sistem, dan masa depan digital Anda.',
        points: ['Keamanan Jaringan', 'Enkripsi Data', 'Perlindungan Endpoint', 'Deteksi Ancaman'],
        pasti: { label: 'Pendekatan PASTI', links: [{ label: 'Kapabilitas teknologi' }] }
      }
    },
    {
      title: 'Teknologi Enterprise',
      page: {
        headline: { text: 'Teknologi', accent: 'Enterprise' },
        description: 'Solusi skalabel dan sistem yang tangguh untuk menggerakkan perusahaan, merampingkan operasional, dan menghasilkan nilai jangka panjang.',
        points: ['Cloud', 'Aplikasi', 'Data', 'Keamanan'],
        pasti: { label: 'Pendekatan PASTI', links: [{ label: 'Monitoring Produksi Tekstil' }, { label: 'Otomasi Workflow (AT-WF)' }] }
      }
    },
    {
      title: 'AI & Transformasi Digital',
      page: {
        headline: { text: 'AI & Transformasi', accent: 'Digital' },
        description: 'Memanfaatkan AI dan teknologi terbaru untuk mentransformasi operasional, meningkatkan pengalaman pelanggan, dan mendorong pertumbuhan berkelanjutan.',
        points: ['Ikhtisar AI', 'Insight Data', 'Otomasi', 'Analitik'],
        pasti: { label: 'Pendekatan PASTI', links: [{ label: 'Kapabilitas teknologi' }] }
      }
    },
    {
      title: 'Masa Depan Bisnis: Berinovasi Hari Ini. Memimpin Esok.',
      page: {
        category: 'Bisnis',
        headline: { text: 'Masa Depan Bisnis' },
        tagline: { text: 'Berinovasi Hari Ini.', accent: 'Memimpin Esok.' },
        description: 'Merangkul perubahan, teknologi, dan potensi manusia untuk menciptakan hari esok yang lebih baik.',
        points: ['Perubahan', 'Teknologi', 'Potensi Manusia', 'Hari Esok yang Lebih Baik'],
        pasti: { label: 'Visi kami', links: [{ label: 'Tentang PASTI' }] }
      }
    },
    {
      title: 'Kreatif & Brand',
      page: {
        headline: { text: 'Kreatif', accent: '& Brand' },
        description: 'Ide yang menghubungkan, cerita yang membekas, dan brand yang meninggalkan kesan mendalam.',
        points: ['Konsep', 'Identitas Visual', 'Tipografi', 'Storytelling'],
        pasti: { label: 'Pendekatan PASTI', links: [undefined, { label: 'Karya kreatif pilihan' }] }
      }
    },
    {
      title: 'Ide yang Mendorong Bisnis Maju.',
      page: {
        category: 'Strategi',
        headline: { text: 'Ide yang Mendorong', accent: 'Bisnis Maju.' },
        description: 'Insight, tren, dan strategi untuk membantu Anda membangun, berkembang, dan memimpin di era digital.',
        points: ['Insight', 'Tren', 'Strategi'],
        pasti: { links: [{ label: 'Strategi OCTO Mobile' }, { label: 'Tentang PASTI' }] }
      }
    },
    {
      title: 'Produk Digital & UX',
      page: {
        category: 'Produk',
        headline: { text: 'Produk Digital', accent: '& UX' },
        description: 'Merancang pengalaman intuitif dan produk digital yang menyenangkan pengguna serta menyelesaikan masalah nyata.',
        points: ['Pengalaman Intuitif', 'Produk Digital', 'Masalah Nyata'],
        pasti: { label: 'Pendekatan PASTI' }
      }
    }
  ]
}

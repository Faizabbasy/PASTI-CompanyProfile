import type { DeepPartial } from '~/utils/localize'
import type { FeaturedCase } from '~/composables/useFeaturedCases'

// Indonesian overlay for useFeaturedCases() — same order as the base list
// (PowerHours, Textile, HDI, AT-WF). Faithful to the COMPRO 2025 wording;
// ids, years, client names, technology stacks and metric VALUES stay as
// they are. `projectRef` is a lookup key and is never translated.
export const FEATURED_CASES_ID: DeepPartial<FeaturedCase[]> = [
  {
    category: 'Aplikasi Mobile / Wellness',
    businessContext:
      'Aplikasi fitness yang membantu orang tetap konsisten berolahraga, mengakses sesi latihan profesional, dan memantau progres secara real-time — untuk individu, komunitas, dan program wellness perusahaan.',
    challenge: [
      'Merancang UI/UX yang sangat menarik namun ringan untuk semua level pengguna.',
      'Mengoptimalkan konten video agar tetap lancar diputar di internet berkecepatan rendah.',
      'Membangun sistem penjadwalan latihan yang modular.'
    ],
    solution: [
      'Mengembangkan antarmuka yang berpusat pada pengguna dengan elemen visual yang memotivasi.',
      'Memanfaatkan CDN dan kompresi video untuk memastikan streaming yang mulus.',
      'Membangun sistem backend dengan template latihan yang dapat disesuaikan.',
      'Menyertakan pelacakan progres bawaan dengan pengingat pintar dan gamifikasi leaderboard.'
    ],
    timeline: {
      steps: [{ label: 'Discovery & Perencanaan' }, { label: 'Desain UI/UX' }, { label: 'Pengembangan & QA' }, { label: 'Deployment & Dukungan' }],
      total: '~3,5 bulan'
    },
    visuals: [
      { alt: 'Aplikasi fitness PowerHours di ponsel, di samping seorang wanita yang memeriksa progres latihannya' },
      { alt: 'Empat layar aplikasi PowerHours: onboarding, penawaran membership, pemilihan minat, dan feed yang dipersonalisasi' }
    ]
  },
  {
    title: 'Dashboard Monitoring Produksi Tekstil',
    category: 'Dashboard Operasional / Monitoring Manufaktur',
    businessContext: 'Perusahaan manufaktur yang perlu memantau efisiensi produksi di berbagai shift dan mesin tenun.',
    challenge: [
      'Data produksi tersebar dan pelaporan masih manual.',
      'Manajer tidak memiliki visibilitas real-time atas RPM, efisiensi, benang putus, dan kualitas produksi.',
      'Keputusan yang terlambat menurunkan produktivitas secara keseluruhan.'
    ],
    solution: ['Dashboard monitoring produksi yang dirancang untuk memusatkan visibilitas operasional di seluruh shift dan mesin tenun.'],
    outcome: [
      'Pengambilan keputusan lebih cepat berkat visibilitas data produksi secara real-time.',
      'Manajer shift dapat dengan cepat mengidentifikasi inefisiensi.',
      'Kualitas produk meningkat dengan memantau benang putus dan performa tiap mesin tenun.',
      'Akuntabilitas antar-shift meningkat melalui metrik perbandingan.'
    ],
    metrics: [{ label: 'pengambilan keputusan lebih cepat' }, { label: 'pengurangan downtime' }],
    visuals: [{ alt: 'Dashboard produksi Nagaria Textile dengan grafik RPM, efisiensi, dan mesin tenun per gudang, serta tren RPM bulanan' }]
  },
  {
    category: 'Aplikasi Mobile / Wellness Karyawan',
    businessContext:
      'Penyedia tenaga kerja industri terkemuka dengan fokus kuat pada kesejahteraan karyawan. Perusahaan ini bermitra dengan PASTI untuk mengembangkan Healthy Lifestyle App yang mendorong kebiasaan lebih sehat melalui fitur wellness digital yang disesuaikan untuk tenaga kerjanya.',
    challenge: [
      'Menyampaikan edukasi kesehatan dalam format yang menarik dan tidak terlalu formal.',
      'Mengembangkan sistem self-assessment yang sederhana namun bermakna.',
      'Mendorong penggunaan harian di kalangan karyawan yang bukan digital native.'
    ],
    request: [
      'Konten edukasi tentang kesehatan fisik dan mental.',
      'Self-assessment kesehatan berkala untuk karyawan.',
      'Pelacakan aktivitas (hidrasi, meditasi, olahraga, dll.).',
      'Rekomendasi yang dipersonalisasi dan pengingat kesehatan harian.'
    ],
    visuals: [
      { alt: 'Aplikasi HDI Healthy Lifestyle di ponsel yang menampilkan aktivitas harian dan tantangan, dipegang seorang wanita yang tersenyum' },
      { alt: 'Layar onboarding, sambutan, dan masuk aplikasi HDI' },
      { alt: 'Layar cek suasana hati, rencana latihan, menu makan, resep, dan penetapan target di aplikasi HDI' }
    ]
  },
  {
    title: 'Platform Otomasi Workflow (AT-WF)',
    client: 'Sebuah perusahaan besar',
    category: 'Otomasi Workflow / Platform Enterprise',
    businessContext: 'Perusahaan yang mengelola workflow operasional lintas departemen.',
    challenge: [
      'Proses manual dan komunikasi yang terfragmentasi.',
      'Tidak ada monitoring real-time, sehingga terjadi keterlambatan, pekerjaan ganda, dan kesulitan memastikan kepatuhan.',
      'Kebutuhan akan sistem workflow terpusat untuk menstandarkan proses, meningkatkan transparansi, dan mempercepat keputusan.'
    ],
    outcome: [
      'Proses persetujuan lebih cepat di seluruh departemen.',
      'Kepatuhan dan akuntabilitas meningkat melalui laporan yang siap diaudit.',
      'Kesalahan manual berkurang dengan menghilangkan duplikasi dan workflow berbasis kertas.',
      'Kolaborasi lintas departemen lebih kuat karena proses menjadi transparan dan terstandarisasi.'
    ],
    insight:
      'Otomasi workflow mempercepat efisiensi operasional dan mengubah tim dari kolaborasi yang reaktif menjadi proaktif; standarisasi menjadi tulang punggung transformasi digital selanjutnya.',
    metrics: [{ label: 'persetujuan lebih cepat di kuartal pertama' }, { label: 'kesalahan manual lebih sedikit' }],
    visuals: [
      { alt: 'Dashboard manajemen gudang dengan komposisi stok per gudang dan tabel seluruh permintaan' },
      { alt: 'Tabel supply order gudang yang dikelompokkan per gudang dan hub' }
    ]
  }
]

import type { DeepPartial } from '~/utils/localize'
import type { CompanyData } from '~/composables/useCompany'

// Standard names and milestone years are lookup keys (pickStandards /
// pickMilestones) — not translated here; components translate them with t().
export const COMPANY_ID: DeepPartial<CompanyData> = {
  facts: [
    { label: 'Perusahaan' },
    { label: 'Brand' },
    { label: 'Berdiri' },
    { label: 'Website' },
    { label: 'Email' },
    { label: 'Kantor', value: 'Mutu Work – RS Fatmawati No. 39, Cilandak, Jakarta Selatan 12430' }
  ],
  story: [
    'PASTI, yang beroperasi di bawah PT Hidup Pasti Bahagia, berdiri pada 2020 dengan misi menyatukan teknologi dan kreativitas dalam satu layanan. Kami berspesialisasi dalam membangun sistem yang skalabel, membangun komunikasi brand yang kuat, dan mendorong pertumbuhan bisnis dengan hasil yang terukur.',
    'Sejak 2020, kami telah menyelesaikan lebih dari 70 proyek untuk 50+ klien, termasuk BUMN, perusahaan multinasional, dan brand terkemuka di sektor keuangan, FMCG, dan lifestyle. Model kerja satu atap kami memastikan efisiensi, konsistensi, dan akuntabilitas di setiap tahap eksekusi.',
    'Dengan fondasi inovasi, keamanan, efisiensi, dan integritas, PASTI terus berkembang sebagai partner strategis bagi organisasi yang menjalani transformasi digital. Kami berkomitmen memberdayakan bisnis dengan solusi yang gesit, siap menghadapi masa depan, dan dirancang untuk memberi dampak jangka panjang.'
  ],
  vision: 'Memberdayakan bisnis dengan solusi digital yang inovatif, aman, dan mulus untuk mempercepat dampak.',
  mission: 'Kami berkomitmen menghadirkan sistem yang skalabel, kreativitas yang strategis, dan dukungan digital jangka panjang, yang disesuaikan dengan pertumbuhan bisnis nyata. Dengan menyatukan keahlian teknologi dan keunggulan kreatif, kami membantu klien bergerak lebih cepat, tetap relevan, dan meraih kesuksesan yang berkelanjutan.',
  standards: [
    { body: 'Bagi kami, inovasi bukan pilihan, melainkan keharusan. Setiap solusi yang kami rancang lahir dari rasa ingin tahu dan keberanian — baik saat mengembangkan platform berbasis AI, membuat kampanye yang berani, maupun mencari cara baru untuk memecahkan tantangan bisnis yang kompleks.' },
    { body: 'Kepercayaan adalah infrastruktur kami. Dari arsitektur sistem hingga penanganan data kreatif, kami mengutamakan keamanan di setiap langkah. Klien mengandalkan kami karena kami memastikan apa yang kami bangun aman, patuh regulasi, dan andal untuk jangka panjang.' },
    { body: 'Kami merampingkan proses agar bisnis lebih cepat, lebih cerdas, dan lebih hemat biaya. Efisiensi bagi kami berarti hasil maksimal dengan sumber daya yang optimal, tanpa pernah mengorbankan kualitas.' },
    { body: 'Kemitraan tumbuh dari kejujuran dan akuntabilitas. Integritas tercermin dari cara kami berkomunikasi, bekerja, dan bertanggung jawab. Kami tetap transparan dan manusiawi — karena kepercayaan sejati lahir dari konsistensi.' }
  ],
  milestones: [
    { text: 'Pendirian PT Hidup Pasti Bahagia, dengan fokus awal pada teknologi.' },
    { text: 'Proyek BUMN pertama diselesaikan untuk Jasa Marga.' },
    { text: 'Ekspansi ke layanan pemasaran kreatif dan penyusunan roadmap transformasi.' },
    { text: '50+ klien dilayani, 70+ proyek diselesaikan.' },
    { text: 'Sistem bisnis berbasis AI.' }
  ],
  founder: {
    eyebrow: 'Perspektif operasional',
    meta: 'Perspektif COO',
    quote: 'Bagi kami, keunggulan operasional adalah jembatan antara ide besar dan dampak bisnis yang nyata.',
    foreword: [
      'Di PASTI, eksekusi bukan sekadar menyelesaikan proyek — melainkan memastikan setiap detail selaras dengan visi, tujuan, dan kesuksesan jangka panjang klien.',
      'Sebagai Operational Director, peran saya adalah mengubah strategi menjadi hasil yang terukur dengan memastikan kolaborasi yang mulus antara tim teknologi, kreatif, dan growth. Kami mengutamakan kelincahan, skalabilitas, dan presisi di semua proyek, didukung proses berbasis SLA dan pelacakan kinerja yang transparan.',
      'Bagi kami, keunggulan operasional adalah jembatan antara ide besar dan dampak bisnis yang nyata. Dengan lebih dari 70 proyek yang berhasil dijalankan di berbagai industri, PASTI telah membuktikan bahwa sistem yang andal, eksekusi yang disiplin, dan tim yang kolaboratif menghasilkan hasil yang bertahan lama.'
    ]
  },
  sectors: ['BUMN', 'Sektor publik', 'Keuangan', 'FMCG', 'Lifestyle']
}

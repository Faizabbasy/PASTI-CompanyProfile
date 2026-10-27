import type { DeepPartial } from '~/utils/localize'
import type { codeFaq } from '~/composables/useFaq'

export const FAQ_ID: DeepPartial<ReturnType<typeof codeFaq>> = {
  items: [
    { question: 'Apa yang bisa PASTI bantu bangun untuk bisnis Anda?', answer: 'PASTI bekerja di bidang teknologi dan kreatif, dari sistem digital, AI, platform enterprise, dan aplikasi mobile hingga kampanye, konten, produksi, branding, dan UI/UX.' },
    { question: 'Layanan teknologi apa saja yang disediakan PASTI?', answer: 'Layanan teknologi kami meliputi pengembangan teknologi, solusi AI, platform enterprise, aplikasi mobile dan MVP, keamanan siber, serta pemeliharaan sistem.' },
    { question: 'Apakah PASTI bisa membangun solusi teknologi custom?', answer: 'Bisa. PASTI mengembangkan solusi yang disesuaikan dengan kebutuhan bisnis, termasuk platform enterprise, aplikasi mobile, dan sistem digital lainnya.' },
    { question: 'Apakah PASTI bisa membantu membangun MVP?', answer: 'Bisa. Kemampuan kami di aplikasi mobile dan MVP membantu tim memvalidasi ide, meluncurkan produk, dan mengembangkannya seiring pertumbuhan bisnis.' },
    { question: 'Apakah PASTI bisa mendukung jangka panjang?', answer: 'Bisa. PASTI menyediakan pemeliharaan sistem dan dukungan SLA untuk menjaga kontinuitas, performa, dan keandalan setelah peluncuran.' },
    { question: 'Bagaimana PASTI bekerja dengan klien?', answer: 'Kami mulai dari tantangan bisnis, menentukan arah yang tepat, membangun solusinya, dan terus mendukungnya sesuai kebutuhan proyek.' },
    { question: 'Apakah PASTI bisa membangun solusi digital yang aman?', answer: 'Keamanan adalah bagian dari kemampuan teknologi kami, termasuk arsitektur yang aman, enkripsi, penetration testing, dan tata kelola data.' }
  ]
}

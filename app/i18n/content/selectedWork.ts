import type { DeepPartial } from '~/utils/localize'
import type { SelectedWorkData } from '~/composables/useSelectedWork'

// Project titles are names — they stay as they are.
export const SELECTED_WORK_ID: DeepPartial<SelectedWorkData> = {
  projects: [
    { category: 'E-Commerce Omnichannel', description: 'Pengalaman belanja web dan mobile yang interaktif, menghubungkan inspirasi, produk, dan orang — dari belanja per ruangan hingga proses checkout yang mulus. Flow, UI/UX, dan pengembangan oleh PASTI.' },
    { category: 'Platform Enterprise', description: 'Dashboard dan aplikasi mobile terintegrasi yang mendigitalkan operasional Jasa Marga Group — lalu lintas real-time, transaksi tol, pemeliharaan, dan insiden dalam satu tempat. Flow, UI/UX, dan pengembangan oleh PASTI.' },
    { category: 'Aplikasi Kebugaran & Wellness', description: 'Pendamping kebugaran dengan video latihan dari pelatih bersertifikat, jadwal latihan personal, pelacakan progres, dan leaderboard komunitas — dibangun dengan Flutter untuk iOS dan Android.' },
    { category: 'Platform Wellness Karyawan', description: 'Aplikasi wellness karyawan untuk PT Harmoni Dinamik Indonesia yang membuat kebiasaan sehat jadi menarik — pelacakan aktivitas, self-assessment, tantangan, dan pengingat harian yang personal.' },
    { category: 'Kampanye Korporat', description: 'Kampanye “Energi Untuk Negeri” — kehadiran digital yang menghubungkan Pertamina dengan masyarakat di seluruh Indonesia lewat cerita tentang energi, inovasi, dan keberlanjutan.' },
    { category: 'Mobile Banking', description: 'Pengalaman perbankan digital untuk OCTO Mobile CIMB Niaga — transaksi yang mulus, pengelolaan uang yang lebih cerdas, dan perbankan sehari-hari yang lebih baik.' }
  ]
}

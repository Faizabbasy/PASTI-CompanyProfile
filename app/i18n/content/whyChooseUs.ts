import type { DeepPartial } from '~/utils/localize'
import type { WhyChooseUsData } from '~/composables/useWhyChooseUs'

export const WHY_CHOOSE_US_ID: DeepPartial<WhyChooseUsData> = {
  eyebrow: 'Kenapa Memilih Kami',
  heading: { highlight: 'Cepat', after: 'adalah fokus kerja kami.' },
  body: 'Kami menghadirkan solusi IT yang efisien dan pemasaran digital yang berdampak, memastikan hasil yang cepat dan efektif untuk bisnis Anda.',
  reasons: ['Inovasi', 'Keamanan', 'Efisiensi', 'Integritas'],
  board: { title: 'Timeline pengerjaan', done: 'Selesai', progress: 'Berjalan', finish: 'Diserahkan' }
}

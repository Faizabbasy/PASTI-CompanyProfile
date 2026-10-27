import type { DeepPartial } from '~/utils/localize'
import type { ContactData } from '~/composables/useContact'
import type { ContactPageContent } from '#shared/utils/contactPublic'

// Indonesian overlay for useContact() — text only. The hero eyebrow / heading
// come from useFinalCta; shared contact facts are language-neutral.
export const CONTACT_ID: DeepPartial<ContactData> = {
  hero: {
    body: 'Kami membangun solusi teknologi dan kreatif untuk bisnis yang siap melangkah maju.'
  }
}

// Indonesian overlay for the wording hard-coded in buildLegacyContactContent().
export const CONTACT_PAGE_ID: DeepPartial<ContactPageContent> = {
  channels: {
    whatsapp: { action: 'Chat sekarang' },
    email: { action: 'Kirim email' },
    office: { label: 'Kantor', action: 'Buka di Google Maps' }
  },
  form: {
    title: 'Ceritakan kebutuhan Anda',
    description: 'Kolom bertanda * wajib diisi. Brief Anda akan terbuka di WhatsApp, siap dikirim.',
    fields: {
      name: { label: 'Nama' },
      company: { label: 'Perusahaan' },
      email: { label: 'Email kantor' },
      phone: { label: 'Telepon / WhatsApp' },
      message: { label: 'Pesan' }
    },
    needsLegend: 'Apa yang Anda butuhkan?',
    needsHint: 'Pilih beberapa',
    submitLabel: 'Kirim via WhatsApp',
    success: { title: 'Brief Anda siap di WhatsApp.', message: 'Tekan kirim di WhatsApp untuk menghubungi tim PASTI.' },
    error: { title: 'WhatsApp tidak terbuka.', message: 'Browser Anda mungkin memblokir jendela baru. Gunakan tombol di bawah untuk membukanya.' }
  }
}

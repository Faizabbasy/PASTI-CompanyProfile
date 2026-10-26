import { ContactContentSchema, type ContactContent } from '#shared/utils/contactSchema'
import { zodFieldErrors } from './useSingletonEditor'

// Form state for /admin/pages/contact (editor logic: useSingletonEditor).
// No repeaters: every field is fixed by the current page design.

export type ContactForm = ContactContent

// Editor sections in page order (AdminEditorFrame). /contact is one hero
// section (headline + channels left, form right), so every part previews
// at index 0.
export const CONTACT_TABS = [
  { key: 'hero', no: '01', label: 'Judul halaman', where: 'Kiri atas halaman Contact: label kecil setelah penanda “Contact”, judul besar (tiap kata muncul bergantian), dan paragraf pendek di bawahnya.', sections: ['hero'], previewIndex: 0 },
  { key: 'info', no: '02', label: 'Baris kontak', where: 'Di kiri, di bawah judul: tiga baris bernomor — WhatsApp, Email, dan Kantor. Tiap baris punya label kecil dan teks link; nomor, email dan alamatnya sendiri diatur di Shared Content → Global CTAs.', sections: ['channels'], previewIndex: 0 },
  { key: 'form', no: '03', label: 'Form brief', where: 'Kartu putih di kanan (di HP: di bawah): judul “Tell us about it.”, keterangan, kolom isian, pilihan “What do you need?”, tombol kirim, dan pesan yang muncul setelah tombol diklik.', sections: ['form'], previewIndex: 0 },
  { key: 'seo', no: '', label: 'SEO', where: 'Judul & deskripsi yang muncul di Google dan saat link dibagikan. Tidak tampil di halaman.', sections: ['seo'] }
] as const

export function toContactForm(c: ContactContent): ContactForm {
  // JSON round-trip: `c` is often a reactive proxy (useAsyncData).
  return JSON.parse(JSON.stringify(c)) as ContactContent
}

export function toContactPayload(f: ContactForm) {
  return JSON.parse(JSON.stringify(f)) as ContactContent
}

export function validateContactForm(f: ContactForm): Record<string, string> {
  return zodFieldErrors(ContactContentSchema.safeParse(toContactPayload(f)))
}

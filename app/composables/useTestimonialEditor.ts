import { TestimonialContentSchema, type TestimonialContent } from '#shared/utils/testimonialSchema'
import { zodFieldErrors } from './useSingletonEditor'

// Form state for the Testimonials collection editor (record editor logic:
// useSingletonEditor; create: useCollectionCreate). Publication approval is
// not part of the form — it has its own action (AdminTestimonialsApproval).

export type TestimonialForm = TestimonialContent

// Record editor groups (AdminEditorFrame). `previewIndex` 0 = the Creative
// testimonial card, the only section the testimonial preview renders.
export const TESTIMONIAL_TABS = [
  { key: 'quote', no: '01', label: 'Kutipan', where: 'Kalimat testimoni di kartu testimoni — bagian Testimoni di homepage dan kartu testimoni di halaman Creative (kalau halaman itu memilihnya).', sections: ['quote'], previewIndex: 0 },
  { key: 'person', no: '02', label: 'Orang & perusahaan', where: 'Nama, jabatan dan perusahaan tampil di bawah kutipan di kartu testimoni.', sections: ['personName', 'roleTitle', 'companyDisplayName', 'clientId'], previewIndex: 0 },
  { key: 'media', no: '03', label: 'Foto', where: 'Foto bulat di kartu testimoni. Tanpa foto, kartu memakai inisial nama.', sections: ['photo', 'photoAlt'], previewIndex: 0 },
  { key: 'classification', no: '04', label: 'Jenis & kategori', where: 'Hanya untuk mengelompokkan dan mencari di admin — tidak tampil di website.', sections: ['type', 'categoryIds', 'tags'] },
  { key: 'publication', no: '05', label: 'Tampil & urutan', where: 'Menentukan apakah testimoni boleh tampil dan urutan bawaannya. Catatan sumber hanya untuk admin.', sections: ['active', 'sortOrder', 'sourceNote'] }
] as const

export const TESTIMONIAL_TYPE_LABELS = { client: 'Klien', partner: 'Partner', user: 'Pengguna', internal: 'Internal' } as const
export const TESTIMONIAL_CATEGORY_LABELS = { technology: 'Technology', creative: 'Creative' } as const

export function emptyTestimonial(): TestimonialForm {
  return {
    quote: '',
    personName: '',
    roleTitle: '',
    companyDisplayName: '',
    clientId: '',
    photo: '',
    photoAlt: '',
    type: 'client',
    categoryIds: [],
    tags: [],
    active: true,
    sortOrder: 100,
    sourceNote: ''
  }
}

export function toTestimonialForm(c: TestimonialContent): TestimonialForm {
  // JSON round-trip: `c` is often a reactive proxy (useAsyncData).
  return JSON.parse(JSON.stringify(c)) as TestimonialContent
}

export function toTestimonialPayload(f: TestimonialForm) {
  return JSON.parse(JSON.stringify(f)) as TestimonialContent
}

export function validateTestimonialForm(f: TestimonialForm): Record<string, string> {
  return zodFieldErrors(TestimonialContentSchema.safeParse(toTestimonialPayload(f)))
}

// Client picker: the existing shared client list (useClients), by logo slug.
export function testimonialClientOptions() {
  return useClients().clients.map((c) => ({ id: (c.logo ?? '').replace(/^\/logos\/clients\//, '').replace(/\.webp$/, ''), name: c.name })).filter((c) => c.id)
}

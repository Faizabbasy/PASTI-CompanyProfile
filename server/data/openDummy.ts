import { OPEN_SECTION_KEYS, OPEN_SECTIONS, dummyOpen, type OpenContent } from '#shared/utils/openSchema'

// DUMMY / DEV DATA — OPEN CMS validation only. NOT the public /open content
// (that comes from useOpen) and must never be migrated as-is. Placeholder
// copy generated from the field map so it always has the right shape.
export const OPEN_DUMMY_CONTENT: OpenContent = {
  ...(Object.fromEntries(OPEN_SECTION_KEYS.map((k) => [k, dummyOpen(OPEN_SECTIONS[k])])) as Omit<OpenContent, 'seo'>),
  seo: {
    metaTitle: '[Dummy] OPEN',
    metaDescription: '[Dummy] Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    ogImage: '',
    canonicalUrl: '',
    noIndex: true
  }
}

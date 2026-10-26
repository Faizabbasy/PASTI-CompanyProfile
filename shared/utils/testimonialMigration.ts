import type { TestimonialContent } from './testimonialSchema'

// Current site testimonials (useTestimonials) → Testimonials collection.
// Pure and deterministic: the same legacy input always yields the same ids
// and content, so re-running the migration never duplicates records.
//
// Nothing is rewritten: quote, name and photo are copied verbatim. The
// current site shows ONE role line per person with the company inside it
// ("Head of Sales Perdana"); the CMS keeps job title and company apart. The
// split below is an explicit, reviewed table — each part must appear
// verbatim, in order, in today's line (the script checks this) — and the
// exact line is kept in record meta (`legacyRoleLine`) so a later page
// integration can reproduce today's wording. No title or company is inferred.

export const TESTIMONIALS_MIGRATION_VERSION = 'testimonials-v1'

export const slugName = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 56)

// Same id the Creative page's temporary ref (`t:<slug>`) points at.
export const testimonialIdFor = (name: string) => `tst-${slugName(name)}`

export const LEGACY_ROLE_SPLIT: Record<string, { roleTitle: string; companyDisplayName: string }> = {
  'Head of Sales Perdana': { roleTitle: 'Head of Sales', companyDisplayName: 'Perdana' },
  'Senior Research Fellow at Bank BSI': { roleTitle: 'Senior Research Fellow', companyDisplayName: 'Bank BSI' },
  'Founder Perdana Consulting': { roleTitle: 'Founder', companyDisplayName: 'Perdana Consulting' },
  'CMO of Dingo Korea': { roleTitle: 'CMO', companyDisplayName: 'Dingo Korea' }
}

export interface LegacyTestimonial {
  status: string
  name: string
  role: string
  quote: string
  photo?: string
}

export function legacyToTestimonial(t: LegacyTestimonial, index: number): { id: string; content: TestimonialContent; meta: Record<string, string> } {
  const split = LEGACY_ROLE_SPLIT[t.role] ?? { roleTitle: t.role, companyDisplayName: '' }
  return {
    id: testimonialIdFor(t.name),
    content: {
      quote: t.quote,
      personName: t.name,
      roleTitle: split.roleTitle,
      companyDisplayName: split.companyDisplayName,
      // Not linked: matching a company line to a client record would be an
      // inference. An admin can link it in the CMS.
      clientId: '',
      photo: t.photo ?? '',
      // The site renders these portraits as decorative (name alongside).
      photoAlt: '',
      // Shown in the site's "What clients say" section.
      type: 'client',
      categoryIds: [],
      tags: [],
      active: true,
      sortOrder: index + 1,
      sourceNote: 'Current site (useTestimonials). Owner-confirmed real and verified on 2026-10-16, incl. public-display consent ("Pasti People" → "PASTI" in quotes by owner decision).'
    },
    meta: { legacyRoleLine: t.role }
  }
}

// Strings that only appear in the dev seed.
export const TESTIMONIALS_DUMMY_MARKERS = ['[Dummy]', 'Lorem ipsum', 'Dev seed']

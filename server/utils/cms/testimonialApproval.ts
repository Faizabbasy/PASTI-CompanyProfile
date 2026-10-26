import { createHash } from 'node:crypto'
import { TESTIMONIAL_APPROVAL_FIELDS, type TestimonialContent } from '#shared/utils/testimonialSchema'

// Fingerprint of the identity fields a publication approval covers (quote,
// person, role, company, client, photo). A confirmed approval stores the
// fingerprint of the wording the admin approved; content whose fingerprint
// differs is not covered by it. Used by the server and the migration script.
export function testimonialApprovalHash(c: Pick<TestimonialContent, (typeof TESTIMONIAL_APPROVAL_FIELDS)[number]>): string {
  const fields = Object.fromEntries(TESTIMONIAL_APPROVAL_FIELDS.map((k) => [k, c[k]]))
  return createHash('sha256').update(JSON.stringify(fields)).digest('hex').slice(0, 32)
}

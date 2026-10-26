import { z } from 'zod'

// Public Testimonials contract — what GET /api/public/testimonials returns.
// Only public-eligible records (published + confirmed + active), only the
// fields a card needs: never drafts, approval/workflow metadata, actors,
// revisions or internal source notes. No page consumes this yet; each page
// integration is its own step and keeps its order of ids page-side.

const str = z.string()

const ItemSchema = z.object({
  id: str,
  quote: str.min(1),
  personName: str,
  roleTitle: str,
  companyDisplayName: str,
  clientId: str,
  photo: str,
  photoAlt: str,
  type: str,
  categoryIds: z.array(str),
  tags: z.array(str)
})

const ResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('disabled') }),
  z.object({ status: z.literal('ok'), items: z.array(ItemSchema) })
])
export const PublicTestimonialsResponseSchema = ResponseSchema
export type PublicTestimonialsResponse = z.infer<typeof PublicTestimonialsResponseSchema>
export type PublicTestimonial = z.infer<typeof ItemSchema>

// Query: ?ids=a,b,c — at most this many, each a collection id.
export const PUBLIC_TESTIMONIAL_MAX_IDS = 20

// The single attribution line a card shows under the name ("Founder,
// Perdana Consulting"). Code-owned formatting; pages may choose otherwise.
export function testimonialRoleLine(t: { roleTitle: string; companyDisplayName: string }): string {
  return [t.roleTitle, t.companyDisplayName].filter(Boolean).join(', ')
}

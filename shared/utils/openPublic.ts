import { z } from 'zod'
import { OpenContentSchema } from './openSchema'

// Public OPEN contract — what GET /api/public/pages/open returns. Always an
// explicit status; never a draft or workflow metadata. Content is validated
// with the same field map the admin API enforces, so a response that does
// not match falls back to the code content (see useOpenPage).

const publicOpenResponse = z.discriminatedUnion('status', [
  z.object({ status: z.literal('disabled') }),
  z.object({ status: z.literal('unpublished') }),
  z.object({ status: z.literal('published'), version: z.number().int(), publishedAt: z.string(), content: OpenContentSchema })
])
export const PublicOpenResponseSchema = publicOpenResponse
export type PublicOpenResponse = z.infer<typeof PublicOpenResponseSchema>

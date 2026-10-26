import { z } from 'zod'
import { TestimonialContentSchema } from '#shared/utils/testimonialSchema'

// Save Draft (ADMIN + EDITOR). Optimistic lock on the revision (409). Only
// the draft changes: the published snapshot (and the approval covering it)
// stays live until an ADMIN publishes.
const Body = z.object({ revision: z.number().int().min(1), content: TestimonialContentSchema }).strict()

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.edit')
  const { user } = await requirePermission(event, 'content.saveDraft')
  const { revision, content } = await readZodBody(event, Body)
  const { record, changedSections } = await testimonialsCollection.saveDraft(event, user, getRouterParam(event, 'id') ?? '', revision, content)
  return { ...(await testimonialAdminResponse(record)), changedSections }
})

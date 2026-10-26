import { z } from 'zod'
import { TestimonialContentSchema } from '#shared/utils/testimonialSchema'

// Create (ADMIN + EDITOR) as an unpublished draft with approval
// needs_approval — creating never approves public use.
const Body = z.object({ content: TestimonialContentSchema }).strict()

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.edit')
  const { user } = await requirePermission(event, 'content.saveDraft')
  const { content } = await readZodBody(event, Body)
  const rec = await createTestimonial(event, user, content)
  setResponseStatus(event, 201)
  return testimonialAdminResponse(rec)
})

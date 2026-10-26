import { z } from 'zod'

// ADMIN only. Publishing never approves: a testimonial is public-eligible
// only once its approval is `confirmed` for the published wording.
const Body = z.object({ revision: z.number().int().min(1) }).strict()

export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.publish')
  const { revision } = await readZodBody(event, Body)
  return testimonialAdminResponse(await publishTestimonial(event, user, getRouterParam(event, 'id') ?? '', revision))
})

import { z } from 'zod'

// ADMIN only. Every active selected project / case study must be published.
const Body = z.object({ revision: z.number().int().min(1) }).strict()

export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.publish')
  const { revision } = await readZodBody(event, Body)
  return workPage.publish(event, user, revision)
})

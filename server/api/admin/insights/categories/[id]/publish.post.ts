import { z } from 'zod'

// ADMIN only. The published snapshot is what the public receives.
const Body = z.object({ revision: z.number().int().min(1) }).strict()

export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.publish')
  const { revision } = await readZodBody(event, Body)
  return categoryAdminResponse(await categoriesCollection.publish(event, user, getRouterParam(event, 'id') ?? '', revision))
})

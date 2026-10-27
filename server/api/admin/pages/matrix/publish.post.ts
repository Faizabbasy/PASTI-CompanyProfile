import { z } from 'zod'

// ADMIN only. `revision` must match the stored draft, so an admin publishes
// exactly the draft they reviewed.
const Body = z.object({ revision: z.number().int().min(1) }).strict()

export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.publish')
  const { revision } = await readZodBody(event, Body)
  return matrixFor(cmsLang(event)).publish(event, user, revision)
})

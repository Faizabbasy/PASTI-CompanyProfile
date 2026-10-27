import { z } from 'zod'

// ADMIN only. Publishing never changes claim / media approval status.
const Body = z.object({ revision: z.number().int().min(1) }).strict()

export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.publish')
  const { revision } = await readZodBody(event, Body)
  return caseAdminResponse(await casesCollection.forLocale(cmsLang(event)).publish(event, user, getRouterParam(event, 'id') ?? '', revision), cmsLang(event))
})

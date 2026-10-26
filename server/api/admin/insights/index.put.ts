import { z } from 'zod'
import { InsightsContentSchema } from '#shared/utils/insightsSchema'

// Save Draft (ADMIN + EDITOR). Stores article / category references only;
// every reference must exist and not be archived.
const Body = z.object({ revision: z.number().int().min(1), content: InsightsContentSchema }).strict()

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.edit')
  const { user } = await requirePermission(event, 'content.saveDraft')
  const { revision, content } = await readZodBody(event, Body)
  return insightsPage.saveDraft(event, user, revision, content)
})

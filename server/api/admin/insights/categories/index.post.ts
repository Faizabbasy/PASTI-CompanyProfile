import { z } from 'zod'
import { CategoryContentSchema } from '#shared/utils/insightsSchema'

// Create (ADMIN + EDITOR) as an unpublished draft.
const Body = z.object({ content: CategoryContentSchema }).strict()

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.edit')
  const { user } = await requirePermission(event, 'content.saveDraft')
  const { content } = await readZodBody(event, Body)
  const rec = await categoriesCollection.create(event, user, content)
  setResponseStatus(event, 201)
  return categoryAdminResponse(rec)
})

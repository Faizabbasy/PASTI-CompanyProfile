import { z } from 'zod'
import { ArticleContentSchema } from '#shared/utils/insightsSchema'

// Save Draft (ADMIN + EDITOR). Optimistic lock on the revision (409).
const Body = z.object({ revision: z.number().int().min(1), content: ArticleContentSchema }).strict()

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.edit')
  const { user } = await requirePermission(event, 'content.saveDraft')
  const { revision, content } = await readZodBody(event, Body)
  const { record, changedSections } = await articlesCollection.saveDraft(event, user, getRouterParam(event, 'id') ?? '', revision, content)
  return { ...(await articleAdminResponse(record)), changedSections }
})

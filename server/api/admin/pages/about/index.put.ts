import { z } from 'zod'
import { AboutContentSchema } from '#shared/utils/aboutSchema'

// Save Draft (ADMIN + EDITOR). Only the working draft changes; the published
// snapshot is untouched until an ADMIN publishes.
const Body = z.object({ revision: z.number().int().min(1), content: AboutContentSchema }).strict()

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.edit')
  const { user } = await requirePermission(event, 'content.saveDraft')
  const { revision, content } = await readZodBody(event, Body)
  return saveAboutDraft(event, user, revision, content)
})

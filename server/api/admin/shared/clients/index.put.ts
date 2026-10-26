import { z } from 'zod'
import { ClientsContentSchema } from '#shared/utils/sharedContentSchema'

// Save Draft (ADMIN + EDITOR). Only the working draft changes; the published
// snapshot is untouched until an ADMIN publishes.
const Body = z.object({ revision: z.number().int().min(1), content: ClientsContentSchema }).strict()

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.edit')
  const { user } = await requirePermission(event, 'content.saveDraft')
  const { revision, content } = await readZodBody(event, Body)
  return sharedPages.clients.saveDraft(event, user, revision, content)
})

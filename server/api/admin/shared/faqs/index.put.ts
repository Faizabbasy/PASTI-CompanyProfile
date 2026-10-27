import { z } from 'zod'
import { FaqsContentSchema } from '#shared/utils/sharedContentSchema'

// Save Draft (ADMIN + EDITOR). Only the working draft changes; the published
// snapshot is untouched until an ADMIN publishes.
const Body = z.object({ revision: z.number().int().min(1), content: FaqsContentSchema }).strict()

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.edit')
  const { user } = await requirePermission(event, 'content.saveDraft')
  const { revision, content } = await readZodBody(event, Body)
  return sharedPages.faqs.forLocale(cmsLang(event)).saveDraft(event, user, revision, content)
})

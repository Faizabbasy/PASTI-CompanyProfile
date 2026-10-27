import { z } from 'zod'
import { WorkContentSchema } from '#shared/utils/workSchema'

// Save Draft (ADMIN + EDITOR). Stores project / case-study references only;
// every reference must exist and not be archived.
const Body = z.object({ revision: z.number().int().min(1), content: WorkContentSchema }).strict()

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.edit')
  const { user } = await requirePermission(event, 'content.saveDraft')
  const { revision, content } = await readZodBody(event, Body)
  return workPage.forLocale(cmsLang(event)).saveDraft(event, user, revision, content)
})

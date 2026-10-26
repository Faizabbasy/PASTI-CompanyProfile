import { z } from 'zod'
import { CaseStudyContentSchema } from '#shared/utils/caseStudySchema'

// Create (ADMIN + EDITOR) as an unpublished draft.
const Body = z.object({ content: CaseStudyContentSchema }).strict()

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.edit')
  const { user } = await requirePermission(event, 'content.saveDraft')
  const { content } = await readZodBody(event, Body)
  const rec = await casesCollection.create(event, user, content)
  setResponseStatus(event, 201)
  return caseAdminResponse(rec)
})

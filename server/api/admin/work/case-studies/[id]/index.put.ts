import { z } from 'zod'
import { CaseStudyContentSchema } from '#shared/utils/caseStudySchema'

// Save Draft (ADMIN + EDITOR). Optimistic lock on the revision (409).
const Body = z.object({ revision: z.number().int().min(1), content: CaseStudyContentSchema }).strict()

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.edit')
  const { user } = await requirePermission(event, 'content.saveDraft')
  const { revision, content } = await readZodBody(event, Body)
  const { record, changedSections } = await casesCollection.saveDraft(event, user, getRouterParam(event, 'id') ?? '', revision, content)
  return { ...(await caseAdminResponse(record)), changedSections }
})

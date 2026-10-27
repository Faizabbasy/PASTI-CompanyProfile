import { z } from 'zod'
import { ProjectContentSchema } from '#shared/utils/projectSchema'

// Save Draft (ADMIN + EDITOR). Optimistic lock on the revision (409).
const Body = z.object({ revision: z.number().int().min(1), content: ProjectContentSchema }).strict()

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.edit')
  const { user } = await requirePermission(event, 'content.saveDraft')
  const { revision, content } = await readZodBody(event, Body)
  const { record, changedSections, mediaSynced } = await projectsCollection.forLocale(cmsLang(event)).saveDraft(event, user, getRouterParam(event, 'id') ?? '', revision, content)
  return { ...(await projectAdminResponse(record, cmsLang(event))), changedSections, mediaSynced }
})

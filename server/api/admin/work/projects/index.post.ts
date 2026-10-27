import { z } from 'zod'
import { ProjectContentSchema } from '#shared/utils/projectSchema'

// Create (ADMIN + EDITOR) as an unpublished draft.
const Body = z.object({ content: ProjectContentSchema }).strict()

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.edit')
  const { user } = await requirePermission(event, 'content.saveDraft')
  const { content } = await readZodBody(event, Body)
  const rec = await projectsCollection.forLocale(cmsLang(event)).create(event, user, content)
  setResponseStatus(event, 201)
  return projectAdminResponse(rec, cmsLang(event))
})

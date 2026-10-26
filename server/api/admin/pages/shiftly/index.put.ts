import { z } from 'zod'
import { ShiftlyContentSchema } from '#shared/utils/shiftlySchema'

// Save Draft (ADMIN + EDITOR). Only the working draft changes; the published
// snapshot is untouched until an ADMIN publishes.
const Body = z.object({ revision: z.number().int().min(1), content: ShiftlyContentSchema }).strict()

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.edit')
  const { user } = await requirePermission(event, 'content.saveDraft')
  const { revision, content } = await readZodBody(event, Body)
  return saveShiftlyDraft(event, user, revision, content)
})

import type { H3Event } from 'h3'
import type { ZodTypeAny, z } from 'zod'

// Shared input gate for every admin mutation: strict schema, 400 with
// field-level messages, never echoes submitted values back.
export async function readZodBody<S extends ZodTypeAny>(event: H3Event, schema: S): Promise<z.infer<S>> {
  const body = await readBody(event).catch(() => undefined)
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: {
        fields: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
      }
    })
  }
  return result.data
}

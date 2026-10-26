import type { H3Event } from 'h3'
import { roleCan, type CmsPermission } from '#shared/utils/cmsPermissions'
import type { ResolvedSession } from './session'

// Every /api/admin handler calls one of these itself, even though
// server/middleware/cms-guard.ts already gates the whole prefix.
export async function requireCmsUser(event: H3Event): Promise<ResolvedSession> {
  const resolved = await getCmsSession(event)
  if (!resolved) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return resolved
}

export async function requirePermission(event: H3Event, permission: CmsPermission): Promise<ResolvedSession> {
  const resolved = await requireCmsUser(event)
  if (!roleCan(resolved.user.role, permission)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return resolved
}

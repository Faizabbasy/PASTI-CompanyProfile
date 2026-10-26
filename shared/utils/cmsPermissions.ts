// Admin CMS role model (Step 1). Single source of truth shared by the server
// (authorization) and the admin UI (menu visibility only — never trusted).

export const CMS_ROLES = ['ADMIN', 'EDITOR'] as const
export type CmsRole = (typeof CMS_ROLES)[number]

export const CMS_PERMISSIONS = [
  'cms.view',
  'content.edit',
  'media.upload',
  'content.saveDraft',
  'content.preview',
  'seo.edit',
  'content.publish',
  'content.unpublish',
  'content.archive',
  'content.delete',
  // Approving public claims (case-study metrics, client-sensitive media):
  // ADMIN only. Publishing a record never approves its claims.
  'claims.approve',
  'users.manage',
  'settings.manage'
] as const
export type CmsPermission = (typeof CMS_PERMISSIONS)[number]

const EDITOR_PERMISSIONS: readonly CmsPermission[] = [
  'cms.view',
  'content.edit',
  'media.upload',
  'content.saveDraft',
  'content.preview',
  'seo.edit'
]

export const ROLE_PERMISSIONS: Record<CmsRole, readonly CmsPermission[]> = {
  ADMIN: CMS_PERMISSIONS,
  EDITOR: EDITOR_PERMISSIONS
}

export function roleCan(role: CmsRole | null | undefined, permission: CmsPermission): boolean {
  return !!role && ROLE_PERMISSIONS[role].includes(permission)
}

export type ContentStatus = 'draft' | 'published' | 'archived'

export interface CmsPublicUser {
  id: string
  email: string
  name: string
  role: CmsRole
}

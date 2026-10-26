import type { CmsRole } from '#shared/utils/cmsPermissions'

export interface CmsUser {
  id: string
  email: string
  name: string
  role: CmsRole
  passwordHash: string
  createdAt: string
  updatedAt: string
  disabled?: boolean
}

export interface CmsSession {
  userId: string
  csrfToken: string
  createdAt: number
  lastSeenAt: number
  // Absolute cut-off; idle timeout is enforced against lastSeenAt.
  expiresAt: number
  ip: string
  ua: string
}

export type AuditAction =
  | 'login.success'
  | 'login.failure'
  | 'login.locked'
  | 'logout'
  | 'create'
  | 'update'
  | 'publish'
  | 'unpublish'
  | 'archive'
  | 'delete'
  | 'user.create'
  | 'user.update'
  | 'user.roleChange'
  | 'media.upload'
  | 'media.delete'
  | 'about.update'
  | 'about.preview'
  | 'about.publish'
  | 'about.unpublish'
  | 'about.archive'
  | 'about.migrate'
  | 'technology.update'
  | 'technology.preview'
  | 'technology.publish'
  | 'technology.unpublish'
  | 'technology.archive'
  | 'technology.migrate'
  | 'creative.update'
  | 'creative.preview'
  | 'creative.publish'
  | 'creative.unpublish'
  | 'creative.archive'
  | 'creative.migrate'
  | 'work.update'
  | 'work.preview'
  | 'work.publish'
  | 'work.unpublish'
  | 'work.archive'
  | 'work.migrate'
  | 'project.create'
  | 'project.update'
  | 'project.publish'
  | 'project.unpublish'
  | 'project.archive'
  | 'project.delete'
  | 'caseStudy.create'
  | 'caseStudy.update'
  | 'caseStudy.publish'
  | 'caseStudy.unpublish'
  | 'caseStudy.archive'
  | 'caseStudy.delete'
  | 'claim.statusChange'
  | 'insights.update'
  | 'insights.preview'
  | 'insights.publish'
  | 'insights.unpublish'
  | 'insights.archive'
  | 'insights.migrate'
  | 'contact.update'
  | 'contact.preview'
  | 'contact.publish'
  | 'contact.unpublish'
  | 'contact.archive'
  | 'contact.migrate'
  | 'open.update'
  | 'open.preview'
  | 'open.publish'
  | 'open.unpublish'
  | 'open.archive'
  | 'open.migrate'
  | 'shiftly.update'
  | 'shiftly.preview'
  | 'shiftly.publish'
  | 'shiftly.unpublish'
  | 'shiftly.archive'
  | 'shiftly.migrate'
  | 'ecorporate.update'
  | 'ecorporate.preview'
  | 'ecorporate.publish'
  | 'ecorporate.unpublish'
  | 'ecorporate.archive'
  | 'ecorporate.migrate'
  | 'testimonial.create'
  | 'testimonial.update'
  | 'testimonial.preview'
  | 'testimonial.publish'
  | 'testimonial.unpublish'
  | 'testimonial.archive'
  | 'testimonial.delete'
  | 'testimonial.approvalChange'
  | 'testimonial.migrate'
  | 'article.create'
  | 'article.update'
  | 'article.preview'
  | 'article.publish'
  | 'article.unpublish'
  | 'article.archive'
  | 'article.delete'
  | 'category.create'
  | 'category.update'
  | 'category.publish'
  | 'category.unpublish'
  | 'category.archive'
  | 'category.delete'

export interface AuditEntry {
  id: string
  userId: string | null
  action: AuditAction
  entityType: string
  entityId: string | null
  timestamp: string
  metadata: Record<string, unknown>
}

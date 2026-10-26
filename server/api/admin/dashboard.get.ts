import { DUMMY_CONTENT } from '../../data/cmsDummy'

export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'cms.view')

  const byRecent = [...DUMMY_CONTENT].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return {
    dummy: true,
    user: toPublicUser(user),
    counts: {
      draft: DUMMY_CONTENT.filter((c) => c.status === 'draft').length,
      published: DUMMY_CONTENT.filter((c) => c.status === 'published').length,
      archived: DUMMY_CONTENT.filter((c) => c.status === 'archived').length,
      pendingReview: DUMMY_CONTENT.filter((c) => c.pendingReview).length
    },
    recentEdits: byRecent.slice(0, 6).map(({ id, entityType, label, status, updatedAt, updatedBy }) => ({
      id,
      entityType,
      label,
      status,
      updatedAt,
      updatedBy
    })),
    // Real Media library uploads (newest first).
    recentMedia: (await listMedia()).slice(0, 4).map((m) => ({ id: m.id, filename: m.originalName, mime: m.mime, sizeKb: Math.round(m.size / 1024), uploadedAt: m.uploadedAt, uploadedBy: m.uploadedBy?.name ?? '' }))
  }
})

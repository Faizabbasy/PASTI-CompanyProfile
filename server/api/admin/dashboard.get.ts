// Admin dashboard: real CMS data only (records, public flags, audit log,
// Media library). See server/utils/cms/dashboard.ts. Read-only.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'cms.view')
  const { items, totals, pending, media, activity } = await buildDashboard(event)
  return {
    user: toPublicUser(user),
    totals,
    items,
    pending: pending.slice(0, 12),
    pendingTotal: pending.length,
    activity,
    recentMedia: media.slice(0, 4).map((m) => ({ id: m.id, filename: m.originalName, mime: m.mime, sizeKb: Math.round(m.size / 1024), uploadedAt: m.uploadedAt, uploadedBy: m.uploadedBy?.name ?? '' }))
  }
})

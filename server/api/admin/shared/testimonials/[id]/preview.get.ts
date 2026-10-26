// Authenticated draft preview data for one testimonial (ADMIN + EDITOR).
// Under /api/admin, so the session + no-store/noindex rules apply.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.preview')
  const r = await testimonialsCollection.read(getRouterParam(event, 'id') ?? '')
  await audit(event, { action: 'testimonial.preview', entityType: 'testimonial', entityId: r.id, metadata: { draftVersion: r.draft.version, revision: r.draft.revision } })
  const res = await testimonialAdminResponse(r)
  return {
    record: { id: r.id, status: r.status, version: r.draft.version, updatedAt: r.draft.updatedAt, content: r.draft.content },
    approval: res.state.extra.approval,
    publicEligible: res.state.extra.publicEligible
  }
})

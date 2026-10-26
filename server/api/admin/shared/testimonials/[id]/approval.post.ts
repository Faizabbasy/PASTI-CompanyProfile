import { TestimonialApprovalBodySchema } from '#shared/utils/testimonialSchema'

// Publication approval. ADMIN + EDITOR may lower it (needs_approval /
// hidden — takes effect immediately); only an ADMIN (claims.approve) may set
// `confirmed`, which covers the current draft wording (revision-pinned).
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.edit')
  const { user } = await requirePermission(event, 'content.saveDraft')
  const { revision, approval } = await readZodBody(event, TestimonialApprovalBodySchema)
  return testimonialAdminResponse(await setTestimonialApproval(event, user, getRouterParam(event, 'id') ?? '', revision, approval))
})

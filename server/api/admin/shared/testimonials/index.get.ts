// Testimonials list (admin): drafts included, with approval, public
// eligibility and page-reference flags. Filtering and search run client-side
// over this small collection.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  return listTestimonialRows()
})

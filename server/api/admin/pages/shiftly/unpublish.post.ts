// ADMIN only. published|archived → draft; the public stops receiving SHIFTLY.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return setShiftlyStatus(event, user, 'draft')
})

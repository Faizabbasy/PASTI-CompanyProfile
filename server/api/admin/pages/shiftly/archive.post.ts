// ADMIN only. draft|published → archived; the public stops receiving SHIFTLY.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return shiftlyFor(cmsLang(event)).setStatus(event, user, 'archived')
})

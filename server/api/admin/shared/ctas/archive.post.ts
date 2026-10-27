// ADMIN only. draft|published → archived; the public stops receiving Global CTAs.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.archive')
  return sharedPages.ctas.forLocale(cmsLang(event)).setStatus(event, user, 'archived')
})

// ADMIN only. published|archived → draft; the public stops receiving Global CTAs.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.unpublish')
  return sharedPages.ctas.forLocale(cmsLang(event)).setStatus(event, user, 'draft')
})

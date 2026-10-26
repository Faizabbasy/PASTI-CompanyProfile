// Global CTAs CMS state: working draft + publication metadata.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  return sharedPages.ctas.getState()
})

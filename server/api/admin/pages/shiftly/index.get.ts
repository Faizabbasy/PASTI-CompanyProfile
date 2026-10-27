// SHIFTLY CMS state: working draft + publication metadata.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  return shiftlyFor(cmsLang(event)).getState()
})

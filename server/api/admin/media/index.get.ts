// Media library listing (ADMIN + EDITOR), newest first, with where each image
// is used. `configured` tells the admin UI whether uploads are possible.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'cms.view')
  const items = await listMedia()
  const usage = await mediaUsage(items.map((m) => m.url))
  return {
    configured: !!mediaStorageConfig(event),
    items: items.map((m) => ({ ...m, usedIn: usage.get(m.url) ?? [] }))
  }
})

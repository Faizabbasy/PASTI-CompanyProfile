// Delete an image (ADMIN, content.delete). Refused while any page or record
// still uses it — remove it there first, so no live page loses an image.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'content.delete')
  const id = getRouterParam(event, 'id') ?? ''
  return withCmsLock(`media:${id}`, async () => {
    const media = await getMedia(id)
    if (!media) throw createError({ statusCode: 404, statusMessage: 'Image not found.' })
    const used = (await mediaUsage([media.url])).get(media.url) ?? []
    if (used.length) {
      throw createError({ statusCode: 409, statusMessage: `Still used in: ${used.map((u) => u.label).join(', ')}. Replace it there first.` })
    }
    const cfg = requireMediaStorage(event)
    await deleteFromStorage(cfg, media.key)
    await removeMediaRecord(media.id)
    await audit(event, { action: 'media.delete', entityType: 'media', entityId: media.id, userId: user.id, metadata: { key: media.key } })
    return { ok: true }
  })
})

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') || ''
  // Drafts and archived items 404 exactly like unknown ids.
  const item = /^[a-z0-9-]{1,80}$/.test(id) ? getPublishedContent(id) : null
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return item
})

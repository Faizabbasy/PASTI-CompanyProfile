export default defineEventHandler(() => {
  return { items: listPublishedContent() }
})

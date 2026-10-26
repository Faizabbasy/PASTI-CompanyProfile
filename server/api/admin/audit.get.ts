// ADMIN only.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'users.manage')
  const raw = Number(getQuery(event).limit)
  const limit = Number.isInteger(raw) && raw > 0 ? Math.min(raw, 200) : 50
  return { entries: await listAudit(limit) }
})

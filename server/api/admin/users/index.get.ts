// ADMIN only. Read-only list in Step 1; user mutations arrive later.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'users.manage')
  const users = await listUsers()
  return { users: users.map(toPublicUser) }
})

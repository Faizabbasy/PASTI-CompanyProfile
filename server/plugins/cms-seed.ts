// Dev-only seed for the two dummy CMS accounts. Runs when the users store is
// empty, in `nuxt dev` or when NUXT_CMS_ALLOW_SEED=true. Passwords come from
// env only (.env.example). Reseed by deleting .data/cms.

const SEED_USERS = [
  { email: 'admin@pastipeople.local', name: 'Dummy Admin', role: 'ADMIN', envKey: 'seedAdminPassword' },
  { email: 'editor@pastipeople.local', name: 'Dummy Editor', role: 'EDITOR', envKey: 'seedEditorPassword' }
] as const

export default defineNitroPlugin(async () => {
  let cfg: ReturnType<typeof cmsConfig>
  try {
    cfg = cmsConfig()
  } catch {
    console.warn('[cms] NUXT_CMS_SESSION_SECRET missing or too short — admin CMS disabled')
    return
  }
  if (!import.meta.dev && !cfg.allowSeed) return

  const existing = await cmsStorage().getKeys('users')
  if (existing.length > 0) return

  for (const seed of SEED_USERS) {
    const password = cfg[seed.envKey]
    if (password.length < 12) {
      console.warn(`[cms] skipping seed for ${seed.email}: NUXT_CMS_${seed.envKey.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()} unset or < 12 chars`)
      continue
    }
    const user = await createUser({ email: seed.email, name: seed.name, role: seed.role, password })
    await audit(null, { action: 'user.create', entityType: 'user', entityId: user.id, userId: null, metadata: { email: user.email, role: user.role, source: 'seed' } })
    console.info(`[cms] seeded ${seed.role} ${seed.email}`)
  }
})

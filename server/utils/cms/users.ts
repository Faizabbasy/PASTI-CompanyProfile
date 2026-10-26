import { randomUUID } from 'node:crypto'
import type { CmsPublicUser, CmsRole } from '#shared/utils/cmsPermissions'
import type { CmsUser } from './types'

const userKey = (id: string) => `users:${id}`
const emailKey = (email: string) => `email-index:${normalizeEmail(email)}`

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function getUserById(id: string): Promise<CmsUser | null> {
  if (!/^[a-f0-9-]{36}$/.test(id)) return null
  return (await cmsStorage().getItem<CmsUser>(userKey(id))) ?? null
}

export async function getUserByEmail(email: string): Promise<CmsUser | null> {
  const id = await cmsStorage().getItem<string>(emailKey(email))
  return id ? getUserById(id) : null
}

export async function listUsers(): Promise<CmsUser[]> {
  const keys = await cmsStorage().getKeys('users')
  const users = await Promise.all(keys.map((k) => cmsStorage().getItem<CmsUser>(k)))
  return users.filter((u): u is CmsUser => !!u).sort((a, b) => a.email.localeCompare(b.email))
}

export async function createUser(input: {
  email: string
  name: string
  role: CmsRole
  password: string
}): Promise<CmsUser> {
  const email = normalizeEmail(input.email)
  if (await getUserByEmail(email)) {
    throw createError({ statusCode: 409, statusMessage: 'User already exists' })
  }
  const now = new Date().toISOString()
  const user: CmsUser = {
    id: randomUUID(),
    email,
    name: input.name,
    role: input.role,
    passwordHash: await hashPassword(input.password),
    createdAt: now,
    updatedAt: now
  }
  await cmsStorage().setItem(userKey(user.id), user)
  await cmsStorage().setItem(emailKey(email), user.id)
  return user
}

export function toPublicUser(user: CmsUser): CmsPublicUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

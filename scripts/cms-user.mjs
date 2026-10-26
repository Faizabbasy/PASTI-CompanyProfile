#!/usr/bin/env node
// Manage real CMS accounts in the CMS store (Postgres when NUXT_CMS_DATABASE_URL
// is set, else .data/cms). The password is typed at a hidden prompt — never
// passed as an argument, never printed.
//
//   npm run cms:user -- list
//   npm run cms:user -- create --email you@company.com --name "Your Name" --role ADMIN
//   (add --visible if the masked password prompt doesn't take input)
//   npm run cms:user -- password --email you@company.com
//   npm run cms:user -- disable --email admin@pastipeople.local
//   npm run cms:user -- enable --email admin@pastipeople.local
//
// Changing a password or disabling an account also signs that user out
// (their sessions are deleted).

import { createJiti } from 'jiti'
import { randomUUID } from 'node:crypto'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { openCmsStore } from './lib/cms-store.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TAG = '[cms-user]'
const ROLES = ['ADMIN', 'EDITOR']

const [command, ...rest] = process.argv.slice(2)
const opts = {}
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--')) opts[rest[i].slice(2)] = rest[i + 1]
}

function fail(msg) {
  console.error(`${TAG} ${msg}`)
  process.exit(1)
}

// --visible: plain line input (password shows on screen) for terminals where
// the masked prompt doesn't receive keystrokes.
function promptVisible(question) {
  return new Promise((res) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    rl.question(question, (answer) => {
      rl.close()
      res(answer.trim())
    })
  })
}

function promptHidden(question) {
  if ('visible' in opts || !process.stdin.isTTY) return promptVisible(question)
  return new Promise((res) => {
    const stdin = process.stdin
    process.stdout.write(question)
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')
    let value = ''
    // A paste arrives as one chunk, so walk it character by character.
    // Bracketed-paste markers (ESC[200~ / ESC[201~) are terminal noise, not password.
    const onData = (chunk) => {
      for (const ch of chunk.replace(/\u001b\[20[01]~/g, '')) {
        if (ch === '\r' || ch === '\n' || ch === '\u0004') {
          stdin.setRawMode(false)
          stdin.pause()
          stdin.off('data', onData)
          process.stdout.write('\n')
          res(value)
          return
        } else if (ch === '\u0003') {
          process.stdout.write('\n')
          process.exit(130)
        } else if (ch === '\u007f' || ch === '\b') {
          if (value) process.stdout.write('\b \b')
          value = value.slice(0, -1)
        } else if (ch >= ' ') {
          value += ch
          process.stdout.write('*')
        }
      }
    }
    stdin.on('data', onData)
  })
}

async function askPassword() {
  const pw = await promptHidden('Password (min 12 chars): ')
  if (pw.length < 12) fail('password must be at least 12 characters')
  const again = await promptHidden('Repeat password: ')
  if (pw !== again) fail('passwords do not match')
  return pw
}

const jiti = createJiti(import.meta.url, { interopDefault: true })
const { hashPassword } = await jiti.import(resolve(root, 'server/utils/cms/password.ts'))
const store = await openCmsStore(root)

const normEmail = (e) => String(e ?? '').trim().toLowerCase()
const emailKey = (e) => `email-index:${normEmail(e)}`

async function findUser(email) {
  const id = await store.getItem(emailKey(email))
  const user = id ? await store.getItem(`users:${id}`) : null
  if (!user) fail(`no account for ${normEmail(email)}`)
  return user
}

async function dropSessions(userId) {
  let n = 0
  for (const key of await store.getKeys('sessions')) {
    const s = await store.getItem(key)
    if (s?.userId === userId) {
      await store.removeItem(key)
      n++
    }
  }
  return n
}

// Same record + key shape as server/utils/cms/audit.ts.
async function audit(action, user, metadata = {}) {
  const timestamp = new Date().toISOString()
  const id = randomUUID()
  await store.setItem(`audit:${timestamp.replace(/[:.]/g, '')}-${id.slice(0, 8)}`, {
    id, userId: null, action, entityType: 'user', entityId: user.id, timestamp,
    metadata: { email: user.email, source: 'cms-user-script', ...metadata }
  })
}

switch (command) {
  case 'list': {
    for (const key of await store.getKeys('users')) {
      const u = await store.getItem(key)
      if (u) console.log(`${u.disabled ? 'DISABLED' : 'active  '}  ${u.role.padEnd(6)}  ${u.email}  (${u.name})`)
    }
    break
  }
  case 'create': {
    const email = normEmail(opts.email)
    const name = String(opts.name ?? '').trim()
    const role = String(opts.role ?? '').toUpperCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('--email is missing or invalid')
    if (!name) fail('--name is required')
    if (!ROLES.includes(role)) fail(`--role must be ${ROLES.join(' or ')}`)
    if (await store.getItem(emailKey(email))) fail(`${email} already exists (use "password" to reset it)`)
    const password = await askPassword()
    const now = new Date().toISOString()
    const user = { id: randomUUID(), email, name, role, passwordHash: await hashPassword(password), createdAt: now, updatedAt: now }
    await store.setItem(`users:${user.id}`, user)
    await store.setItem(emailKey(email), user.id)
    await audit('user.create', user, { role })
    console.log(`${TAG} created ${role} ${email}`)
    break
  }
  case 'password': {
    const user = await findUser(opts.email)
    const password = await askPassword()
    await store.setItem(`users:${user.id}`, { ...user, passwordHash: await hashPassword(password), updatedAt: new Date().toISOString() })
    const n = await dropSessions(user.id)
    await audit('user.passwordReset', user)
    console.log(`${TAG} password changed for ${user.email} (${n} session(s) signed out)`)
    break
  }
  case 'disable':
  case 'enable': {
    const user = await findUser(opts.email)
    const disabled = command === 'disable'
    await store.setItem(`users:${user.id}`, { ...user, disabled, updatedAt: new Date().toISOString() })
    const n = disabled ? await dropSessions(user.id) : 0
    await audit(disabled ? 'user.disable' : 'user.enable', user)
    console.log(`${TAG} ${user.email} ${disabled ? `disabled (${n} session(s) signed out)` : 'enabled'}`)
    break
  }
  default:
    fail('usage: npm run cms:user -- list | create --email E --name N --role ADMIN|EDITOR | password --email E | disable --email E | enable --email E')
}

await store.dispose?.()
process.exit(0)

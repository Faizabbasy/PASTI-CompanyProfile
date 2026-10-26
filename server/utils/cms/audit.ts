import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'
import type { AuditAction, AuditEntry } from './types'

const SECRET_KEY = /pass|token|secret|hash|cookie|csrf/i

function scrub(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[truncated]'
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => scrub(v, depth + 1))
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = SECRET_KEY.test(k) ? '[redacted]' : scrub(v, depth + 1)
    }
    return out
  }
  if (typeof value === 'string') return value.slice(0, 500)
  return value
}

export async function audit(
  event: H3Event | null,
  entry: {
    action: AuditAction
    entityType: string
    entityId?: string | null
    userId?: string | null
    metadata?: Record<string, unknown>
  }
): Promise<void> {
  const timestamp = new Date().toISOString()
  const record: AuditEntry = {
    id: randomUUID(),
    userId: entry.userId ?? event?.context.cmsSession?.user.id ?? null,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId ?? null,
    timestamp,
    metadata: scrub({ ...entry.metadata, ...(event ? { ip: clientIp(event) } : {}) }) as Record<string, unknown>
  }
  // Key sorts chronologically; ':' is unstorage's separator, so strip it.
  const key = `audit:${timestamp.replace(/[:.]/g, '')}-${record.id.slice(0, 8)}`
  try {
    await cmsStorage().setItem(key, record)
  } catch (err) {
    // An audit write failure must not leak details to the client.
    console.error('[cms] audit write failed', err)
  }
}

export async function listAudit(limit = 50): Promise<AuditEntry[]> {
  const keys = (await cmsStorage().getKeys('audit')).sort().reverse().slice(0, limit)
  const entries = await Promise.all(keys.map((k) => cmsStorage().getItem<AuditEntry>(k)))
  return entries.filter((e): e is AuditEntry => !!e)
}

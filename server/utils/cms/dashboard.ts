import type { H3Event } from 'h3'
import type { ActorRef, PageStatus } from '#shared/cms/fields'
import type { AuditEntry } from './types'

// Admin dashboard — built only from real CMS data:
//   - every singleton record (pages, products, shared content) and every
//     collection record, read RAW from storage (never seeds dummy content)
//   - the public flags (is the published version actually used by the site?)
//   - the audit log (who changed what, when)
// Nothing here writes.

interface StoredRecord {
  id: string
  dummy?: boolean
  status: PageStatus
  draft: { version: number; changedSincePublish: boolean; updatedAt: string; updatedBy: ActorRef; content?: Record<string, unknown> }
  published: { version: number; publishedAt: string } | null
  updatedAt: string
  updatedBy: ActorRef
}

type Flag = keyof ReturnType<typeof cmsPublicFlags>
type Group = 'Pages' | 'Products' | 'Shared Content' | 'Work' | 'Insights'

// Singletons: record id → label, group, editor, public flag.
const SINGLETONS: { id: string; label: string; group: Group; to: string; flag: Flag }[] = [
  { id: 'technology', label: 'Technology', group: 'Pages', to: '/admin/pages/technology', flag: 'technologyPublicEnabled' },
  { id: 'creative', label: 'Creative', group: 'Pages', to: '/admin/pages/creative', flag: 'creativePublicEnabled' },
  { id: 'about', label: 'About', group: 'Pages', to: '/admin/pages/about', flag: 'aboutPublicEnabled' },
  { id: 'contact', label: 'Contact', group: 'Pages', to: '/admin/pages/contact', flag: 'contactPublicEnabled' },
  { id: 'open', label: 'OPEN', group: 'Products', to: '/admin/products/open', flag: 'openPublicEnabled' },
  { id: 'shiftly', label: 'SHIFTLY', group: 'Products', to: '/admin/products/shiftly', flag: 'shiftlyPublicEnabled' },
  { id: 'e-corporate', label: 'e-CORPORATE', group: 'Products', to: '/admin/products/e-corporate', flag: 'ecorporatePublicEnabled' },
  { id: 'fast', label: 'FAST', group: 'Products', to: '/admin/products/fast', flag: 'fastPublicEnabled' },
  { id: 'dora', label: 'DORA', group: 'Products', to: '/admin/products/dora', flag: 'doraPublicEnabled' },
  { id: 'matrix', label: 'MATRIX', group: 'Products', to: '/admin/products/matrix', flag: 'matrixPublicEnabled' },
  { id: 'work', label: 'Work page', group: 'Work', to: '/admin/work', flag: 'workPublicEnabled' },
  { id: 'insights', label: 'Insights page', group: 'Insights', to: '/admin/insights', flag: 'insightsPublicEnabled' },
  { id: 'clients', label: 'Clients', group: 'Shared Content', to: '/admin/shared/clients', flag: 'clientsPublicEnabled' },
  { id: 'faqs', label: 'FAQs', group: 'Shared Content', to: '/admin/shared/faqs', flag: 'faqsPublicEnabled' },
  { id: 'ctas', label: 'Global CTAs', group: 'Shared Content', to: '/admin/shared/ctas', flag: 'ctasPublicEnabled' }
]

// Collections: storage name → label, group, list/editor paths, public flag,
// and how to name one record.
const COLLECTIONS: { name: string; entityType: string; label: string; group: Group; to: string; flag: Flag; title: (c: Record<string, unknown>) => string }[] = [
  { name: 'projects', entityType: 'project', label: 'Projects', group: 'Work', to: '/admin/work/projects', flag: 'workPublicEnabled', title: (c) => String(c.name ?? '') },
  { name: 'case-studies', entityType: 'caseStudy', label: 'Case Studies', group: 'Work', to: '/admin/work/case-studies', flag: 'workPublicEnabled', title: (c) => String(c.slug ?? '') },
  { name: 'articles', entityType: 'article', label: 'Articles', group: 'Insights', to: '/admin/insights/articles', flag: 'insightsPublicEnabled', title: (c) => String(c.title ?? '') },
  { name: 'article-categories', entityType: 'category', label: 'Topik', group: 'Insights', to: '/admin/insights/categories', flag: 'insightsPublicEnabled', title: (c) => String(c.name ?? '') },
  { name: 'testimonials', entityType: 'testimonial', label: 'Testimonials', group: 'Shared Content', to: '/admin/shared/testimonials', flag: 'testimonialsPublicEnabled', title: (c) => String(c.personName ?? '') }
]

// "Needs publishing": saved changes the site doesn't have yet.
const needsPublish = (r: StoredRecord) => r.status !== 'archived' && r.draft.changedSincePublish

export interface DashboardItem {
  key: string
  label: string
  group: Group
  to: string
  status: PageStatus | 'none'
  dummy: boolean
  needsPublish: boolean
  live: boolean
  flagOn: boolean
  updatedAt: string | null
  updatedBy: string | null
  // Collections only: number of records per state.
  counts?: { published: number; draft: number; archived: number; needsPublish: number }
}

export async function buildDashboard(event: H3Event) {
  const store = cmsStorage()
  const flags = cmsPublicFlags(event)
  const items: DashboardItem[] = []
  const labels = new Map<string, { label: string; to: string }>()
  const totals = { published: 0, draft: 0, archived: 0, needsPublish: 0 }
  const pending: { label: string; to: string; group: Group; updatedAt: string; neverPublished: boolean }[] = []
  const count = (r: StoredRecord) => {
    if (r.dummy) return
    totals[r.status] += 1
    if (needsPublish(r)) totals.needsPublish += 1
  }

  for (const s of SINGLETONS) {
    labels.set(`page:${s.id}`, { label: s.label, to: s.to })
    labels.set(`shared:${s.id}`, { label: s.label, to: s.to })
    const r = await store.getItem<StoredRecord>(`pages:${s.id}`)
    const flagOn = flags[s.flag]
    if (!r) {
      items.push({ key: s.id, label: s.label, group: s.group, to: s.to, status: 'none', dummy: false, needsPublish: false, live: false, flagOn, updatedAt: null, updatedBy: null })
      continue
    }
    count(r)
    const np = !r.dummy && needsPublish(r)
    if (np) pending.push({ label: s.label, to: s.to, group: s.group, updatedAt: r.draft.updatedAt, neverPublished: !r.published })
    items.push({
      key: s.id,
      label: s.label,
      group: s.group,
      to: s.to,
      status: r.status,
      dummy: !!r.dummy,
      needsPublish: np,
      live: flagOn && r.status === 'published' && !r.dummy,
      flagOn,
      updatedAt: r.draft.updatedAt,
      updatedBy: r.draft.updatedBy?.name ?? null
    })
  }

  for (const c of COLLECTIONS) {
    const keys = await store.getKeys(`collections:${c.name}`)
    const recs = (await Promise.all(keys.map((k) => store.getItem<StoredRecord>(k)))).filter((r): r is StoredRecord => !!r)
    const real = recs.filter((r) => !r.dummy)
    const cc = { published: 0, draft: 0, archived: 0, needsPublish: 0 }
    let latest: StoredRecord | null = null
    for (const r of recs) {
      const title = c.title(r.draft.content ?? {}) || r.id
      labels.set(`${c.entityType}:${r.id}`, { label: `${c.label} · ${title}`, to: `${c.to}/${r.id}` })
      if (r.dummy) continue
      count(r)
      cc[r.status] += 1
      if (needsPublish(r)) {
        cc.needsPublish += 1
        pending.push({ label: `${c.label} · ${title}`, to: `${c.to}/${r.id}`, group: c.group, updatedAt: r.draft.updatedAt, neverPublished: !r.published })
      }
      if (!latest || r.draft.updatedAt > latest.draft.updatedAt) latest = r
    }
    items.push({
      key: c.name,
      label: c.label,
      group: c.group,
      to: c.to,
      status: real.length ? (cc.published ? 'published' : cc.draft ? 'draft' : 'archived') : 'none',
      dummy: recs.length > 0 && real.length === 0,
      needsPublish: cc.needsPublish > 0,
      live: flags[c.flag] && cc.published > 0,
      flagOn: flags[c.flag],
      updatedAt: latest?.draft.updatedAt ?? null,
      updatedBy: latest?.draft.updatedBy?.name ?? null,
      counts: cc
    })
  }

  pending.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const media = await listMedia()
  return { items, totals, pending, media, activity: await recentActivity(labels, new Map(media.map((m) => [m.id, m.originalName]))) }
}

// Content actions only (no logins / previews), newest first.
const ACTIVITY = /\.(update|publish|unpublish|archive|migrate|create|delete|approvalChange)$|^(create|update|publish|unpublish|archive|delete|media\.upload|media\.delete)$/
const VERB: Record<string, string> = {
  update: 'menyimpan draft',
  create: 'membuat',
  publish: 'mem-publish',
  unpublish: 'menarik dari website',
  archive: 'mengarsipkan',
  delete: 'menghapus',
  migrate: 'memindahkan konten situs ke CMS',
  approvalChange: 'mengubah persetujuan',
  upload: 'meng-upload gambar',
  statusChange: 'mengubah status'
}

async function recentActivity(labels: Map<string, { label: string; to: string }>, mediaNames: Map<string, string>) {
  const keys = (await cmsStorage().getKeys('audit')).sort().reverse().slice(0, 400)
  const out: { id: string; at: string; who: string; verb: string; label: string; to: string | null }[] = []
  const users = new Map((await listUsers()).map((u) => [u.id, u.name]))
  for (const k of keys) {
    if (out.length >= 12) break
    const e = await cmsStorage().getItem<AuditEntry>(k)
    if (!e || !ACTIVITY.test(e.action)) continue
    const verbKey = e.action.split('.').pop()!
    const ref = labels.get(`${e.entityType}:${e.entityId}`)
    const media = e.action.startsWith('media.')
    out.push({
      id: e.id,
      at: e.timestamp,
      who: e.userId ? users.get(e.userId) ?? 'Pengguna terhapus' : 'Sistem (migrasi)',
      verb: VERB[verbKey] ?? verbKey,
      label: media ? mediaNames.get(e.entityId ?? '') ?? 'gambar (sudah dihapus)' : ref?.label ?? (e.entityId ?? e.entityType),
      to: media ? '/admin/media' : ref?.to ?? null
    })
  }
  return out
}

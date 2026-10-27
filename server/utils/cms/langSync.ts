import { isMediaRef } from '#shared/cms/fields'

// Bilingual CMS: what a Save Draft in one language copies into the other
// language's draft. Text stays per language; two kinds of value are shared:
//
//   images  — every media reference, wherever it sits (owner decision
//             2026-10-27). List items are matched by position when both
//             lists have the same length, else by id (ids can differ per
//             language); an item with no counterpart is skipped.
//   shared  — language-neutral fields named per record type (slug, year,
//             relations, which items a page shows and in what order …),
//             copied whole when they change.

export type MediaChange = { path: (string | number)[]; ids: (string | undefined)[]; value: string }
export interface LangSync {
  media: MediaChange[]
  shared: { path: string; value: unknown }[]
}

const getPath = (obj: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj)

function mediaChanges(before: unknown, after: unknown): MediaChange[] {
  const out: MediaChange[] = []
  const walk = (a: unknown, b: unknown, path: (string | number)[], ids: (string | undefined)[]) => {
    if (typeof b === 'string') {
      if (a !== b && (isMediaRef(b) || (typeof a === 'string' && isMediaRef(a)))) out.push({ path, ids, value: b })
      return
    }
    if (Array.isArray(b)) {
      const prev = Array.isArray(a) ? a : []
      b.forEach((item, i) => {
        const itemId = (item as { id?: unknown } | null)?.id
        const id = typeof itemId === 'string' ? itemId : undefined
        const match = id ? prev.find((p) => (p as { id?: unknown } | null)?.id === id) : prev[i]
        walk(match, item, [...path, i], [...ids, id])
      })
      return
    }
    if (b && typeof b === 'object') {
      const prev = a && typeof a === 'object' ? (a as Record<string, unknown>) : {}
      for (const [k, v] of Object.entries(b)) walk(prev[k], v, [...path, k], [...ids, undefined])
    }
  }
  walk(before, after, [], [])
  return out
}

/** What changed between the stored draft and the saved one that the other language must follow. */
export function langSyncOf(before: unknown, after: unknown, sharedPaths: readonly string[] = []): LangSync {
  const shared = sharedPaths
    .filter((p) => JSON.stringify(getPath(before, p)) !== JSON.stringify(getPath(after, p)))
    .map((p) => ({ path: p, value: structuredClone(getPath(after, p)) }))
  return { media: mediaChanges(before, after), shared }
}

export const langSyncEmpty = (s: LangSync) => s.media.length === 0 && s.shared.length === 0

/**
 * Writes the changes (taken from `source`, the saved draft) into `target` in
 * place. Returns how many images and shared fields actually changed there.
 */
export function applyLangSync(target: unknown, source: unknown, sync: LangSync): { images: number; fields: number } {
  let fields = 0
  for (const s of sync.shared) {
    const keys = s.path.split('.')
    const last = keys.pop()!
    const parent = keys.length ? getPath(target, keys.join('.')) : target
    if (!parent || typeof parent !== 'object' || Array.isArray(parent)) continue
    const rec = parent as Record<string, unknown>
    if (JSON.stringify(rec[last]) === JSON.stringify(s.value)) continue
    rec[last] = structuredClone(s.value)
    fields++
  }

  let images = 0
  for (const c of sync.media) {
    let node: unknown = target
    let src: unknown = source
    for (let d = 0; d < c.path.length - 1 && node; d++) {
      const seg = c.path[d]!
      if (Array.isArray(node)) {
        const id = c.ids[d]
        const sameShape = Array.isArray(src) && src.length === node.length
        node = sameShape ? node[seg as number] : id ? node.find((x) => (x as { id?: unknown } | null)?.id === id) : undefined
        src = Array.isArray(src) ? src[seg as number] : undefined
      } else {
        node = (node as Record<string, unknown>)[seg as string]
        src = (src as Record<string, unknown> | undefined)?.[seg as string]
      }
    }
    const last = c.path[c.path.length - 1]!
    if (!node || typeof node !== 'object' || Array.isArray(node)) continue
    const rec = node as Record<string, unknown>
    if (typeof rec[last as string] !== 'string' || rec[last as string] === c.value) continue
    rec[last as string] = c.value
    images++
  }
  return { images, fields }
}

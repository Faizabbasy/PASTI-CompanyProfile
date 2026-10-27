import type { FieldDesc, ProductTab, SectionMap } from '#shared/cms/productFields'

// "Klik teks untuk edit" for the product previews (OPEN, SHIFTLY, e-CORPORATE,
// FAST, DORA, MATRIX). Their sections render a page composable that the CMS
// overlays field by field (productFields), so every editable value is known
// from the field map: path, plain label and the draft text. Instead of
// marking ~70 public components by hand, the preview finds the elements
// that SHOW each value and marks them (data-cms-href / data-cms-label, the
// same attributes useCmsMark sets), so AdminCmsPicker works unchanged and the
// public pages carry no marks at all.
//
// Matching, per value and within the value's own section (tab previewIndex):
// the deepest elements whose text equals it (spacing and a trailing period
// the design adds are ignored), else — for longer values set inside a bigger
// sentence — the deepest element that contains it and little else. Images
// match by src. Re-runs when the page changes (tabs, sheets, typed text).

export interface ProductMarkEntry { path: string; label: string; value: string; image: boolean; scope: number }

// Every text / image value of the draft with its editor path and a label
// built from the map ("Hero › Paragraf di bawah judul", "… › Item 3").
export function productMarkEntries(sections: SectionMap, content: Record<string, unknown>, tabs: readonly ProductTab[]): ProductMarkEntry[] {
  const out: Omit<ProductMarkEntry, 'scope'>[] = []
  const walk = (d: FieldDesc, v: unknown, path: string, crumbs: string[]) => {
    switch (d.k) {
      case 'text':
      case 'image':
        if (typeof v === 'string' && v.trim()) out.push({ path, label: [...crumbs, d.label].join(' › '), value: v, image: d.k === 'image' })
        return
      case 'strings':
        ;(v as unknown[] | undefined)?.forEach((s, i) => {
          if (typeof s === 'string' && s.trim()) out.push({ path: `${path}.${i}`, label: [...crumbs, d.label, `${d.itemLabel} ${i + 1}`].join(' › '), value: s, image: false })
        })
        return
      case 'cells':
        ;(v as unknown[] | undefined)?.forEach((s, i) => {
          if (typeof s === 'string' && s.trim()) out.push({ path: `${path}.${i}`, label: [...crumbs, d.label, `Kolom ${i + 1}`].join(' › '), value: s, image: false })
        })
        return
      case 'items':
        ;(v as unknown[] | undefined)?.forEach((item, i) => {
          for (const [k, f] of Object.entries(d.fields)) walk(f, (item as Record<string, unknown>)?.[k], `${path}.${i}.${k}`, [...crumbs, `${d.label} #${i + 1}`])
        })
        return
      case 'group':
        for (const [k, f] of Object.entries(d.fields)) walk(f, (v as Record<string, unknown>)?.[k], `${path}.${k}`, crumbs.length ? [...crumbs, d.label] : [d.label])
        return
      case 'tuple':
        d.items.forEach((g, i) => {
          for (const [k, f] of Object.entries(g.fields)) walk(f, (v as unknown[] | undefined)?.[i]?.[k as never], `${path}.${i}.${k}`, [...crumbs, d.label, g.label])
        })
    }
  }
  for (const [k, d] of Object.entries(sections)) walk(d, content[k], k, [])
  // Section of the preview each value sits in (the tab's previewIndex).
  const scopeOf = (path: string) => tabs.find((t) => t.sections.includes(path.split('.')[0]!))?.previewIndex ?? -1
  return out.map((e) => ({ ...e, scope: scopeOf(e.path) }))
}

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().replace(/[.!?。]+$/, '').toLowerCase()

// Marks one section (or the teleported layers on <body>). Values are matched
// longest first, so a short label never claims part of a sentence. The same
// text in several fields of a section (table cells, step names) is shared
// out in order: n elements for n fields one each; a desktop + phone copy of
// a list (2n elements) wraps round.
function markScope(scope: Element, entries: ProductMarkEntry[], href: (path: string) => string, skip?: (el: Element) => boolean) {
  const set = (el: Element, e: ProductMarkEntry) => {
    el.setAttribute('data-cms-href', href(e.path))
    el.setAttribute('data-cms-label', e.label)
    el.setAttribute('data-cms-auto', '')
  }
  // Animated illustrations swap their text after a mark was set: a mark whose
  // element no longer shows its field's value is dropped and matched again.
  const byHref = new Map(entries.map((e) => [href(e.path), e]))
  scope.querySelectorAll('[data-cms-auto]').forEach((el) => {
    if (skip?.(el)) return
    const e = byHref.get(el.getAttribute('data-cms-href') ?? '')
    if (!e) return
    const ok = e.image
      ? (el.getAttribute('src') ?? '').replace(/^https?:\/\/[^/]+/, '') === e.value.replace(/^https?:\/\/[^/]+/, '')
      : norm(el.textContent ?? '').includes(norm(e.value))
    if (!ok) ['data-cms-href', 'data-cms-label', 'data-cms-auto'].forEach((a) => el.removeAttribute(a))
  })
  const all = [...scope.querySelectorAll<HTMLElement>('*')].filter((el) => !el.closest('svg, [data-no-cms-mark], script, style') && !skip?.(el))
  const text = new Map(all.map((el) => [el, norm(el.textContent ?? '')]))
  const deepest = (hit: (t: string) => boolean) =>
    all.filter((el) => hit(text.get(el)!) && ![...el.children].some((c) => text.has(c as HTMLElement) && hit(text.get(c as HTMLElement)!)))
  // Fields already marked in an earlier pass keep their elements.
  const done = new Set([...scope.querySelectorAll('[data-cms-href]')].map((el) => el.getAttribute('data-cms-href')))

  const groups = new Map<string, ProductMarkEntry[]>()
  for (const e of entries) {
    if (done.has(href(e.path))) continue
    const key = e.image ? `img:${e.value.replace(/^https?:\/\/[^/]+/, '')}` : norm(e.value)
    if (key) groups.set(key, [...(groups.get(key) ?? []), e])
  }
  const ordered = [...groups.entries()].sort((a, b) => b[0].length - a[0].length)
  for (const [key, list] of ordered) {
    let els: Element[]
    if (key.startsWith('img:')) {
      const want = key.slice(4)
      els = [...scope.querySelectorAll('img')].filter((img) => (img.getAttribute('src') ?? '').replace(/^https?:\/\/[^/]+/, '') === want)
    } else {
      els = deepest((t) => t === key)
      if (!els.length && key.length >= 12) els = deepest((t) => t.includes(key)).filter((el) => text.get(el as HTMLElement)!.length <= key.length * 1.6 + 24)
    }
    els = els.filter((el) => !el.hasAttribute('data-cms-href'))
    if (!els.length) continue
    els.forEach((el, j) => set(el, list[j % list.length]!))
  }
}

function markAll(main: HTMLElement, entries: ProductMarkEntry[], href: (path: string) => string) {
  const sections = [...main.children]
  const byScope = new Map<number, ProductMarkEntry[]>()
  for (const e of entries) byScope.set(e.scope, [...(byScope.get(e.scope) ?? []), e])
  for (const [i, list] of byScope) {
    const el = sections[i]
    if (el) markScope(el, list, href)
  }
  // Sheets / dialogs teleported to <body> (outside the preview root).
  markScope(document.body, entries, href, (el) => main.contains(el))
}

export function useProductCmsMarks(opts: {
  root: () => HTMLElement | null
  entries: () => ProductMarkEntry[]
  editor: string
  lang: string
}) {
  const href = (path: string) => cmsFieldHref(opts.editor, opts.lang, path)
  let timer: number | undefined
  let last = 0
  let observer: MutationObserver | null = null
  // The whole body: teleported sheets / dialogs live outside the preview
  // root. The preview's own bar opts out with data-no-cms-mark.
  const run = () => {
    last = Date.now()
    const root = opts.root()
    if (root) markAll(root, opts.entries(), href)
  }
  // Counters and typed text change the DOM continuously: settle 350ms, and
  // never re-scan more than about once a second.
  const queue = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(run, Math.max(350, 1200 - (Date.now() - last)))
  }
  onMounted(() => {
    observer = new MutationObserver(queue)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    queue()
  })
  onBeforeUnmount(() => {
    observer?.disconnect()
    window.clearTimeout(timer)
  })
  return { refresh: queue }
}

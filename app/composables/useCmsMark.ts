import type { InjectionKey } from 'vue'

// "Klik teks untuk edit" in the admin draft previews. A preview page provides
// where each record is edited; the public section components mark every CMS
// value they render with its field path and a plain label. The marks only
// exist inside a preview (nothing is provided on the public site, so its HTML
// is unchanged). AdminCmsPicker turns the marks into hover outlines + links
// to `<editor>?field=<path>` (useSingletonEditor jumps to that field).
//
// `record`: which record the value belongs to — undefined = the page itself,
// otherwise a key the preview understands (e.g. `article:<slug>`).
export interface CmsMarkContext {
  href: (record: string | undefined, path: string) => string | null
}
const CMS_MARK_KEY: InjectionKey<CmsMarkContext> = Symbol('cms-mark')

export function provideCmsMarks(ctx: CmsMarkContext) {
  provide(CMS_MARK_KEY, ctx)
}

export function useCmsMark() {
  const ctx = inject(CMS_MARK_KEY, null)
  return (path: string, label: string, record?: string): Record<string, string> => {
    const href = ctx?.href(record, path)
    return href ? { 'data-cms-href': href, 'data-cms-label': label } : {}
  }
}

// Editor link with the field to open: keeps ?lang= and adds ?field=.
export const cmsFieldHref = (editor: string, lang: string, path: string) => `${editor}?lang=${lang}&field=${encodeURIComponent(path)}`

// Single-page previews (Technology, Creative, …). Records:
//   undefined          — a plain page field (`path` as the editor names it)
//   `<list path>#<n>`  — the n-th item the page SHOWS of that list; hidden
//                        items never reach the site, so n is mapped back to
//                        the item's place in the full draft list
// `extra` resolves the records other components use (e.g. a shared
// testimonial card shown on this page).
export function provideSingletonCmsMarks(
  editor: string,
  lang: string,
  draft: () => unknown,
  extra?: (record: string, path: string) => string | null
) {
  provideCmsMarks({
    href: (record, path) => {
      if (!record) return cmsFieldHref(editor, lang, path)
      const m = record.match(/^(.+)#(\d+)$/)
      if (!m) return extra?.(record, path) ?? null
      const list = m[1]!.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], draft())
      if (!Array.isArray(list)) return null
      const shown = list.map((it, k) => ((it as { active?: boolean }).active === false ? -1 : k)).filter((k) => k >= 0)
      const k = shown[Number(m[2])]
      return k === undefined ? null : cmsFieldHref(editor, lang, `${m[1]}.${k}${path ? `.${path}` : ''}`)
    }
  })
}

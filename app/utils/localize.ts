// Content translation overlay. Each content composable keeps its English data
// as the base and lays an Indonesian overlay (app/i18n/content/*.ts) on top
// when the page is Indonesian. The overlay mirrors the data's shape but holds
// ONLY translated text: anything it leaves out (ids, statuses, numbers,
// sample codes, image paths, keys the code compares) keeps its base value, so
// a translation can never break the page's logic. Arrays merge by index.

export type DeepPartial<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? (DeepPartial<U> | undefined)[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T

export function localize<T>(base: T, overlay: DeepPartial<T> | undefined | null): T {
  if (overlay === undefined || overlay === null) return base
  if (typeof base === 'string') return (typeof overlay === 'string' && overlay !== '' ? overlay : base) as T
  if (Array.isArray(base)) {
    const o = overlay as unknown[]
    return base.map((item, i) => localize(item, o[i] as never)) as T
  }
  if (base && typeof base === 'object') {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
    for (const [k, v] of Object.entries(overlay as Record<string, unknown>)) {
      if (k in out) out[k] = localize(out[k], v as never)
    }
    return out as T
  }
  return base
}

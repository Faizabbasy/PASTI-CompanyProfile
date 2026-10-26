import { z } from 'zod'
import { SeoSchema, mediaRef, text } from './fields'

// Field maps for the product pages (OPEN, SHIFTLY, e-CORPORATE, …).
//
// Each product page describes its editable copy ONCE as a field map: content
// groups that mirror the page's data composable (useOpen(), useShiftly() …).
// The same map drives the zod schema the API enforces, the admin form, the
// dummy seed, the migration pick and the public overlay — so they can never
// disagree. Lists have a FIXED item count (the layouts are drawn for it), and
// every field is required plain text: nothing on the page can end up empty
// or out of shape. Design, layout, ids and wiring are never in a map.
//
// Import from '#shared/cms/productFields' (not auto-imported).

export type FieldDesc =
  // spaceAfter: the code value ends in a space that joins it to the next
  // piece of a heading ("Ready to connect your " + mark). The CMS stores it
  // trimmed; the overlay adds the space back.
  | { k: 'text'; label: string; max: number; multiline?: boolean; hint?: string; spaceAfter?: boolean }
  | { k: 'strings'; label: string; n: number; max: number; itemLabel: string; hint?: string }
  | { k: 'items'; label: string; n: number; fields: Record<string, FieldDesc>; hint?: string }
  | { k: 'group'; label: string; fields: Record<string, FieldDesc>; hint?: string }
  | { k: 'tuple'; label: string; items: GroupDesc[]; hint?: string }
  | { k: 'cells'; label: string; n: number; max: number; hint?: string }
  // Image from the Media library (or an /images/ path). `aspect` = the frame
  // the design shows it in, e.g. '929/442' — upload images of that ratio.
  | { k: 'image'; label: string; aspect?: string; hint?: string }
export type GroupDesc = Extract<FieldDesc, { k: 'group' }>
// Top-level content keys mirror the page composable: usually a group, but a
// key can also be a plain list or text (useShiftly().compare, .modulesMore).
export type SectionMap = Record<string, FieldDesc>

// Admin tab = one visible section of the page, in page order. `where` tells
// the editor (in plain Indonesian) where it sits and what it looks like;
// `previewIndex` is the section's position in the admin preview, so
// "Lihat bagian ini" can scroll straight to it.
export interface ProductTab {
  key: string
  no: string
  label: string
  where: string
  sections: readonly string[]
  previewIndex?: number
}

type Opt = { multiline?: boolean; hint?: string; spaceAfter?: boolean }
export const t = (label: string, max: number, o: Opt = {}): FieldDesc => ({ k: 'text', label, max, ...o })
export const area = (label: string, max: number, hint?: string): FieldDesc => ({ k: 'text', label, max, multiline: true, ...(hint ? { hint } : {}) })
export const lines = (label: string, n: number, max: number, hint = 'Tiap baris tampil sebagai satu baris judul.'): FieldDesc => ({ k: 'strings', label, n, max, itemLabel: 'Baris', hint })
export const strs = (label: string, n: number, max: number, itemLabel = 'Item', hint?: string): FieldDesc => ({ k: 'strings', label, n, max, itemLabel, ...(hint ? { hint } : {}) })
export const items = (label: string, n: number, fields: Record<string, FieldDesc>, hint?: string): FieldDesc => ({ k: 'items', label, n, fields, ...(hint ? { hint } : {}) })
export const group = (label: string, fields: Record<string, FieldDesc>, hint?: string): GroupDesc => ({ k: 'group', label, fields, ...(hint ? { hint } : {}) })
export const tuple = (label: string, groups: GroupDesc[], hint?: string): FieldDesc => ({ k: 'tuple', label, items: groups, ...(hint ? { hint } : {}) })
export const cells = (label: string, n: number, max: number, hint?: string): FieldDesc => ({ k: 'cells', label, n, max, ...(hint ? { hint } : {}) })
export const image = (label: string, aspect?: string, hint?: string): FieldDesc => ({ k: 'image', label, ...(aspect ? { aspect } : {}), ...(hint ? { hint } : {}) })
// Card with a title + description — the most common list item.
export const lb = (labelMax: number, bodyMax: number, labelName = 'Judul', bodyName = 'Deskripsi', key: 'label' | 'name' | 'title' = 'label') => ({ [key]: t(labelName, labelMax), body: area(bodyName, bodyMax) })

// ---- schema ------------------------------------------------------------------

function toZod(d: FieldDesc): z.ZodTypeAny {
  switch (d.k) {
    case 'text':
      return text(d.max, { required: true })
    case 'strings':
      return z.array(text(d.max, { required: true })).length(d.n, `Harus tepat ${d.n} item — desainnya dibuat untuk ${d.n}.`)
    case 'items':
      return z.array(objectOf(d.fields)).length(d.n, `Harus tepat ${d.n} item — desainnya dibuat untuk ${d.n}.`)
    case 'group':
      return objectOf(d.fields)
    case 'tuple':
      return z.tuple(d.items.map((g) => objectOf(g.fields)) as unknown as [z.ZodTypeAny, ...z.ZodTypeAny[]])
    case 'cells':
      return z.array(z.union([z.literal(true), z.null(), text(d.max, { required: true })])).length(d.n)
    case 'image':
      return mediaRef.refine((v) => v !== '', 'Pilih gambar.')
  }
}
function objectOf(fields: Record<string, FieldDesc>) {
  return z.object(Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, toZod(f)]))).strict()
}

export type ProductValue = string | true | null | ProductValue[] | { [k: string]: ProductValue }
export interface ProductSeo { metaTitle: string; metaDescription: string; ogImage: string; canonicalUrl: string; noIndex: boolean }
export type ProductContent<K extends string = string> = { [P in K]: ProductValue } & { seo: ProductSeo }
// Any product page's content, for code shared by all of them.
export type AnyProductContent = { seo: ProductSeo } & Record<string, unknown>

export function productSeoSchema(descriptionMax = 170) {
  return SeoSchema.extend({ metaDescription: text(descriptionMax, { required: true }) }).strict()
}

// The keys are built from the map, so zod can't infer them — typed explicitly.
export function productContentSchema<C>(sections: SectionMap, seo = productSeoSchema()): z.ZodType<C> {
  return z
    .object({ ...Object.fromEntries(Object.entries(sections).map(([k, g]) => [k, toZod(g)])), seo })
    .strict() as unknown as z.ZodType<C>
}

// ---- pick / overlay / dummy ----------------------------------------------------

// Copies exactly the mapped fields out of `src` — nothing outside the map
// can pass through (migration from code data, public read path).
export function pickField(d: FieldDesc, src: unknown): ProductValue {
  switch (d.k) {
    case 'text':
      return d.spaceAfter ? String(src ?? '').trimEnd() : String(src ?? '')
    case 'image':
      return String(src ?? '')
    case 'strings':
      return (src as unknown[]).map((v) => String(v ?? ''))
    case 'items':
      return (src as unknown[]).map((v) => pickFields(d.fields, v))
    case 'group':
      return pickFields(d.fields, src)
    case 'tuple':
      return d.items.map((g, i) => pickFields(g.fields, (src as unknown[])[i]))
    case 'cells':
      return (src as unknown[]).map((v) => (v === true || v === null ? v : String(v ?? '')))
  }
}
function pickFields(fields: Record<string, FieldDesc>, src: unknown) {
  const o = (src ?? {}) as Record<string, unknown>
  return Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, pickField(f, o[k])]))
}
export function pickSections(sections: SectionMap, src: Record<string, unknown>): Record<string, ProductValue> {
  return Object.fromEntries(Object.keys(sections).map((k) => [k, pickField(sections[k]!, src[k])]))
}

// Lays mapped CMS values over a copy of `base`, keeping every unmapped key
// (ids, icons, module links, codes …) from the code data.
export function overlayField(d: FieldDesc, base: unknown, cms: unknown): unknown {
  switch (d.k) {
    case 'text':
      return d.spaceAfter ? `${String(cms ?? '').trimEnd()} ` : cms
    case 'image':
    case 'strings':
    case 'cells':
      return Array.isArray(cms) ? [...cms] : cms
    case 'items':
      return (cms as unknown[]).map((v, i) => overlayFields(d.fields, (base as unknown[] | undefined)?.[i], v))
    case 'group':
      return overlayFields(d.fields, base, cms)
    case 'tuple':
      return d.items.map((g, i) => overlayFields(g.fields, (base as unknown[] | undefined)?.[i], (cms as unknown[])[i]))
  }
}
function overlayFields(fields: Record<string, FieldDesc>, base: unknown, cms: unknown) {
  const out: Record<string, unknown> = { ...((base ?? {}) as Record<string, unknown>) }
  const c = (cms ?? {}) as Record<string, unknown>
  for (const [k, f] of Object.entries(fields)) out[k] = overlayField(f, out[k], c[k])
  return out
}
export function overlaySections(sections: SectionMap, target: Record<string, unknown>, content: Record<string, unknown>) {
  for (const k of Object.keys(sections)) target[k] = overlayField(sections[k]!, target[k], content[k])
}

// Seed content for an empty dev store: Lorem placeholders shaped like the map.
export function dummyField(d: FieldDesc): ProductValue {
  const lorem = (max: number) => '[Dummy] Lorem ipsum dolor sit amet'.slice(0, max).trim()
  switch (d.k) {
    case 'text':
      return lorem(d.max)
    case 'strings':
      return Array.from({ length: d.n }, () => lorem(d.max))
    case 'items':
      return Array.from({ length: d.n }, () => dummyFields(d.fields))
    case 'group':
      return dummyFields(d.fields)
    case 'tuple':
      return d.items.map((g) => dummyFields(g.fields))
    case 'cells':
      return Array.from({ length: d.n }, () => lorem(d.max))
    case 'image':
      return ''
  }
}
function dummyFields(fields: Record<string, FieldDesc>) {
  return Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, dummyField(f)]))
}
export function dummySections(sections: SectionMap) {
  return Object.fromEntries(Object.keys(sections).map((k) => [k, dummyField(sections[k]!)])) as Record<string, ProductValue>
}

// ---- public contract ------------------------------------------------------------

// What GET /api/public/pages/<product> returns. Always an explicit status;
// content is validated with the same map the admin API enforces, so an
// unexpected response falls back to the code content.
export function publicProductResponseSchema<C>(content: z.ZodType<C>) {
  return z.discriminatedUnion('status', [
    z.object({ status: z.literal('disabled') }),
    z.object({ status: z.literal('unpublished') }),
    z.object({ status: z.literal('published'), version: z.number().int(), publishedAt: z.string(), content })
  ])
}

import { z } from 'zod'
import { SeoSchema, text, type SingletonAdminState } from '#shared/cms/fields'

// OPEN product page (/open) — singleton on the shared singleton engine.
//
// One field map (OPEN_SECTIONS) drives everything: the zod schema the API
// enforces, the admin form, the dummy seed, the migration pick and the
// public adapter overlay. It mirrors the shape of useOpen() so the OPEN
// components keep reading the same object.
//
// Scope (owner decision 2026-10-26): the copy the owner listed — hero, every
// section's titles/copy/lists, and SEO. NOT editable, stays in code: ids and
// tab/module wiring (ecosystem node → tab, demo interest ids, method codes and
// stage diagrams), section tags, sub-headings, illustration mock-ups (record,
// approval demo, audit log, dashboard), the demo form's labels and behaviour,
// and the O+PEN wordmark. Every list has today's item count fixed: the
// layouts (dial, layer stack, tabs, comparison table) are drawn for it.
// Plain text only; every field is required (no section renders an empty slot).

export type OpenFieldDesc =
  | { k: 'text'; label: string; max: number; multiline?: boolean; hint?: string }
  | { k: 'strings'; label: string; n: number; max: number; itemLabel: string; hint?: string }
  | { k: 'items'; label: string; n: number; fields: Record<string, OpenFieldDesc>; hint?: string }
  | { k: 'group'; label: string; fields: Record<string, OpenFieldDesc>; hint?: string }
  | { k: 'tuple'; label: string; items: Extract<OpenFieldDesc, { k: 'group' }>[]; hint?: string }
  | { k: 'cells'; label: string; n: number; max: number; hint?: string }

type Opt = { multiline?: boolean; hint?: string }
const t = (label: string, max: number, o: Opt = {}): OpenFieldDesc => ({ k: 'text', label, max, ...o })
const area = (label: string, max: number, hint?: string): OpenFieldDesc => ({ k: 'text', label, max, multiline: true, ...(hint ? { hint } : {}) })
const lines = (label: string, n: number, max: number, hint?: string): OpenFieldDesc => ({ k: 'strings', label, n, max, itemLabel: 'Line', ...(hint ? { hint } : {}) })
const strs = (label: string, n: number, max: number, itemLabel = 'Item'): OpenFieldDesc => ({ k: 'strings', label, n, max, itemLabel })
const items = (label: string, n: number, fields: Record<string, OpenFieldDesc>, hint?: string): OpenFieldDesc => ({ k: 'items', label, n, fields, ...(hint ? { hint } : {}) })
const group = (label: string, fields: Record<string, OpenFieldDesc>, hint?: string) => ({ k: 'group' as const, label, fields, ...(hint ? { hint } : {}) })
const lb = (labelMax: number, bodyMax: number) => ({ label: t('Label', labelMax), body: area('Description', bodyMax) })

const TITLE_HINT = 'Each line renders on its own line of the heading.'

export const OPEN_SECTIONS = {
  hero: group('Hero', {
    origin: t('Hero eyebrow', 70),
    name: t('Product name', 20, { hint: 'Read by screen readers and search engines. The visible O+PEN logo is part of the design.' }),
    expansion: t('Product name — full form', 50),
    statement: area('Headline', 110),
    body: area('Supporting copy', 300),
    primaryCtaLabel: t('Primary button label', 28, { hint: 'Scrolls to the demo form.' }),
    secondaryCtaLabel: t('Secondary button label', 28, { hint: 'Scrolls to the problem section.' }),
    connectsIntro: t('“Connects” intro', 80),
    connects: strs('What OPEN connects', 7, 20, 'Word')
  }),
  problem: group('Procurement problem', {
    title: lines('Title', 2, 50, TITLE_HINT),
    intro: area('Intro', 120),
    pressures: strs('Pressures', 6, 24),
    symptoms: strs('Symptoms', 5, 30),
    verdict: lines('Verdict', 2, 45),
    realTitle: lines('Second title', 2, 45),
    realIntro: t('Second intro', 100),
    // Keys render at display size in a 5-column row: 6 characters max.
    questions: items('Questions', 5, { key: t('Key', 6, { hint: 'One short word — shown very large.' }), q: t('Question', 50) }),
    needsIntro: t('Needs intro', 50),
    needs: strs('Needs', 3, 30)
  }),
  notSaas: group('Not another SaaS', {
    title: lines('Title', 2, 40, TITLE_HINT),
    differsIntro: t('Intro', 80),
    differs: strs('What differs per organization', 6, 32),
    differsWord: t('Highlighted word', 20),
    saasLabel: t('SaaS label', 20),
    saas: strs('SaaS steps', 3, 16, 'Step'),
    openLabel: t('OPEN label', 50),
    open: strs('OPEN steps', 6, 16, 'Step'),
    line: lines('Closing line', 2, 60)
  }),
  framework: group('Framework overview', {
    title: lines('Title', 2, 45, TITLE_HINT),
    intro: area('Intro', 160),
    foundation: strs('Functional foundation', 9, 32),
    after: area('After the foundation', 200),
    notBlank: t('“Not blank page” line', 80),
    tagline: lines('Tagline', 2, 40),
    layers: items('Layers', 3, lb(40, 140)),
    adaptedBy: strs('Adapted by', 6, 24)
  }),
  ecosystem: group('Core ecosystem', {
    title: lines('Title', 2, 45, TITLE_HINT),
    body: area('Body', 200),
    note: area('Note', 220),
    nodes: items('Ecosystem functions (dial)', 10, lb(22, 70), 'Which module tab each function opens is set in code.'),
    components: items('Core components', 3, lb(32, 90)),
    pillars: items('Pillars', 5, lb(30, 80))
  }),
  modulesIntro: group('Core ecosystems intro', {
    title: lines('Title', 2, 45, TITLE_HINT),
    body: area('Body', 280)
  }),
  procurement: group('Procurement module', {
    label: t('Tab label', 30),
    tagline: t('Tab tagline', 50),
    title: lines('Title', 2, 40, TITLE_HINT),
    body: area('Body', 220),
    capabilities: strs('Capabilities', 8, 40),
    workflow: items('Workflow steps', 12, lb(28, 70)),
    methodsIntro: area('Procurement methods intro', 240),
    methods: items('Procurement methods', 3, { name: t('Name', 40), body: area('Description', 140), points: strs('Points', 4, 70, 'Point') }, 'Method codes and stage diagrams are set in code.'),
    methodsManaged: strs('Managed differences', 4, 40),
    methodsLine: t('Methods closing line', 60)
  }),
  vendor: group('Vendor Management', {
    label: t('Tab label', 30),
    tagline: t('Tab tagline', 50),
    title: lines('Title', 2, 45, TITLE_HINT),
    body: area('Body', 220),
    capabilities: strs('Capabilities', 6, 40),
    lifecycle: items('Vendor lifecycle', 9, lb(30, 90)),
    line: lines('Closing line', 2, 45),
    lineBody: area('Closing copy', 140)
  }),
  catalog: group('Catalog Management', {
    label: t('Tab label', 30),
    tagline: t('Tab tagline', 50),
    title: lines('Title', 2, 45, TITLE_HINT),
    body: area('Body', 200),
    capabilities: strs('Capabilities', 6, 40),
    types: {
      k: 'tuple',
      label: 'Catalog types',
      items: [
        group('Contract catalog', { label: t('Label', 30), body: area('Description', 120), points: strs('Points', 3, 45, 'Point') }),
        group('E-commerce catalog', { label: t('Label', 30), body: area('Description', 120), flow: strs('Flow', 5, 16, 'Step') })
      ]
    },
    controlled: items('Controlled over', 5, lb(20, 80)),
    controlledLine: area('Controlled line', 140),
    line: lines('Closing line', 2, 45)
  }),
  auction: group('e-Auction', {
    title: lines('Title', 2, 40, TITLE_HINT),
    body: area('Body', 180),
    line: lines('Line', 2, 45),
    // The active step's label is shown at display size: 9 characters max.
    steps: items('Process steps', 8, { label: t('Label', 9, { hint: 'One word — the active step is shown very large.' }), body: area('Description', 50) }),
    capabilities: items('Key capabilities', 6, lb(40, 70)),
    principles: items('Principles', 5, lb(30, 80))
  }),
  governance: group('Governance, Approval & Audit Trail', {
    title: lines('Governance title', 2, 60, TITLE_HINT),
    body: area('Governance body', 180),
    embedded: items('Governance in every step', 5, lb(20, 60)),
    embeddedLine: area('Governance line', 120),
    capabilities: items('Governance capabilities', 8, lb(28, 90)),
    approvalTitle: lines('Approval title', 2, 45),
    approvalBody: area('Approval body', 200),
    approvalQuestionIntro: t('Approval question intro', 50),
    approvalQuestion: t('Approval question', 50),
    approvalShows: strs('The system shows', 5, 16),
    approvalFlow: items('Approval flow example', 6, lb(20, 60)),
    approvalLine: t('Approval line', 100),
    approvalFeatures: items('Approval features', 7, lb(32, 100)),
    auditTitle: lines('Audit Trail title', 2, 45),
    auditIntro: t('Audit Trail intro', 100),
    auditFields: strs('Recorded fields', 7, 24),
    auditQuote: lines('Audit Trail quote', 2, 45),
    auditLine: area('Audit Trail line', 160)
  }),
  visibility: group('Monitoring & Reporting', {
    title: lines('Title', 2, 45, TITLE_HINT),
    intro: t('Intro', 100),
    items: strs('Visibility items', 7, 32),
    line: lines('Closing line', 2, 45)
  }),
  integration: group('Integration', {
    title: lines('Title', 2, 45, TITLE_HINT),
    intro: t('Intro', 100),
    targets: items('Integration targets', 7, lb(30, 90)),
    approachesIntro: t('Approaches intro', 40),
    approaches: strs('Approaches', 3, 24),
    line: area('Closing copy', 320)
  }),
  security: group('Security', {
    title: lines('Title', 2, 45, TITLE_HINT),
    intro: t('Intro', 60),
    quote: lines('Quote', 2, 40),
    items: items('Security items', 7, lb(24, 110))
  }),
  customization: group('Customization & Implementation', {
    title: lines('Customization title', 2, 45, TITLE_HINT),
    intro: t('Customization intro', 60),
    areas: items('Customization areas', 9, lb(28, 150)),
    line: lines('Customization line', 2, 70),
    implTitle: lines('Implementation title', 2, 40),
    phases: items('Implementation phases', 6, lb(16, 70)),
    scopeIntro: t('Scope intro', 80),
    scope: items('Implementation scope', 8, lb(36, 80)),
    implLine: t('Implementation line', 110)
  }),
  advantage: group('Why OPEN / Advantage', {
    title: lines('Title', 2, 45, TITLE_HINT),
    items: items('Advantages', 6, lb(24, 80)),
    compareTitle: lines('Comparison title', 2, 45),
    columns: strs('Comparison columns', 3, 24, 'Column'),
    rows: items('Comparison rows', 7, { label: t('Row label', 32), values: { k: 'cells', label: 'Values', n: 3, max: 28, hint: 'Per column: Ya (✓), Tidak (—) or a short text.' } }),
    compareNote: t('Comparison note', 100),
    difference: lines('Difference title', 2, 70),
    saasFlow: items('SaaS flow', 3, lb(16, 90)),
    openFlow: items('OPEN flow', 6, lb(16, 90)),
    differenceLine: lines('Difference line', 2, 40)
  }),
  cta: group('Demo CTA', {
    title: lines('Title', 2, 50, TITLE_HINT),
    body: area('Body', 240),
    line: t('Line', 70),
    pillars: strs('Pillars', 4, 30),
    challenges: strs('Form: challenge options', 6, 36, 'Option'),
    interests: items('Form: interest options', 5, { label: t('Label', 30) }, 'Option ids (used by the “Request a Demo” buttons) are set in code.')
  })
} satisfies Record<string, Extract<OpenFieldDesc, { k: 'group' }>>

export type OpenSectionKey = keyof typeof OPEN_SECTIONS
export const OPEN_SECTION_KEYS = Object.keys(OPEN_SECTIONS) as OpenSectionKey[]

// The current SEO description (185 chars) is longer than the shared 170
// default; OPEN keeps it, so its limit is 200.
export const OpenSeoSchema = SeoSchema.extend({ metaDescription: text(200, { required: true }) }).strict()

function toZod(d: OpenFieldDesc): z.ZodTypeAny {
  switch (d.k) {
    case 'text':
      return text(d.max, { required: true })
    case 'strings':
      return z.array(text(d.max, { required: true })).length(d.n, `Exactly ${d.n} items — the design holds ${d.n}.`)
    case 'items':
      return z.array(objectOf(d.fields)).length(d.n, `Exactly ${d.n} items — the design holds ${d.n}.`)
    case 'group':
      return objectOf(d.fields)
    case 'tuple':
      return z.tuple(d.items.map((g) => objectOf(g.fields)) as unknown as [z.ZodTypeAny, ...z.ZodTypeAny[]])
    case 'cells':
      return z.array(z.union([z.literal(true), z.null(), text(d.max, { required: true })])).length(d.n)
  }
}
function objectOf(fields: Record<string, OpenFieldDesc>) {
  return z.object(Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, toZod(f)]))).strict()
}

// Content values are plain JSON mirroring the field map (strings, string
// arrays, fixed arrays of objects, `true`/`null` table cells).
export type OpenValue = string | true | null | OpenValue[] | { [k: string]: OpenValue }
export type OpenContent = { [K in OpenSectionKey]: Record<string, OpenValue> } & {
  seo: { metaTitle: string; metaDescription: string; ogImage: string; canonicalUrl: string; noIndex: boolean }
}

// The keys are built from the field map, so zod can't infer them — typed
// as OpenContent explicitly.
const openContentSchema = z
  .object({
    ...Object.fromEntries(OPEN_SECTION_KEYS.map((k) => [k, toZod(OPEN_SECTIONS[k])])),
    seo: OpenSeoSchema
  })
  .strict() as unknown as z.ZodType<OpenContent>
export const OpenContentSchema = openContentSchema
export type OpenContentInput = OpenContent
export type OpenAdminState = SingletonAdminState<'open', OpenContent>

// Copies exactly the mapped fields out of `src` (legacy useOpen() data or a
// stored record) — nothing outside the map can pass through.
export function pickOpen(d: OpenFieldDesc, src: unknown): OpenValue {
  switch (d.k) {
    case 'text':
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
function pickFields(fields: Record<string, OpenFieldDesc>, src: unknown) {
  const o = (src ?? {}) as Record<string, unknown>
  return Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, pickOpen(f, o[k])]))
}

export function pickOpenContent(src: Record<string, unknown>): Omit<OpenContent, 'seo'> {
  return Object.fromEntries(OPEN_SECTION_KEYS.map((k) => [k, pickOpen(OPEN_SECTIONS[k], src[k])])) as Omit<OpenContent, 'seo'>
}

// Lays mapped CMS values over a copy of `base`, keeping every unmapped key
// (ids, module links, method codes/stages) from `base`.
export function overlayOpen(d: OpenFieldDesc, base: unknown, cms: unknown): unknown {
  switch (d.k) {
    case 'text':
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
function overlayFields(fields: Record<string, OpenFieldDesc>, base: unknown, cms: unknown) {
  const out: Record<string, unknown> = { ...((base ?? {}) as Record<string, unknown>) }
  const c = (cms ?? {}) as Record<string, unknown>
  for (const [k, f] of Object.entries(fields)) out[k] = overlayOpen(f, out[k], c[k])
  return out
}

// Seed content for an empty dev store: Lorem placeholders shaped like the map.
export function dummyOpen(d: OpenFieldDesc): OpenValue {
  const lorem = (max: number) => `[Dummy] Lorem ipsum dolor sit amet`.slice(0, max)
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
  }
}
function dummyFields(fields: Record<string, OpenFieldDesc>) {
  return Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, dummyOpen(f)]))
}

import { TechnologyContentSchema, type TechnologyContent } from '#shared/utils/technologySchema'
import { keyed, unkeyed, zodFieldErrors, type Keyed } from './useSingletonEditor'

// Form state for /admin/pages/technology (editor logic: useSingletonEditor).
// Keywords and related links are plain sub-lists inside a capability.

type Capability = TechnologyContent['capabilities']['items'][number]
type WorkItem = TechnologyContent['work']['items'][number]

export type TechnologyForm = Omit<TechnologyContent, 'capabilities' | 'work'> & {
  capabilities: Omit<TechnologyContent['capabilities'], 'items'> & { items: Keyed<Capability>[] }
  work: Omit<TechnologyContent['work'], 'items'> & { items: Keyed<WorkItem>[] }
}

export const TECHNOLOGY_TABS = [
  { key: 'hero', label: 'Hero', sections: ['hero'] },
  { key: 'capabilities', label: 'Capabilities', sections: ['capabilities'] },
  { key: 'work', label: 'Case Studies', sections: ['work'] },
  { key: 'seo', label: 'SEO', sections: ['seo'] },
  { key: 'code', label: 'Code-managed', sections: [] }
] as const

export function toTechnologyForm(c: TechnologyContent): TechnologyForm {
  // JSON round-trip: `c` is often a reactive proxy (useAsyncData).
  const copy = JSON.parse(JSON.stringify(c)) as TechnologyContent
  return {
    ...copy,
    capabilities: { ...copy.capabilities, items: keyed(copy.capabilities.items) },
    work: { ...copy.work, items: keyed(copy.work.items) }
  }
}

export function toTechnologyPayload(f: TechnologyForm) {
  return {
    ...f,
    capabilities: {
      ...f.capabilities,
      items: unkeyed(f.capabilities.items).map((i) => ({ ...i, keywords: [...i.keywords], related: i.related.map((r) => ({ ...r })) }))
    },
    work: { ...f.work, items: unkeyed(f.work.items) }
  }
}

export function validateTechnologyForm(f: TechnologyForm): Record<string, string> {
  return zodFieldErrors(TechnologyContentSchema.safeParse(toTechnologyPayload(f)))
}

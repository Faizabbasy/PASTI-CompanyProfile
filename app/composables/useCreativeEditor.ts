import { CreativeContentSchema, type CreativeContent } from '#shared/utils/creativeSchema'
import { keyed, unkeyed, zodFieldErrors, type Keyed } from './useSingletonEditor'

// Form state for /admin/pages/creative (editor logic: useSingletonEditor).
// Keywords, related links, challenge/playbook points and the Why PASTI picks
// are plain sub-lists; services, wall visuals and UI/UX picks are id lists.

type Service = CreativeContent['services']['items'][number]
type Visual = CreativeContent['wall']['visuals'][number]
type Uiux = CreativeContent['work']['uiux']['items'][number]

export type CreativeForm = Omit<CreativeContent, 'services' | 'wall' | 'work'> & {
  services: Omit<CreativeContent['services'], 'items'> & { items: Keyed<Service>[] }
  wall: Omit<CreativeContent['wall'], 'visuals'> & { visuals: Keyed<Visual>[] }
  work: Omit<CreativeContent['work'], 'uiux'> & { uiux: Omit<CreativeContent['work']['uiux'], 'items'> & { items: Keyed<Uiux>[] } }
}

export const CREATIVE_TABS = [
  { key: 'hero', label: 'Hero', sections: ['hero'] },
  { key: 'services', label: 'Services', sections: ['services'] },
  { key: 'wall', label: 'Studio Wall', sections: ['wall'] },
  { key: 'work', label: 'Selected Work', sections: ['work'] },
  { key: 'why', label: 'Why PASTI', sections: ['why'] },
  { key: 'seo', label: 'SEO', sections: ['seo'] },
  { key: 'code', label: 'Code-managed', sections: [] }
] as const

export function toCreativeForm(c: CreativeContent): CreativeForm {
  // JSON round-trip: `c` is often a reactive proxy (useAsyncData).
  const copy = JSON.parse(JSON.stringify(c)) as CreativeContent
  return {
    ...copy,
    services: { ...copy.services, items: keyed(copy.services.items) },
    wall: { ...copy.wall, visuals: keyed(copy.wall.visuals) },
    work: { ...copy.work, uiux: { ...copy.work.uiux, items: keyed(copy.work.uiux.items) } }
  }
}

export function toCreativePayload(f: CreativeForm) {
  const w = f.work
  return {
    ...f,
    services: {
      ...f.services,
      items: unkeyed(f.services.items).map((i) => ({ ...i, keywords: [...i.keywords], related: i.related.map((r) => ({ ...r })) }))
    },
    wall: { ...f.wall, visuals: unkeyed(f.wall.visuals) },
    work: {
      ...w,
      feature: { ...w.feature, challenge: [...w.feature.challenge], funnel: w.feature.funnel.map((s) => ({ ...s })), playbook: [...w.feature.playbook] },
      uiux: { ...w.uiux, items: unkeyed(w.uiux.items) }
    },
    why: { ...f.why, standardRefs: [...f.why.standardRefs], milestoneRefs: [...f.why.milestoneRefs] }
  }
}

export function validateCreativeForm(f: CreativeForm): Record<string, string> {
  return zodFieldErrors(CreativeContentSchema.safeParse(toCreativePayload(f)))
}

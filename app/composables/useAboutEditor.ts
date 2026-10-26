import { AboutContentSchema, type AboutAdminState, type AboutContent } from '#shared/utils/aboutSchema'
import { keyed, unkeyed, zodFieldErrors, tabForPathIn, type Keyed } from './useSingletonEditor'

// Form state for /admin/pages/about (editor logic: useSingletonEditor).
export type AboutForm = Omit<AboutContent, 'values' | 'milestones' | 'proof' | 'leadership' | 'mission'> & {
  mission: Omit<AboutContent['mission'], 'points'> & { points: Keyed<AboutContent['mission']['points'][number]>[] }
  values: Keyed<AboutContent['values'][number]>[]
  milestones: Keyed<AboutContent['milestones'][number]>[]
  proof: Keyed<AboutContent['proof'][number]>[]
  leadership: Keyed<AboutContent['leadership'][number]>[]
}

export interface AboutStateResponse {
  state: AboutAdminState
  revision: number
  changedSections?: string[]
}

export const ABOUT_TABS = [
  { key: 'hero', label: 'Hero', sections: ['hero'] },
  { key: 'story', label: 'Company Story', sections: ['story'] },
  { key: 'vm', label: 'Vision & Mission', sections: ['vision', 'mission'] },
  { key: 'values', label: 'Values', sections: ['values'] },
  { key: 'milestones', label: 'Milestones', sections: ['milestones'] },
  { key: 'proof', label: 'Company Proof', sections: ['proof'] },
  { key: 'leadership', label: 'Leadership', sections: ['leadership'] },
  { key: 'cta', label: 'CTA', sections: ['cta'] },
  { key: 'seo', label: 'SEO', sections: ['seo'] }
] as const
export type AboutTabKey = (typeof ABOUT_TABS)[number]['key']

export function toAboutForm(c: AboutContent): AboutForm {
  // JSON round-trip, not structuredClone: `c` is often a reactive proxy
  // (useAsyncData), which structuredClone refuses. Content is plain JSON.
  const copy = JSON.parse(JSON.stringify(c)) as AboutContent
  return {
    ...copy,
    mission: { ...copy.mission, points: keyed(copy.mission.points) },
    values: keyed(copy.values),
    milestones: keyed(copy.milestones),
    proof: keyed(copy.proof),
    leadership: keyed(copy.leadership)
  }
}

export function toAboutPayload(f: AboutForm) {
  return {
    ...f,
    story: { ...f.story, paragraphs: [...f.story.paragraphs] },
    mission: { ...f.mission, points: unkeyed(f.mission.points) },
    values: unkeyed(f.values),
    milestones: unkeyed(f.milestones),
    proof: unkeyed(f.proof),
    leadership: unkeyed(f.leadership)
  }
}

// Same schema the server enforces; returns { 'hero.headline': 'Required.' }.
export function validateAboutForm(f: AboutForm): Record<string, string> {
  return zodFieldErrors(AboutContentSchema.safeParse(toAboutPayload(f)))
}

export function tabForPath(path: string): AboutTabKey | null {
  return tabForPathIn(ABOUT_TABS, path) as AboutTabKey | null
}

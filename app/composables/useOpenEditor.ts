import { OpenContentSchema, type OpenContent } from '#shared/utils/openSchema'
import { zodFieldErrors } from './useSingletonEditor'

// Form state for /admin/products/open (editor logic: useSingletonEditor).
// No repeaters: every list has the fixed item count of the current design.

export type OpenForm = OpenContent

export const OPEN_TABS = [
  { key: 'hero', label: 'Hero', sections: ['hero'] },
  { key: 'problem', label: 'Problem & SaaS', sections: ['problem', 'notSaas'] },
  { key: 'framework', label: 'Framework & Ecosystem', sections: ['framework', 'ecosystem'] },
  { key: 'modules', label: 'Modules', sections: ['modulesIntro', 'procurement', 'vendor', 'catalog'] },
  { key: 'auction', label: 'e-Auction', sections: ['auction'] },
  { key: 'governance', label: 'Governance & Audit', sections: ['governance'] },
  { key: 'systems', label: 'Monitoring · Integration · Security', sections: ['visibility', 'integration', 'security'] },
  { key: 'customization', label: 'Customization & Implementation', sections: ['customization'] },
  { key: 'advantage', label: 'Why OPEN', sections: ['advantage'] },
  { key: 'cta', label: 'Demo CTA', sections: ['cta'] },
  { key: 'seo', label: 'SEO', sections: ['seo'] },
  { key: 'code', label: 'Code-managed', sections: [] }
] as const

export function toOpenForm(c: OpenContent): OpenForm {
  // JSON round-trip: `c` is often a reactive proxy (useAsyncData).
  return JSON.parse(JSON.stringify(c)) as OpenContent
}

export function toOpenPayload(f: OpenForm) {
  return JSON.parse(JSON.stringify(f)) as OpenContent
}

export function validateOpenForm(f: OpenForm): Record<string, string> {
  return zodFieldErrors(OpenContentSchema.safeParse(toOpenPayload(f)))
}

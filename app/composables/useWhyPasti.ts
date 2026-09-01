export interface WhyPastiMetric {
  index: string
  value: string
  label: string
  icon: string
}

const ICON_TROPHY =
  '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0V4zM7 5H4v1a3 3 0 003 3M17 5h3v1a3 3 0 01-3 3" /></svg>'

const ICON_BRIEFCASE =
  '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16v11a1 1 0 01-1 1H5a1 1 0 01-1-1V8zM8 8V6a2 2 0 012-2h4a2 2 0 012 2v2M4 13h16" /></svg>'

const ICON_LAYERS =
  '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" /></svg>'

/**
 * Why PASTI metrics, per .docs/PASTI_Cuberto_Template_Content_Mapping.docx section 07 — WHY PASTI.
 *
 * Per client request, the "2020 / Established" metric was dropped entirely (was
 * metric 01), "Projects delivered" was bumped from 70+ to 100+, and both remaining
 * text-only metrics were reformatted to the same large-value/small-label shape as
 * the numeric ones instead of a single descriptive sentence.
 *
 * Icons are generic/symbolic (trophy, briefcase, layers) matching each metric's
 * meaning, not invented PASTI branding — same approach Cuberto's own card grid uses.
 */
export function useWhyPasti() {
  const metrics: WhyPastiMetric[] = [
    { index: '01', value: '100+', label: 'Projects delivered', icon: ICON_TROPHY },
    { index: '02', value: '50+', label: 'Clients across industries with impact', icon: ICON_BRIEFCASE },
    { index: '03', value: 'CORE', label: 'Technology + Creative under one roof by PASTI', icon: ICON_LAYERS }
  ]

  return { metrics }
}

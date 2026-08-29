export interface WhyPastiMetric {
  index: string
  value: string
  label: string
  icon: string
}

const ICON_STAR =
  '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l2.4 5.8 6.1.5-4.7 4 1.5 6-5.3-3.3-5.3 3.3 1.5-6-4.7-4 6.1-.5L12 3z" /></svg>'

const ICON_TROPHY =
  '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0V4zM7 5H4v1a3 3 0 003 3M17 5h3v1a3 3 0 01-3 3" /></svg>'

const ICON_BRIEFCASE =
  '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16v11a1 1 0 01-1 1H5a1 1 0 01-1-1V8zM8 8V6a2 2 0 012-2h4a2 2 0 012 2v2M4 13h16" /></svg>'

const ICON_LAYERS =
  '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" /></svg>'

/**
 * Why PASTI metrics, per .docs/PASTI_Cuberto_Template_Content_Mapping.docx section 07 — WHY PASTI.
 *
 * Metric 01's "REPLACE WITH" value is literally truncated in the source doc ("202",
 * with a matching "3 / 3" character count) — the full value "2020" was confirmed
 * directly by the client rather than guessed. Metrics 03/04 are single descriptive
 * sentences in the doc (no separate value/label rows) — `value` is left empty and
 * `label` carries the full sentence verbatim, to avoid inventing a split the source
 * doesn't have.
 *
 * Icons are generic/symbolic (star, trophy, briefcase, layers) matching each metric's
 * meaning, not invented PASTI branding — same approach Cuberto's own card grid uses.
 */
export function useWhyPasti() {
  const metrics: WhyPastiMetric[] = [
    { index: '01', value: '2020', label: 'Established', icon: ICON_STAR },
    { index: '02', value: '70+', label: 'Projects delivered', icon: ICON_TROPHY },
    { index: '03', value: '', label: '50+ clients across industries with impact', icon: ICON_BRIEFCASE },
    { index: '04', value: '', label: 'Technology + Creative under one roof by PASTI', icon: ICON_LAYERS }
  ]

  return { metrics }
}

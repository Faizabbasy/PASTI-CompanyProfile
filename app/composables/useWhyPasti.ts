export interface WhyPastiMetric {
  index: string
  value: string
  label: string
}

/**
 * Why PASTI metrics, per .docs/PASTI_Cuberto_Template_Content_Mapping.docx section 07 — WHY PASTI.
 *
 * Metric 01's "REPLACE WITH" value is literally truncated in the source doc ("202",
 * with a matching "3 / 3" character count) — the full value "2020" was confirmed
 * directly by the client rather than guessed. Metrics 03/04 are single descriptive
 * sentences in the doc (no separate value/label rows) — `value` is left empty and
 * `label` carries the full sentence verbatim, to avoid inventing a split the source
 * doesn't have.
 */
export function useWhyPasti() {
  const metrics: WhyPastiMetric[] = [
    { index: '01', value: '2020', label: 'Established' },
    { index: '02', value: '70+', label: 'Projects delivered' },
    { index: '03', value: '', label: '50+ clients across industries with impact' },
    { index: '04', value: '', label: 'Technology + Creative under one roof by PASTI' }
  ]

  return { metrics }
}
